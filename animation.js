// Function to generate an array of random numbers
function generateRandomArray(size, maxVal = 100) {
    const array = [];
    for (let i = 0; i < size; i++) {
        array.push(Math.floor(Math.random() * maxVal) + 1);
    }
    return array;
}

// Function to draw the array elements as bars
function drawArray(array, container, highlightConfig = {}) {
    if (!container) {
        console.error("Animation container not found!");
        return;
    }
    container.innerHTML = ''; // Clear previous bars

    const maxBarHeight = container.clientHeight * 0.95; // Use 95% of container height
    const barWidthPercentage = 100 / array.length;
    const maxValue = Math.max(...array, 1); // Avoid division by zero

    array.forEach((value, index) => {
        const bar = document.createElement('div');
        bar.classList.add('bar');
        bar.style.height = `${Math.max((value / maxValue) * maxBarHeight, 5)}px`; // min height 5px
        bar.style.width = `calc(${barWidthPercentage}% - 2px)`;
        bar.style.display = 'inline-block';
        bar.style.margin = '0 1px';

        // Default color
        bar.style.backgroundColor = '#007bff'; // Bootstrap primary blue

        // Apply highlights based on highlightConfig
        // Sorted should take precedence
        if (highlightConfig.sorted && highlightConfig.sorted.includes(index)) {
            bar.style.backgroundColor = '#28a745'; // Green for sorted
        } else if (highlightConfig.selectionOuterI && highlightConfig.selectionOuterI.includes(index)) {
            bar.style.backgroundColor = '#BF94E4'; // Light Purple for Selection Sort 'i' index (current position to fill)
        } else if (highlightConfig.swap && highlightConfig.swap.includes(index)) {
            bar.style.backgroundColor = '#dc3545'; // Red for swap
        } else if (highlightConfig.newMin && highlightConfig.newMin.includes(index)) { 
            // Highlight for the current minimum found in Selection Sort's inner loop
            bar.style.backgroundColor = '#e83e8c'; // Pink for new min found
        } else if (highlightConfig.compare && highlightConfig.compare.includes(index)) {
            bar.style.backgroundColor = '#ffc107'; // Yellow for compare
        } else if (highlightConfig.pivot && highlightConfig.pivot.includes(index)) {
            bar.style.backgroundColor = '#fd7e14'; // Orange for pivot
        } else if (highlightConfig.key && highlightConfig.key.includes(index)) {
            bar.style.backgroundColor = '#6f42c1'; // Purple for key (Insertion Sort)
        } else if (highlightConfig.overwrite && highlightConfig.overwrite.includes(index)) {
            bar.style.backgroundColor = '#17a2b8'; // Info/Teal for overwrite (Merge Sort)
        } else if (highlightConfig.minSearch && highlightConfig.minSearch.includes(index)) { 
            // This is the old 'minSearch' for the initial candidate in Selection Sort, can be same as compare or distinct.
            // If selectionOuterI is used, this might be less prominent or merged with 'compare'.
            // For now, keeping it distinct if explicitly set.
            bar.style.backgroundColor = '#6c757d'; // Secondary grey for min search candidate
        } else if (highlightConfig.heapify && highlightConfig.heapify.includes(index)) {
            bar.style.backgroundColor = '#20c997'; // Cyan for heapify operations
        }

        // Add text label for the value (optional, good for small arrays)
        if (array.length <= 25) {
            const textLabel = document.createElement('span');
            textLabel.classList.add('bar-label');
            textLabel.textContent = value;
            bar.appendChild(textLabel);
        }
        container.appendChild(bar);
    });
}

