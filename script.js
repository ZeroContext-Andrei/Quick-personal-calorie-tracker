/**
 * Main Script for Calorie Tracker (index.html)
 *
 * Handles:
 * - Loading/Saving multi-day log data (items, goals) to localStorage.
 * - Displaying the current day's log and summary.
 * - Adding, editing, and deleting calorie items for the current day.
 * - Handling goal input changes.
 * - Starting a new day's log.
 * - Event delegation for list item actions (edit/delete).
 */

// Basic setup - Get elements
const foodForm = document.getElementById('food-form');
const foodNameInput = document.getElementById('food-name');
const caloriesInput = document.getElementById('calories');
const foodList = document.getElementById('food-list');
const calorieGoalInput = document.getElementById('calorie-goal-input');
const currentDayDisplay = document.getElementById('current-day-display');
const newDayBtn = document.getElementById('new-day-btn');

// New Summary Panel Elements
const caloriesInValue = document.querySelector('#calories-in .metric-value');
const caloriesOutValue = document.querySelector('#calories-out .metric-value');
const netCaloriesValue = document.querySelector('#net-calories .metric-value');
const calorieGoalValSpan = document.getElementById('calorie-goal-val');
const caloriesRemainingValSpan = document.getElementById('calories-remaining-val');

// -- Global State --
const LOCAL_STORAGE_KEY = 'calorieTrackerMultiDayData';
const DEFAULT_GOAL = 2000;

let appData = { // Structure to hold all app data
    currentDayIndex: 1,
    logs: {
        // Example: "1": { goal: 2000, items: [] }
    }
};

// Load data from local storage on page load
document.addEventListener('DOMContentLoaded', loadData);

// Add event listener for form submission
foodForm.addEventListener('submit', handleFormSubmit);

// Add event listener for goal input changes
calorieGoalInput.addEventListener('change', handleGoalChange);

// Add event listener for clicks within the food list (for delete/edit)
foodList.addEventListener('click', handleListClick);

// Add event listener for the new day button
newDayBtn.addEventListener('click', startNewDay);

// --- Event Handlers ---

function handleFormSubmit(event) {
    event.preventDefault(); // Prevent page reload

    const name = foodNameInput.value.trim();
    // Keep allowing any integer for calories
    const calories = parseInt(caloriesInput.value, 10);

    if (name === '' || isNaN(calories)) {
        alert('Please enter a valid name and calorie amount.');
        return;
    }

    addFoodItem(name, calories);

    // Clear form fields
    foodNameInput.value = '';
    caloriesInput.value = '';
    foodNameInput.focus(); // Set focus back to name input
}

function handleGoalChange() {
    const newGoal = parseInt(calorieGoalInput.value, 10);
    const currentDayLog = getCurrentDayLog();

    if (currentDayLog && !isNaN(newGoal) && newGoal >= 0) {
        currentDayLog.goal = newGoal;
        updateSummaryDisplay();
        saveData();
    } else {
        calorieGoalInput.value = currentDayLog ? currentDayLog.goal : DEFAULT_GOAL;
        alert('Please enter a valid positive number for the goal.');
    }
}

function handleListClick(event) {
    const target = event.target;
    const listItem = target.closest('.food-log-item');
    if (!listItem) return; // Click wasn't on or inside a list item

    const itemId = listItem.dataset.id;

    // Check if already in edit mode for this item
    const isEditing = listItem.classList.contains('editing');

    if (isEditing) {
        // Handle clicks within edit mode (Save/Cancel)
        if (target.classList.contains('save-edit-btn')) {
            saveEdit(listItem, itemId);
        } else if (target.classList.contains('cancel-edit-btn')) {
            cancelEdit(listItem, itemId);
        }
    } else {
        // Handle clicks in display mode (Edit/Delete)
        if (target.closest('.edit-btn')) {
            enterEditMode(listItem, itemId);
        } else if (target.closest('.delete-btn')) {
            // Confirm deletion
            if (window.confirm('Are you sure you want to delete this item?')) {
                removeFoodItem(itemId);
            }
        }
    }
}

