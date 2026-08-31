'use strict';

// For this project we are going to use OpenMeteo API rather than the Visual Crossings API
const API_QUERY_URL = `https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41&hourly=temperature_2m`     

async function getWeather() {
    const response = await fetch(API_QUERY_URL);

    const data = await response.json();

    console.log(data);
}

getWeather();