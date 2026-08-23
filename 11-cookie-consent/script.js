'use strict';

// Cookie Consent
// Add project behaviour below.
const closeModalBtn = document.querySelector(".close-modal-btn")
const acceptCookiesBtn = document.querySelector(".accept-cookies-btn")
const cookieModal = document.querySelector(".cookie-modal")
const displayMessage = document.getElementById("display-message")

//sessionStorage.setItem("cookie", true)

closeModalBtn.addEventListener("click", () => {
    cookieModal.classList.add("hidden")
    displayMessage.textContent = "No problem, cookies won’t be enabled."
    sessionStorage.setItem("cookie", false)
})

acceptCookiesBtn.addEventListener("click", () => {
  cookieModal.classList.add("hidden")
  displayMessage.textContent = "Cookies are now enabled."
  sessionStorage.setItem("cookie", true)
})

function handleCookies() {
    if(sessionStorage.getItem("cookie") === "true") {
        cookieModal.classList.add("hidden")
        displayMessage.textContent = "You already have cookies enabled."
    }
    else {
        cookieModal.classList.remove("hidden")
    }
}

const navigation = performance.getEntriesByType("navigation")[0]

if (navigation.type === "reload") {
  console.log("The page was reloaded")
  handleCookies()
}