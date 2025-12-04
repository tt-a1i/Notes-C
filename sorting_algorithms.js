// Bubble Sort
function bubbleSort(inputArray) {
    const steps = [];
    const array = [...inputArray]; // Work on a copy
    const n = array.length;

    if (n <= 1) {
        steps.push({ type: 'compare', indices: [], arrayState: [...array] }); // Show initial state if tiny
        for(let i=0; i<n; ++i) steps.push({type: 'sorted', index: i, arrayState: [...array]});
        return steps;
    }

    for (let i = 0; i < n - 1; i++) {
        let swapped = false;
        for (let j = 0; j < n - i - 1; j++) {
            // Step: Comparing elements
            steps.push({ type: 'compare', indices: [j, j + 1], arrayState: [...array] });

            if (array[j] > array[j + 1]) {
                // Perform swap
                [array[j], array[j + 1]] = [array[j + 1], array[j]];
                swapped = true;
                // Step: Elements swapped
                steps.push({ type: 'swap', indices: [j, j + 1], arrayState: [...array] });
            }
        }
        // After each pass, the last element of the unsorted part is sorted
        steps.push({ type: 'sorted', index: n - 1 - i, arrayState: [...array] });

        // If no two elements were swapped by inner loop, then break
        if (!swapped) {
            // Mark all remaining elements as sorted if no swaps in a full pass
            for (let k = 0; k < n - 1 - i; k++) {
                 if (!steps.find(s => s.type === 'sorted' && s.index === k)) { // Avoid duplicate sorted markers
                    steps.push({ type: 'sorted', index: k, arrayState: [...array] });
                }
            }
            break;
        }
    }
    // Ensure the very first element is marked as sorted if not already by the loop logic
    // (especially for nearly sorted or small arrays)
    if (!steps.find(s => s.type === 'sorted' && s.index === 0) && n > 0) {
         steps.push({ type: 'sorted', index: 0, arrayState: [...array] });
    }

    return steps;
}

// Selection Sort
function selectionSort(inputArray) {
    const steps = [];
    const array = [...inputArray];
    const n = array.length;

    if (n <= 1) {
        // For n=0 or n=1, array is already sorted or empty.
        // Mark all elements as sorted.
        for (let i = 0; i < n; i++) {
            steps.push({ type: 'sorted', index: i, arrayState: [...array] });
        }
        return steps;
    }

    for (let i = 0; i < n - 1; i++) {
        let minIndex = i;
        // Step: Highlight the current element being considered as the start of the unsorted part,
        // and as a potential candidate for the minimum.
        steps.push({ type: 'highlight_min_search_start', index: i, arrayState: [...array] });

        for (let j = i + 1; j < n; j++) {
            // Step: Comparing current element with the current minimum candidate.
            steps.push({ type: 'compare', indices: [j, minIndex], arrayState: [...array] });
            if (array[j] < array[minIndex]) {
                minIndex = j;
                // Step: New minimum candidate found. Highlight it.
                steps.push({ type: 'highlight_new_min', index: minIndex, arrayState: [...array] });
            }
        }

        if (minIndex !== i) {
            // Step: Swap the found minimum element with the first element of the unsorted part.
            // (arrayState will be captured after the swap)
            [array[i], array[minIndex]] = [array[minIndex], array[i]];
            steps.push({ type: 'swap', indices: [i, minIndex], arrayState: [...array] });
        }
        // Step: Element at index 'i' is now sorted.
        // These individual 'sorted' steps might be replaced by a final sweep.
        // steps.push({ type: 'sorted', index: i, arrayState: [...array] });
    }
    // The last element is sorted by default after the loop finishes.
    // if (n > 0) {
    //   steps.push({ type: 'sorted', index: n - 1, arrayState: [...array] });
    // }
    
    // Consolidate sorted steps at the end for clean visualization:
    // Remove any intermediate 'sorted' markers if any were added.
    const nonFinalSortedSteps = steps.filter(step => step.type !== 'sorted');
    const finalSortedSteps = [];
    for(let k=0; k<n; ++k) {
        finalSortedSteps.push({type: 'sorted', index: k, arrayState: [...array]});
    }
    return [...nonFinalSortedSteps, ...finalSortedSteps];
}

