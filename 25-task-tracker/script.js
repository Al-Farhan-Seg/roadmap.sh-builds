const titleField = document.getElementById("title-field")
const descriptionField = document.getElementById("description-field")
const submitBtn = document.getElementById("submit-btn")
const pendingTasksArray = []
const completedTasksArray = []

const pendingContainer = document.getElementById("pending-container")
const completedContainer = document.getElementById("completed-container")

let allPendingEntries = ""
let allCompletedEntries = ""

addPendingCheckboxListeners()
// -----SUBMIT BUTTON EVENT LISTENER -----------
submitBtn.addEventListener("click", (event) => {
    event.preventDefault();

    const titleValue = titleField.value
        .trim()
        .split(" ")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

    const descriptionValue = descriptionField.value.trim();
    const formattedDescription =
        descriptionValue.charAt(0).toUpperCase() + descriptionValue.slice(1);

    if (!areBothFieldsFilled(titleValue, descriptionValue)) {
        alert("All fields must be filled to add a new task");
        return;
    }

    if (isDuplicate(titleValue, formattedDescription, pendingTasksArray)) {
        alert("This task is already pending");
        return;
    }

    populatePendingTasksArray(titleValue, formattedDescription);
    renderTasks();
    clearInputFields();
});

// -------MARK TASK AS COMPLETED EVENT LISTENER--------
function addPendingCheckboxListeners() {
    const pendingCheckBoxes = document.querySelectorAll(".pending-cb");

    pendingCheckBoxes.forEach((pendingCheckBox) => {
        pendingCheckBox.addEventListener("change", (event) => {
            const taskId = Number(event.target.id.replace("pending-cb-", ""));

            const selectedIndex = pendingTasksArray.findIndex(
                task => task.id === taskId
            );

            if (selectedIndex === -1) {
                console.error(`Task with ID ${taskId} was not found.`);
                return;
            }

            const [selectedTask] = pendingTasksArray.splice(selectedIndex, 1);

            completedTasksArray.push(selectedTask);

            renderTasks();
        });
    });
}
//--Deleting TASk /event Listener --------
function addDeleteTaskListeners() {
    const deleteButtons = document.querySelectorAll(".delete-btn");

    deleteButtons.forEach((deleteButton) => {
        deleteButton.addEventListener("click", (event) => {
            const deleteBtnId = Number(event.currentTarget.id.replace("delete-btn-", ""))

            const elementBefore = deleteButton.previousElementSibling
            const deleteButtonCategory = elementBefore.classList[0].slice(0, -3)
            const arrayToDeleteFrom = deleteButtonCategory === "pending" ? pendingTasksArray : completedTasksArray

            const selectedIndex = arrayToDeleteFrom.findIndex(
                task => task.id === deleteBtnId
            );

            if (selectedIndex === -1) {
                console.error(`Task with ID ${deleteBtnId} was not found.`);
                return;
            }
            const [selectedTask] = arrayToDeleteFrom.splice(selectedIndex, 1);
            renderTasks()
        })
    })
}
function areBothFieldsFilled(value1, value2)  {                                        
    return value1 !== "" && value2 !== "" ? true : false
}
function clearInputFields() {
    titleField.value = ""
    descriptionField.value = ""
}
function isDuplicate(value1, value2, arrayToCheck) {
  return arrayToCheck.some(element => element.title === value1 && element.description === value2);
}

let nextTaskId = 1;
function populatePendingTasksArray(title, description) {
    const newPendingTask = {
        id: nextTaskId,
        title,
        description
    };

    nextTaskId++;
    pendingTasksArray.push(newPendingTask);
}
function populateCompletedTasksArray() {

}
function createPendingEntry(id, title) {
    const entry = `
<div class="entry">
<input type="checkbox" id="pending-cb-${id}" class="pending-cb">
<label id="pending-lb-${id}" class="pending-lb">${title}</label>
<button class="delete-btn" id="delete-btn-${id}">
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash-icon lucide-trash"><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
</button>
</div>
`
    allPendingEntries += entry
}
function createCompletedEntry(id, title) {
    const entry = `
<div class="entry">
    <input type="checkbox" id="completed-cb-${id}" class="completed-cb" checked onclick="return false;">
    <label id="completed-lb-${id}" class="completed-lb">${title}</label>
    <button class="delete-btn" id="delete-btn-${id}">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash-icon lucide-trash"><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
    </button> 
</div>
`
    allCompletedEntries += entry
}
function renderTasks() {
    allPendingEntries = "";
    allCompletedEntries = "";

    pendingTasksArray.forEach(task => {
        createPendingEntry(task.id, task.title);
    });

    completedTasksArray.forEach(task => {
        createCompletedEntry(task.id, task.title);
    });

    pendingContainer.innerHTML = allPendingEntries;
    completedContainer.innerHTML = allCompletedEntries;

    addPendingCheckboxListeners();
    addDeleteTaskListeners();
}