// Event listener setup when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    const animationContainer = document.getElementById('animation-container');
    
    // Control Elements
    const algorithmSelect = document.getElementById('algorithm');
    const arraySizeSlider = document.getElementById('array-size');
    const generateArrayBtn = document.getElementById('generate-array');
    const startSortBtn = document.getElementById('start-sort');
    const pauseSortBtn = document.getElementById('pause-sort');
    const resetSortBtn = document.getElementById('reset-sort');
    const speedSlider = document.getElementById('speed-slider');

    // Global Animation State
    let currentUnsortedArray = []; 
    let animationSteps = [];
    let currentStepIndex = 0;
    let isPlaying = false;
    let timeoutId = null;
    let allSortedIndices = []; 
    let selectionSortOuterLoopIndex = null; // For persistent highlight of 'i' in Selection Sort


    const DEFAULT_ARRAY_SIZE = 50;
    const MAX_SPEED_DELAY = 1000; 
    const MIN_SPEED_DELAY = 10;   

    function getAnimationSpeed() {
        const speedValue = parseInt(speedSlider.value) || 5; 
        return MAX_SPEED_DELAY - ((speedValue - 1) / 9) * (MAX_SPEED_DELAY - MIN_SPEED_DELAY);
    }
    
    function resetAnimationState() {
        isPlaying = false;
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = null;
        currentStepIndex = 0;
        animationSteps = [];
        allSortedIndices = [];
        selectionSortOuterLoopIndex = null; // Reset for Selection Sort outer loop 'i' tracking
        pauseSortBtn.textContent = 'Pause';
        startSortBtn.disabled = false;
        generateArrayBtn.disabled = false;
        arraySizeSlider.disabled = false;
        algorithmSelect.disabled = false;
    }

    function initializeArray(forceNew = true) {
        resetAnimationState();
        const size = parseInt(arraySizeSlider.value) || DEFAULT_ARRAY_SIZE;
        if (forceNew || currentUnsortedArray.length !== size) { 
             currentUnsortedArray = generateRandomArray(size);
        }
        drawArray(currentUnsortedArray, animationContainer, { sorted: [] });
    }

    function processStep(step) {
        if (!step) return;

        let highlightConfig = { sorted: [...allSortedIndices] }; 
        let arrayToDraw = [...step.arrayState];
        const currentAlgorithm = algorithmSelect.value;

        // Persist selection sort outer loop 'i' highlight if active
        if (selectionSortOuterLoopIndex !== null && currentAlgorithm === 'selection') {
            highlightConfig.selectionOuterI = [selectionSortOuterLoopIndex];
        }

        switch (step.type) {
            case 'compare':
                highlightConfig.compare = [...step.indices];
                // For selection sort, ensure minIndex (one of step.indices) is highlighted as 'compare'
                // while selectionOuterI is already set.
                break;
            case 'swap':
                highlightConfig.swap = [...step.indices];
                if (currentAlgorithm === 'selection' && step.indices.includes(selectionSortOuterLoopIndex)) {
                    // The element at selectionSortOuterLoopIndex is now sorted.
                    // The 'sorted' highlight will take over in the next step for this index.
                    // No need to clear selectionSortOuterLoopIndex here, as it's managed by 'sorted' or next 'highlight_min_search_start'.
                }
                break;
            case 'overwrite': 
                highlightConfig.overwrite = [step.index];
                break;
            case 'pivot': 
                highlightConfig.pivot = [step.index];
                break;
            case 'sorted':
                if (!allSortedIndices.includes(step.index)) {
                    allSortedIndices.push(step.index);
                }
                highlightConfig.sorted = [...allSortedIndices]; 
                if (step.index === selectionSortOuterLoopIndex) {
                    selectionSortOuterLoopIndex = null; // This 'i' is now sorted.
                }
                break;
            
            // Selection Sort specific
            case 'highlight_min_search_start': // Marks the 'i' in Selection Sort
                selectionSortOuterLoopIndex = step.index;
                highlightConfig.selectionOuterI = [selectionSortOuterLoopIndex];
                // Also highlight 'i' as the initial minIndex candidate using 'minSearch' or 'newMin' color
                highlightConfig.minSearch = [step.index]; 
                break;
            case 'highlight_new_min': // Marks the new 'minIndex' in Selection Sort
                highlightConfig.newMin = [step.index]; // Highlight new minIndex
                // selectionOuterI highlight is already persisted from the start of processStep
                break;

            // Insertion Sort specific
            case 'highlight_key':
                highlightConfig.key = [step.index];
                break;
            case 'compare_shift':
                highlightConfig.compare = [step.indices[0]]; 
                highlightConfig.key = [step.currentKeyIndex]; 
                break;
            case 'insert':
                highlightConfig.key = [step.index]; 
                break;

            // Heap Sort specific
            case 'heapify_node_check':
                highlightConfig.heapify = [step.index];
                if(step.children){ 
                    highlightConfig.compare = step.children.filter(c => c < step.heapSize);
                }
                break;
            // isHeapSortEndSwap was removed from sorting_algorithms.js, so no special case needed here.

            default:
                // console.warn('Unknown step type:', step.type);
                break;
        }
        drawArray(arrayToDraw, animationContainer, highlightConfig);
    }

    function animateNextStep() {
        if (!isPlaying || currentStepIndex >= animationSteps.length) {
            isPlaying = false;
            pauseSortBtn.textContent = 'Pause';
            startSortBtn.disabled = false; 
            generateArrayBtn.disabled = false;
            arraySizeSlider.disabled = false;
            algorithmSelect.disabled = false;
            if(animationSteps.length > 0 && currentStepIndex >= animationSteps.length){
                const lastState = animationSteps[animationSteps.length-1].arrayState;
                allSortedIndices = lastState.map((_,idx) => idx); 
                drawArray(lastState, animationContainer, {sorted: [...allSortedIndices]});
            }
            selectionSortOuterLoopIndex = null; // Clear selection sort 'i' when animation ends/resets
            return;
        }

        processStep(animationSteps[currentStepIndex]);
        currentStepIndex++;
        timeoutId = setTimeout(animateNextStep, getAnimationSpeed());
    }

    // Event Listeners
    generateArrayBtn.addEventListener('click', () => initializeArray(true));
    arraySizeSlider.addEventListener('input', () => initializeArray(true)); 

    startSortBtn.addEventListener('click', () => {
        if (isPlaying) return; 

        resetAnimationState(); 
        
        const selectedAlgorithmName = algorithmSelect.value;
        let sortFunction;

        switch (selectedAlgorithmName) {
            case 'bubble': sortFunction = bubbleSort; break;
            case 'selection': sortFunction = selectionSort; break;
            case 'insertion': sortFunction = insertionSort; break;
            case 'merge': sortFunction = mergeSort; break;
            case 'quick': sortFunction = quickSort; break;
            case 'heap': sortFunction = heapSort; break;
            default: console.error('Unknown algorithm:', selectedAlgorithmName); return;
        }
        
        if(currentUnsortedArray.length === 0) initializeArray(true);

        animationSteps = sortFunction([...currentUnsortedArray]); // Pass a copy
        
        if (animationSteps && animationSteps.length > 0) {
            isPlaying = true;
            startSortBtn.disabled = true; 
            generateArrayBtn.disabled = true;
            arraySizeSlider.disabled = true;
            algorithmSelect.disabled = true;
            animateNextStep();
        }
    });

    pauseSortBtn.addEventListener('click', () => {
        if (animationSteps.length === 0) return;

        if (isPlaying) {
            isPlaying = false;
            if (timeoutId) clearTimeout(timeoutId);
            pauseSortBtn.textContent = 'Resume';
        } else {
            isPlaying = true;
            pauseSortBtn.textContent = 'Pause';
            animateNextStep(); 
        }
    });

    resetSortBtn.addEventListener('click', () => {
        initializeArray(true); 
    });
    
    speedSlider.addEventListener('input', () => {
        // Speed change will be picked up by the next setTimeout in animateNextStep
    });

    // Initial array generation and drawing
    initializeArray(true);
});
