const tabButtons = document.querySelectorAll(".tabs")
const tabContentPairs = {
    "bio-tab" : "bio-content",
    "chem-tab" : "chem-content",
    "phy-tab" : "phy-content",
    "math-tab" : "math-content"
}

tabButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
        const clickedTabId = event.target.id
        const relativeContentClass = tabContentPairs[clickedTabId]
        const contentToDeactivate = []

        Object.values(tabContentPairs).forEach((value) => {
            if(value !== relativeContentClass){
                contentToDeactivate.push(value)
            }
        })
        /*for(let i = 0; i < contentToDeactivate.length; i++){

        }*/
        contentToDeactivate.forEach((value) => {
            const testElement = document.getElementsByClassName(value)
            console.log(testElement.classList.value)
        })

        console.log(`The content of ${clickedTabId} is ${relativeContentClass}`)
        console.log(`We are going to deactivate ${contentToDeactivate}`);
        
    })
})