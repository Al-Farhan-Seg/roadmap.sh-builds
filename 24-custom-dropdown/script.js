'use strict';

// Custom Dropdown
// Add project behaviour below.
const dropdown = document.querySelector(".dropdown");
const dropdownToggle = document.querySelector(".dropdown-toggle");
const dropdownMenu = document.querySelector(".dropdown-menu");
const dropdownLabel = document.querySelector(".dropdown-label");
const dropdownOptions = document.querySelectorAll(".dropdown-option");

dropdownToggle.addEventListener("click", () => {
    const isOpen = dropdown.classList.toggle("open");

    dropdownMenu.classList.toggle("hidden");

    dropdownToggle.setAttribute("aria-expanded", isOpen);
});

dropdownOptions.forEach((option) => {
    option.addEventListener("click", () => {
        const selectedValue = option.dataset.value;

        dropdownLabel.textContent = selectedValue;

        dropdownOptions.forEach((item) => {
            item.classList.remove("selected");
        });

        option.classList.add("selected");

        dropdownMenu.classList.add("hidden");
        dropdown.classList.remove("open");

        dropdownToggle.setAttribute("aria-expanded", "false");
    });
});

document.addEventListener("click", (event) => {
    if (!dropdown.contains(event.target)) {
        dropdownMenu.classList.add("hidden");
        dropdown.classList.remove("open");

        dropdownToggle.setAttribute("aria-expanded", "false");
    }
});