// --- Core Logic Functions ---

// Helper to get the log object for the current day
function getCurrentDayLog() {
    return appData.logs[appData.currentDayIndex.toString()];
}

function addFoodItem(name, calories) {
    const currentDayLog = getCurrentDayLog();
    if (!currentDayLog) return; // Should not happen if initialized correctly

    const newItem = { id: Date.now().toString(), name, calories };
    currentDayLog.items.push(newItem);

    renderFoodItem(newItem);
    updateSummaryDisplay();
    saveData();
}

// Renamed and Updated Function to update the summary panel display
function updateSummaryDisplay() {
    const currentDayLog = getCurrentDayLog();
    if (!currentDayLog) {
        // Reset display if no current day log (e.g., initial state before load)
        caloriesInValue.textContent = `0 kcal`;
        caloriesOutValue.textContent = `0 kcal`;
        netCaloriesValue.textContent = `0 kcal`;
        calorieGoalValSpan.textContent = DEFAULT_GOAL;
        caloriesRemainingValSpan.textContent = DEFAULT_GOAL;
        netCaloriesValue.classList.remove('over-limit');
        caloriesRemainingValSpan.parentElement.classList.remove('over-limit');
        return;
    }

    let calIn = 0;
    let calOut = 0;
    currentDayLog.items.forEach(item => {
        if (item.calories > 0) calIn += item.calories;
        else calOut += Math.abs(item.calories);
    });

    const netCal = calIn - calOut;
    const goal = currentDayLog.goal;
    const remaining = goal - netCal;

    // Update Panel Display
    caloriesInValue.textContent = `${calIn} kcal`;
    caloriesOutValue.textContent = `${calOut} kcal`;
    netCaloriesValue.textContent = `${netCal} kcal`;
    calorieGoalValSpan.textContent = goal;
    caloriesRemainingValSpan.textContent = remaining;

    // Update Net Calories color if goal exceeded using a class
    if (netCal > goal) {
        netCaloriesValue.classList.add('over-limit');
        caloriesRemainingValSpan.parentElement.classList.add('over-limit');
    } else {
        netCaloriesValue.classList.remove('over-limit');
        caloriesRemainingValSpan.parentElement.classList.remove('over-limit');
    }
}

// Function to save data to local storage
function saveData() {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(appData));
}

// Function to load data from local storage
function loadData() {
    const storedData = localStorage.getItem(LOCAL_STORAGE_KEY);
    foodList.innerHTML = ''; // Clear existing list before loading
    // Reset state before loading
    appData = {
        currentDayIndex: 1,
        logs: {}
    };

    if (storedData) {
        try {
             appData = JSON.parse(storedData);
             // Basic validation/migration if structure changed might be needed here
             if (!appData.logs) appData.logs = {};
             if (appData.currentDayIndex === undefined) appData.currentDayIndex = 1;
        } catch (e) {
            console.error("Error parsing stored data:", e);
            // Reset to default if parsing fails
            initializeAppData();
        }
    } else {
        // Initialize first day if no data exists
        initializeAppData();
    }

    // Ensure the current day exists in logs
    if (!appData.logs[appData.currentDayIndex.toString()]) {
        console.warn(`Current day index ${appData.currentDayIndex} not found in logs. Resetting.`);
        // Attempt to find the latest day index or reset
        const dayIndices = Object.keys(appData.logs).map(Number).sort((a, b) => b - a);
        appData.currentDayIndex = dayIndices.length > 0 ? dayIndices[0] : 1;
        // Ensure this reset day exists or create it
        if (!appData.logs[appData.currentDayIndex.toString()]) {
             createDayLog(appData.currentDayIndex);
        }
    }

    // Load UI for the current day
    loadDayUI(appData.currentDayIndex);
    saveData(); // Save potentially initialized/corrected data
}

