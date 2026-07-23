const qnAnsIdPairs = {
    "qc-1": "ac-1",
    "qc-2": "ac-2",
    "qc-3": "ac-3",
    "qc-4": "ac-4",
    "qc-5": "ac-5",
    "qc-6": "ac-6"
}
const qnIconIdPairs = {
    "qc-1": "arrow-icon-1",
    "qc-2": "arrow-icon-2",
    "qc-3": "arrow-icon-3",
    "qc-4": "arrow-icon-4",
    "qc-5": "arrow-icon-5",
    "qc-6": "arrow-icon-6"
}
const qnContainers = document.querySelectorAll(".qn-container");
const bootStrapIconActiveClass = "bi-caret-down"
const bootStrapIconInactiveClass = "bi-caret-right"

qnContainers.forEach((qnContainer) => {
    qnContainer.addEventListener("click", () => {
        const activeQnContainerId = qnContainer.id
        toggleAnsContainer(activeQnContainerId)
        rotateArrowIcon(activeQnContainerId)
    })
})


function rotateArrowIcon(qnId) {
    const activeArrowIconId = qnIconIdPairs[qnId]
    const inactiveArrowIconIds = []
    Object.values(qnIconIdPairs).forEach((IconId) => {
        IconId !== activeArrowIconId ? inactiveArrowIconIds.push(IconId): ""
    })
    const activeArrowIcon = document.getElementById(activeArrowIconId)
    activeArrowIcon.classList.toggle(bootStrapIconActiveClass)
    activeArrowIcon.classList.toggle(bootStrapIconInactiveClass)
    inactiveArrowIconIds.forEach((inactiveArrowIconId) => {
        const inactiveArrowIcon = document.getElementById(inactiveArrowIconId)
        inactiveArrowIcon.classList.remove(bootStrapIconActiveClass)
        inactiveArrowIcon.classList.add(bootStrapIconInactiveClass)
    })
}

function toggleAnsContainer(qnId) {
    const activeAnsContainerId = qnAnsIdPairs[qnId]
    const inactiveAnsContainerIds = []
    Object.values(qnAnsIdPairs).forEach((ansId) => {
        ansId !== activeAnsContainerId ? inactiveAnsContainerIds.push(ansId) : ""
    })
    const activeAnsContainer = document.getElementById(activeAnsContainerId)
    activeAnsContainer.classList.toggle("ans-active")
    inactiveAnsContainerIds.forEach((inactiveAnsContainerId) => {
        const inactiveAnsContainer = document.getElementById(inactiveAnsContainerId)
        inactiveAnsContainer.classList.remove("ans-active")
    })
}