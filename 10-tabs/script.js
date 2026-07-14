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
        const relativeContentId = tabContentPairs[clickedTabId]
        const contentIdsToDeactivate = []
        const tabIdsToDeactivate = []

        Object.values(tabContentPairs).forEach((value) => {
            if(value !== relativeContentId){
                contentIdsToDeactivate.push(value)
            }
        })
        contentIdsToDeactivate.forEach((value) => {
            const contentToDeactivate = document.getElementById(value)
            contentToDeactivate.classList.remove("active-c")
            contentToDeactivate.classList.add("inactive-c")
        })
        const contentToActivate = document.getElementById(relativeContentId)
        contentToActivate.classList.remove("inactive-c")
        contentToActivate.classList.add("active-c")


        Object.keys(tabContentPairs).forEach((value) => {
            if(value !== clickedTabId){
                tabIdsToDeactivate.push(value)
            }
        })
        tabIdsToDeactivate.forEach((value) => {
            const tabToDeactivate = document.getElementById(value)
            tabToDeactivate.classList.remove("active-t")
            tabToDeactivate.classList.add("inactive-t")
        })
        const tabToActivate = document.getElementById(clickedTabId)
        tabToActivate.classList.remove("inactive-t")
        tabToActivate.classList.add("active-t")    
    })
})