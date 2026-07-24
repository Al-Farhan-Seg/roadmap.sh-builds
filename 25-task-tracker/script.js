const titleField = document.getElementById("title-field")
const descriptionField = document.getElementById("description-field")
const submitBtn = document.getElementById("submit-btn")
const pendingTasks = []
const completedTasks = []

/*
submitBtn.addEventListener("click", (event) => {
    event.preventDefault();
}) */
submitBtn.addEventListener("click", (event) => {
    event.preventDefault();
    if(areBothFieldsFilled()) {
        
        // clearInputFields()
    } else {
        alertForEmptyFields()
    }
})

function areBothFieldsFilled() {
    const titleValue = titleField.value.trim()
                                       .split(' ')
                                       .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                       .join(' ');
    const descriptionValue = descriptionField.value.trim()                                 
    const descriptionValueUpper = descriptionValue.charAt(0).toUpperCase() + descriptionValue.slice(1);                                        
    console.log(`Title: ${titleValue}, Description: ${descriptionValueUpper}`)
    return titleValue !== "" && descriptionValue !== "" ? true : false
}
function clearInputFields() {
    titleField.value = ""
    descriptionField.value = ""
}
function alertForEmptyFields() {
    alert("All fields must be flled to add a new task")
}