// Insertion Sort
function insertionSort(inputArray) {
    const steps = [];
    const array = [...inputArray];
    const n = array.length;

    if (n <= 1) {
        for (let i = 0; i < n; i++) {
            steps.push({ type: 'sorted', index: i, arrayState: [...array] });
        }
        return steps;
    }
    
    // The first element (index 0) can be considered trivially sorted.
    // steps.push({ type: 'sorted', index: 0, arrayState: [...array] });

    for (let i = 1; i < n; i++) {
        let key = array[i];
        let j = i - 1;
        // Step: Select the key element to be inserted into the sorted portion.
        steps.push({ type: 'highlight_key', index: i, keyValue: key, arrayState: [...array] });

        // Compare key with each element on the left of it until an element smaller than it is found.
        while (j >= 0 && array[j] > key) {
            // Step: Comparing key with array[j]. If array[j] > key, it needs to be shifted.
            steps.push({ type: 'compare_shift', indices: [j, i], currentKeyIndex: i, keyValue: key, arrayState: [...array] });
            array[j + 1] = array[j]; // Shift element to the right
            // Step: Element array[j] has been shifted to array[j+1].
            steps.push({ type: 'overwrite', index: j + 1, value: array[j+1], shiftedFrom:j,  arrayState: [...array] });
            j--;
        }
        // Place key at its correct position in sorted subarray.
        array[j + 1] = key;
        // Step: Key element is inserted at its correct position.
        steps.push({ type: 'insert', index: j + 1, value: key, arrayState: [...array] });
        
        // Elements from 0 to i are now sorted.
        // No need for intermediate 'sorted' steps here; final sweep is better.
    }

    // Consolidate sorted steps at the end:
    const nonFinalSortedSteps = steps.filter(step => step.type !== 'sorted');
    const finalSortedSteps = [];
    for(let k=0; k<n; ++k) {
        finalSortedSteps.push({type: 'sorted', index: k, arrayState: [...array]});
    }
    return [...nonFinalSortedSteps, ...finalSortedSteps];
}

// Merge Sort
function mergeSort(inputArray) {
    const steps = [];
    const array = [...inputArray]; // Work on a copy for the actual sorting
    const n = array.length;

    if (n <= 1) {
        if (n === 1) steps.push({ type: 'sorted', index: 0, arrayState: [...array] });
        return steps;
    }

    // Initial state for visualization if needed, though merge sort is complex to show initial highlights
    // steps.push({ type: 'info', message: 'Starting Merge Sort', arrayState: [...array] });

    mergeSortRecursive(array, 0, n - 1, steps, [...inputArray] /* Pass a stable original for arrayState reference */);

    // Mark all elements as sorted at the very end
    // The array is now sorted, take the final state.
    const finalArrayState = [...array];
    for (let i = 0; i < n; i++) {
        steps.push({ type: 'sorted', index: i, arrayState: finalArrayState });
    }

    return steps;
}

function mergeSortRecursive(array, left, right, steps, originalSnapshotForState) {
    if (left >= right) {
        return;
    }
    const mid = Math.floor((left + right) / 2);
    mergeSortRecursive(array, left, mid, steps, originalSnapshotForState);
    mergeSortRecursive(array, mid + 1, right, steps, originalSnapshotForState);
    merge(array, left, mid, right, steps, originalSnapshotForState);
}

