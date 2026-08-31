const form = document.querySelector("#converter-form");

const temperatureInput = document.querySelector("#temperature");
const fromUnit = document.querySelector("#from-unit");
const toUnit = document.querySelector("#to-unit");

const convertBtn = document.querySelector("#convert-btn");
const resultContainer = document.querySelector("#result-container");
const result = document.querySelector("#result");


const unitSymbols = {
    celsius: "°C",
    fahrenheit: "°F",
    kelvin: "K"
};


function checkForm() {
    const formIsComplete =
        temperatureInput.value !== "" &&
        fromUnit.value !== "" &&
        toUnit.value !== "";

    convertBtn.disabled = !formIsComplete;
}


temperatureInput.addEventListener("input", checkForm);
fromUnit.addEventListener("change", checkForm);
toUnit.addEventListener("change", checkForm);


function convertToCelsius(value, unit) {
    switch (unit) {
        case "fahrenheit":
            return (value - 32) * 5 / 9;

        case "kelvin":
            return value - 273.15;

        default:
            return value;
    }
}


function convertFromCelsius(value, unit) {
    switch (unit) {
        case "fahrenheit":
            return (value * 9 / 5) + 32;

        case "kelvin":
            return value + 273.15;

        default:
            return value;
    }
}


form.addEventListener("submit", (event) => {
    event.preventDefault();

    const temperature = Number(temperatureInput.value);
    const from = fromUnit.value;
    const to = toUnit.value;

    const celsius = convertToCelsius(temperature, from);
    const converted = convertFromCelsius(celsius, to);

    const roundedResult = Math.round(converted * 100) / 100;

    result.textContent =
        `${temperature} ${unitSymbols[from]} = ` +
        `${roundedResult} ${unitSymbols[to]}`;

    resultContainer.classList.remove("hidden");
});