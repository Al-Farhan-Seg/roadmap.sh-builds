'use strict';

const restrictedArea = document.getElementById("restricted-textarea")
const currentCharCount = document.getElementById("current-char-count")
const topDiv = restrictedArea.parentElement



restrictedArea.addEventListener("input", (e) => {
    const currentChars = e.target.value.length
    currentCharCount.textContent = currentChars
    console.log(currentChars)

    if(currentChars >= 250) {
        topDiv.classList.remove("border-slate-800")
        topDiv.classList.add("border-red-500", "text-red-500")
        restrictedArea.classList.add("outline-red-500")
    }
    else {
        topDiv.classList.add("border-slate-800")
        topDiv.classList.remove ("border-red-500", "text-red-500")
        restrictedArea.classList.remove("outline-red-500")
    }
}
)