function merge(array, left, mid, right, steps, originalSnapshotForState) {
    const leftArraySize = mid - left + 1;
    const rightArraySize = right - mid;

    const L = new Array(leftArraySize);
    const R = new Array(rightArraySize);

    // Copy data to temporary subarrays L[] and R[]
    for (let i = 0; i < leftArraySize; i++) L[i] = array[left + i];
    for (let j = 0; j < rightArraySize; j++) R[j] = array[mid + 1 + j];
    
    // These are local indices for L and R subarrays
    let i = 0; // Initial index of first subarray
    let j = 0; // Initial index of second subarray
    // This is the global index for the main array
    let k = left; // Initial index of merged subarray

    // Temporary array state for this merge operation, based on current state of `array`
    // This is tricky because arrayState should ideally be the state of the *original* array structure.
    // For merge sort, it's often better to show the "auxiliary array" or the segment being merged.
    // Let's assume arrayState in steps will reflect the main `array` being modified.

    while (i < leftArraySize && j < rightArraySize) {
        // Indices for comparison are (left + i) and (mid + 1 + j) in the main array
        steps.push({
            type: 'compare',
            indices: [left + i, mid + 1 + j], // Global indices being compared
            values: [L[i], R[j]],
            arrayState: [...array] // State of the main array before potential overwrite
        });

        if (L[i] <= R[j]) {
            // Element from Left subarray is chosen
            steps.push({
                type: 'overwrite',
                index: k, // Global index in main array where element is placed
                value: L[i],
                // originalValue: array[k], // The value at array[k] before overwrite
                arrayState: [...array.slice(0, k), L[i], ...array.slice(k + 1)] // Array state *after* this specific overwrite
            });
            array[k] = L[i];
            i++;
        } else {
            // Element from Right subarray is chosen
            steps.push({
                type: 'overwrite',
                index: k, // Global index in main array
                value: R[j],
                // originalValue: array[k],
                arrayState: [...array.slice(0, k), R[j], ...array.slice(k + 1)] // Array state *after* this specific overwrite
            });
            array[k] = R[j];
            j++;
        }
        k++;
    }

    // Copy remaining elements of L[], if any
    while (i < leftArraySize) {
        steps.push({
            type: 'overwrite',
            index: k,
            value: L[i],
            // originalValue: array[k],
            arrayState: [...array.slice(0, k), L[i], ...array.slice(k + 1)]
        });
        array[k] = L[i];
        i++;
        k++;
    }

    // Copy remaining elements of R[], if any
    while (j < rightArraySize) {
        steps.push({
            type: 'overwrite',
            index: k,
            value: R[j],
            // originalValue: array[k],
            arrayState: [...array.slice(0, k), R[j], ...array.slice(k + 1)]
        });
        array[k] = R[j];
        j++;
        k++;
    }
}

// Quick Sort
function quickSort(inputArray) {
    const steps = [];
    const array = [...inputArray]; // Work on a copy for the actual sorting
    const n = array.length;

    if (n <= 1) {
        if (n === 1) steps.push({ type: 'sorted', index: 0, arrayState: [...array] });
        // For n=0, no steps. For n=1, it's already sorted.
        // It's good practice to mark all elements as sorted if the algorithm guarantees it
        // For QuickSort, the recursive calls handle sub-arrays, and then we mark them.
        // Here, we ensure that even if it's a small array, it's marked.
        for(let i=0; i<n; ++i) { // This loop will run 0 or 1 time
            if (!steps.find(s => s.type === 'sorted' && s.index === i)) {
                 steps.push({ type: 'sorted', index: i, arrayState: [...array] });
            }
        }
        return steps;
    }

    quickSortRecursive(array, 0, n - 1, steps);
    
    // After all partitioning, elements are in sorted order.
    // Mark any element not yet marked as 'sorted' by the partition logic.
    // The partition function marks pivots as sorted. Other elements are sorted by virtue of the algorithm.
    const finalArrayState = [...array];
    for (let i = 0; i < n; i++) {
        // Check if this index was already marked as sorted (typically pivots)
        // Only add a 'sorted' step if not already marked to avoid redundancy
        const isAlreadyMarkedSorted = steps.some(step => step.type === 'sorted' && step.index === i && step.arrayState.every((val, idx) => val === finalArrayState[idx]));
        if (!isAlreadyMarkedSorted) {
            steps.push({ type: 'sorted', index: i, arrayState: finalArrayState });
        }
    }
     // Ensure all elements are marked sorted, especially if the recursive calls didn't cover all due to optimizations or structure.
    // A final pass to explicitly mark all elements based on the final sorted array can be helpful for visualization consistency.
    const finalSortedExplicitSteps = [];
    for(let i=0; i<n; ++i) {
        finalSortedExplicitSteps.push({type: 'sorted', index: i, arrayState: [...array]});
    }
    // A bit heavy-handed, but ensures visualization shows all green at the end.
    // Consider removing earlier 'sorted' steps if this final sweep is preferred.
    // For now, let's keep it like this and refine if step list becomes too noisy.
    // Replace previous sorted steps with this comprehensive one for cleaner end state.
    const nonFinalSortedSteps = steps.filter(step => step.type !== 'sorted');
    
    return [...nonFinalSortedSteps, ...finalSortedExplicitSteps];
}

function quickSortRecursive(array, low, high, steps) {
    if (low < high) {
        const pivotIndex = partition(array, low, high, steps);
        // Element at pivotIndex is now in its final sorted place for this partition
        // It's marked as 'sorted' within the partition function.

        quickSortRecursive(array, low, pivotIndex - 1, steps);
        quickSortRecursive(array, pivotIndex + 1, high, steps);
    } else if (low === high) {
        // Base case for recursion: single element is considered sorted in its current context
        // Only add if not already marked to avoid duplicates if partition logic already handled it
        if (!steps.find(s => s.type === 'sorted' && s.index === low)) {
             steps.push({ type: 'sorted', index: low, arrayState: [...array] });
        }
    }
}

