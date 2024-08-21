document.addEventListener('DOMContentLoaded', () => {
    // Retrieve the last searched city from localStorage
    const lastCity = localStorage.getItem('lastCity');
    if (lastCity) {
        // Automatically fetch and display the weather for the last searched city
        document.getElementById('city').value = lastCity;
        fetchWeather(lastCity);
    }
});

document.getElementById('getWeather').addEventListener('click', () => {
    const cityInput = document.getElementById('city');
    const city = cityInput.value.trim(); // Remove leading and trailing whitespace

    // Validate city input
    if (!isValidCityName(city)) {
        document.getElementById('weatherResult').innerHTML = `<p>Please enter a valid city name.</p>`;
        document.getElementById('forecast').innerHTML = ''; // Clear forecast
        return;
    }

    // Save the city to localStorage
    localStorage.setItem('lastCity', city);

    // Fetch weather data for the city
    fetchWeather(city);
});

function fetchWeather(city) {
    const apiKey = 'a38d09f75f8bf4663d0007cd7fe34c14';  // Replace with your OpenWeatherMap API key
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.cod === '404') {
                document.getElementById('weatherResult').innerHTML = `<p>City not found</p>`;
                document.getElementById('forecast').innerHTML = ''; // Clear forecast
            } else {
                // Display current weather
                const currentWeather = data.list[0]; // Take the first entry as current weather
                const iconClass = getIconClass(currentWeather.weather[0].main);
                const currentWeatherHtml = `
                    <h2>${data.city.name}, ${data.city.country}</h2>
                    <p><i class="${iconClass}"></i> ${currentWeather.weather[0].description}</p>
                    <p>Temperature: ${currentWeather.main.temp}°C</p>
                    <p>Humidity: ${currentWeather.main.humidity}%</p>
                    <p>Wind Speed: ${currentWeather.wind.speed} m/s</p>
                `;
                document.getElementById('weatherResult').innerHTML = currentWeatherHtml;

                // Display 5-day forecast
                const forecastHtml = data.list.filter(entry => entry.dt_txt.includes('12:00:00')) // Filter to get daily forecasts at noon
                    .map(entry => {
                        const date = new Date(entry.dt_txt).toLocaleDateString();
                        const iconClass = getIconClass(entry.weather[0].main);
                        return `
                            <div class="forecast-day">
                                <h3>${date}</h3>
                                <i class="${iconClass}"></i>
                                <p>${entry.weather[0].description}</p>
                                <p>Temperature: ${entry.main.temp}°C</p>
                                <p>Humidity: ${entry.main.humidity}%</p>
                                <p>Wind Speed: ${entry.wind.speed} m/s</p>
                            </div>
                        `;
                    }).join('');
                document.getElementById('forecast').innerHTML = forecastHtml;
            }
        })
        .catch(error => {
            document.getElementById('weatherResult').innerHTML = `<p>Error fetching weather data</p>`;
            document.getElementById('forecast').innerHTML = ''; // Clear forecast
        });
}

// Function to get Font Awesome icon class based on weather condition
function getIconClass(weatherCondition) {
    switch (weatherCondition) {
        case 'Clear':
            return 'fas fa-sun'; // Sunny
        case 'Clouds':
            return 'fas fa-cloud'; // Cloudy
        case 'Rain':
            return 'fas fa-cloud-rain'; // Rainy
        case 'Snow':
            return 'fas fa-snowflake'; // Snowy
        case 'Thunderstorm':
            return 'fas fa-poo-storm'; // Thunderstorm
        case 'Drizzle':
            return 'fas fa-cloud-showers-heavy'; // Drizzle
        case 'Mist':
            return 'fas fa-smog'; // Mist
        default:
            return 'fas fa-question'; // Unknown
    }
}

// Function to validate city name
function isValidCityName(city) {
    // Check if the city name is non-empty and contains only letters and spaces
    return city.length > 0 && /^[a-zA-Z\s]+$/.test(city);
}