function initializeAppData() {
    appData = {
        currentDayIndex: 1,
        logs: {
            "1": { goal: DEFAULT_GOAL, items: [] }
        }
    };
}

function createDayLog(dayIndex) {
     if (!appData.logs[dayIndex.toString()]) {
        appData.logs[dayIndex.toString()] = { goal: DEFAULT_GOAL, items: [] };
    }
}

// Loads the UI elements for a specific day index
function loadDayUI(dayIndex) {
    const dayLog = appData.logs[dayIndex.toString()];
    if (!dayLog) {
        console.error(`Cannot load UI for non-existent day: ${dayIndex}`);
        return;
    }

    // Update Day Display
    currentDayDisplay.textContent = `Day ${dayIndex} Log`;

    // Update Goal Input
    calorieGoalInput.value = dayLog.goal;

    // Clear and Render Food List
    foodList.innerHTML = '';
    dayLog.items.forEach(item => renderFoodItem(item));

    // Update Summary Panel
    updateSummaryDisplay();
}

// Starts a new day
function startNewDay() {
    // Find the next available day index
    const existingIndices = Object.keys(appData.logs).map(Number);
    const nextDayIndex = existingIndices.length > 0 ? Math.max(...existingIndices) + 1 : 1;

    // Update current day index
    appData.currentDayIndex = nextDayIndex;

    // Create log entry for the new day if it doesn't exist (might already exist if navigating)
    createDayLog(appData.currentDayIndex);

    // Load the UI for the new day
    loadDayUI(appData.currentDayIndex);

    // Save the changes (new index, potentially new log entry)
    saveData();

    console.log(`Started new day: ${appData.currentDayIndex}`);
}

// Updated Function to render a single food item to the UI with card structure
function renderFoodItem(item) {
    const li = document.createElement('li');
    li.classList.add('food-log-item', 'gradient-outline-card');
    li.dataset.id = item.id;

    const innerDiv = document.createElement('div');
    innerDiv.classList.add('card-content');
    innerDiv.classList.add(item.calories < 0 ? 'negative' : 'positive');

    // --- Display View Elements ---
    const nameSpan = document.createElement('span');
    nameSpan.classList.add('item-name');
    nameSpan.textContent = `${getEmoji(item.name, item.calories)} ${item.name}`;

    const caloriesSpan = document.createElement('span');
    caloriesSpan.classList.add('item-calories');
    caloriesSpan.textContent = `${item.calories} kcal`;

    const actionsDiv = document.createElement('div');
    actionsDiv.classList.add('item-actions');

    const editBtn = document.createElement('button');
    editBtn.classList.add('edit-btn');
    editBtn.innerHTML = '✏️';
    editBtn.title = 'Edit Item';

    const deleteBtn = document.createElement('button');
    deleteBtn.classList.add('delete-btn');
    deleteBtn.innerHTML = '🗑️';
    deleteBtn.title = 'Delete Item';

    actionsDiv.appendChild(editBtn);
    actionsDiv.appendChild(deleteBtn);

    // --- Edit View Elements ---
    const editInputsDiv = document.createElement('div');
    editInputsDiv.classList.add('edit-inputs');

    const editNameInput = document.createElement('input');
    editNameInput.type = 'text';
    editNameInput.classList.add('edit-name-input');
    editNameInput.value = item.name;

    const editCaloriesInput = document.createElement('input');
    editCaloriesInput.type = 'number';
    editCaloriesInput.classList.add('edit-calories-input');
    editCaloriesInput.value = item.calories;

    editInputsDiv.appendChild(editNameInput);
    editInputsDiv.appendChild(editCaloriesInput);

    const editActionsDiv = document.createElement('div');
    editActionsDiv.classList.add('edit-actions');

    const saveEditBtn = document.createElement('button');
    saveEditBtn.classList.add('save-edit-btn');
    saveEditBtn.textContent = 'Save';

    const cancelEditBtn = document.createElement('button');
    cancelEditBtn.classList.add('cancel-edit-btn');
    cancelEditBtn.textContent = 'Cancel';

    editActionsDiv.appendChild(saveEditBtn);
    editActionsDiv.appendChild(cancelEditBtn);

    // --- Append content to inner div ---
    innerDiv.appendChild(nameSpan);
    innerDiv.appendChild(caloriesSpan);
    innerDiv.appendChild(actionsDiv);
    innerDiv.appendChild(editInputsDiv);
    innerDiv.appendChild(editActionsDiv);

    li.appendChild(innerDiv);

    foodList.appendChild(li);
}