function partition(array, low, high, steps) {
    const pivotValue = array[high]; // Choosing the last element as pivot
    steps.push({ type: 'pivot', index: high, arrayState: [...array] });

    let i = low - 1; // Index of smaller element

    for (let j = low; j < high; j++) {
        steps.push({ type: 'compare', indices: [j, high], arrayState: [...array] });
        if (array[j] < pivotValue) {
            i++;
            // Swap array[i] and array[j]
            [array[i], array[j]] = [array[j], array[i]];
            steps.push({ type: 'swap', indices: [i, j], arrayState: [...array] });
        }
    }

    // Swap array[i+1] and array[high] (pivot)
    // This places the pivot in its correct sorted position in this partition
    [array[i + 1], array[high]] = [array[high], array[i + 1]];
    const pivotFinalIndex = i + 1;
    steps.push({ type: 'swap', indices: [pivotFinalIndex, high], arrayState: [...array] });
    
    // The pivot is now sorted relative to this partition
    steps.push({ type: 'sorted', index: pivotFinalIndex, arrayState: [...array] });

    return pivotFinalIndex;
}

// Heap Sort Helper: heapify
function heapify(array, n, i, steps) {
    let largest = i; // Initialize largest as root
    let left = 2 * i + 1; 
    let right = 2 * i + 2;

    // Step: Considering node 'i' as a potential root of a heap/subtree.
    // Children are left and right. Highlight node 'i'.
    steps.push({ type: 'heapify_node_check', index: i, children: [left, right], heapSize: n, arrayState: [...array]});

    // If left child exists and is larger than root
    if (left < n) {
        // Step: Compare root with left child.
        steps.push({ type: 'compare', indices: [left, largest], arrayState: [...array] });
        if (array[left] > array[largest]) {
            largest = left;
        }
    }

    // If right child exists and is larger than largest so far
    if (right < n) {
        // Step: Compare current largest (either root or left child) with right child.
        steps.push({ type: 'compare', indices: [right, largest], arrayState: [...array] });
        if (array[right] > array[largest]) {
            largest = right;
        }
    }

    // If largest is not root
    if (largest !== i) {
        // Step: Swap root with the largest child.
        [array[i], array[largest]] = [array[largest], array[i]];
        steps.push({ type: 'swap', indices: [i, largest], arrayState: [...array] });
        // Recursively heapify the affected sub-tree (where the original root was swapped to).
        heapify(array, n, largest, steps);
    }
}

// Heap Sort
function heapSort(inputArray) {
    const steps = [];
    const array = [...inputArray];
    const n = array.length;

    if (n <= 1) {
        for (let i = 0; i < n; i++) {
            steps.push({ type: 'sorted', index: i, arrayState: [...array] });
        }
        return steps;
    }

    // Build heap (rearrange array)
    // Start from the last non-leaf node and go up to the root.
    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
        heapify(array, n, i, steps);
    }

    // One by one extract an element from heap
    for (let i = n - 1; i > 0; i--) {
        // Move current root (max element in the current heap) to the end of the array segment.
        // This places the largest element in its sorted position.
        [array[0], array[i]] = [array[i], array[0]];
        // Step: Swap root of heap with the element at the end of the current heap range.
        steps.push({ type: 'swap', indices: [0, i], arrayState: [...array] });
        
        // Step: The element now at index 'i' is in its final sorted position.
        // steps.push({ type: 'sorted', index: i, arrayState: [...array] }); 
        // (Defer to final sweep for 'sorted' state)

        // Call max heapify on the reduced heap (size 'i').
        // Root of this reduced heap is at index 0.
        heapify(array, i, 0, steps);
    }
    
    // The first element (index 0) is also sorted by now (it's the smallest or only remaining element).
    // if (n > 0) {
    //    steps.push({ type: 'sorted', index: 0, arrayState: [...array] });
    // }
    
    // Consolidate sorted steps at the end for clean visualization:
    const nonFinalSortedSteps = steps.filter(step => step.type !== 'sorted');
    const finalSortedSteps = [];
    for(let k=0; k<n; ++k) {
        finalSortedSteps.push({type: 'sorted', index: k, arrayState: [...array]});
    }
    return [...nonFinalSortedSteps, ...finalSortedSteps];
}