// Updated function to remove food item by ID
function removeFoodItem(id) {
    const currentDayLog = getCurrentDayLog();
    if (!currentDayLog) return;

    const itemIndex = currentDayLog.items.findIndex(item => item.id === id);

    if (itemIndex > -1) {
        currentDayLog.items.splice(itemIndex, 1);

        const listItem = foodList.querySelector(`[data-id="${id}"]`);
        if (listItem) listItem.remove();

        updateSummaryDisplay();
        saveData();
    } else {
        console.warn("Attempted to remove item ID not found in current day:", id);
    }
}

// --- Edit Mode Functions ---

function enterEditMode(listItem, itemId) {
    // Ensure only one item is edited at a time (optional, but good practice)
    const currentlyEditing = foodList.querySelector('.editing');
    if (currentlyEditing && currentlyEditing !== listItem) {
        const oldItemId = currentlyEditing.dataset.id;
        cancelEdit(currentlyEditing, oldItemId); // Cancel previous edit
    }

    listItem.classList.add('editing');

    // Populate inputs with current values
    const currentDayLog = getCurrentDayLog();
    const item = currentDayLog.items.find(i => i.id === itemId);
    if (!item) return;

    const nameInput = listItem.querySelector('.edit-name-input');
    const caloriesInput = listItem.querySelector('.edit-calories-input');

    nameInput.value = item.name;
    caloriesInput.value = item.calories;
    nameInput.focus(); // Focus the name input
}

function saveEdit(listItem, itemId) {
    const nameInput = listItem.querySelector('.edit-name-input');
    const caloriesInput = listItem.querySelector('.edit-calories-input');
    const newName = nameInput.value.trim();
    const newCalories = parseInt(caloriesInput.value, 10);

    if (newName === '' || isNaN(newCalories)) {
        alert('Please enter a valid name and calorie amount.');
        return;
    }

    const currentDayLog = getCurrentDayLog();
    const itemIndex = currentDayLog.items.findIndex(i => i.id === itemId);

    if (itemIndex > -1) {
        currentDayLog.items[itemIndex].name = newName;
        currentDayLog.items[itemIndex].calories = newCalories;

        const innerDiv = listItem.querySelector('.card-content');
        innerDiv.querySelector('.item-name').textContent = `${getEmoji(newName, newCalories)} ${newName}`;
        const calSpan = innerDiv.querySelector('.item-calories');
        calSpan.textContent = `${newCalories} kcal`;

        // Update positive/negative class on innerDiv
        innerDiv.classList.remove('positive', 'negative');
        innerDiv.classList.add(newCalories < 0 ? 'negative' : 'positive');

        listItem.classList.remove('editing');
        updateSummaryDisplay();
        saveData();
    } else {
        cancelEdit(listItem, itemId);
    }
}

function cancelEdit(listItem, itemId) {
    // Simply remove the editing class to revert appearance
    listItem.classList.remove('editing');
}

// Helper for emoji logic (extracted)
function getEmoji(name, calories) {
    let emoji = '🍎'; // Default
    if (calories < 0) emoji = '🏃';
    else if (name.toLowerCase().includes('egg')) emoji = '🥚';
    else if (name.toLowerCase().includes('toast')) emoji = '🍞';
    else if (name.toLowerCase().includes('salad') || name.toLowerCase().includes('chicken')) emoji = '🥗';
    // Add more rules as needed
    return emoji;
} 