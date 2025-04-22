const apiKey = 'API Key'; // API_key
const baseUrl = 'https://api.openweathermap.org/data/2.5/weather';
const forecastUrl = 'https://api.openweathermap.org/data/2.5/forecast';

function getWeather(city) {
    if (!city.trim()) {
        alert('Please enter a valid city name.');
        return;
    }

    const url = `${baseUrl}?q=${city}&appid=${apiKey}&units=metric`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.cod === 200) {
                displayWeather(data);
                saveRecentSearch(city);
            } else {
                alert('City not found. Please try again.');
            }
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            alert('An error occurred. Please try again later.');
        });
}

function getWeatherByLocation(lat, lon) {
    const url = `${baseUrl}?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.cod === 200) {
                displayWeather(data);
            } else {
                alert('Unable to fetch weather data for your location.');
            }
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            alert('An error occurred. Please try again later.');
        });
}

function displayWeather(data) {
    const temperature = data.main.temp;
    const description = data.weather[0].description;
    const humidity = data.main.humidity;
    const windSpeed = data.wind.speed;
    const iconCode = data.weather[0].icon;

   
    document.getElementById('temperature').innerText = `${temperature}°C`;
    document.getElementById('description').innerText = description.charAt(0).toUpperCase() + description.slice(1);
    document.getElementById('humidity').innerText = `Humidity: ${humidity}%`;
    document.getElementById('windSpeed').innerText = `Wind Speed: ${windSpeed} m/s`;

    
    const iconUrl = `https://openweathermap.org/img/wn/${iconCode}.png`;
    document.getElementById('weatherIcon').innerHTML = `<img src="${iconUrl}" alt="Weather Icon">`;
}


function getForecast(city) {
    const url = `${forecastUrl}?q=${city}&appid=${apiKey}&units=metric`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.cod === '200') {
                displayForecast(data);
            } else {
                alert('Unable to fetch forecast data.');
            }
        })
        .catch(error => {
            console.error('Error fetching forecast data:', error);
            alert('An error occurred. Please try again later.');
        });
}


function displayForecast(data) {
    const forecastList = document.getElementById('forecastList');
    forecastList.innerHTML = ''; 

    const dailyForecast = data.list.filter((item, index) => index % 8 === 0);

    dailyForecast.forEach(item => {
        const date = new Date(item.dt * 1000); 
        const dateString = date.toLocaleDateString();

        const iconCode = item.weather[0].icon;
        const iconUrl = `https://openweathermap.org/img/wn/${iconCode}.png`;

        const temp = item.main.temp;
        const windSpeed = item.wind.speed;
        const humidity = item.main.humidity;

        const forecastItem = document.createElement('div');
        forecastItem.classList.add('bg-white', 'p-4', 'rounded-lg', 'shadow-lg', 'text-center');
        forecastItem.innerHTML = `
            <div class="text-xl font-semibold">${dateString}</div>
            <img src="${iconUrl}" alt="Weather Icon" class="mx-auto">
            <div class="text-lg">${temp}°C</div>
            <div class="text-sm">Wind: ${windSpeed} m/s</div>
            <div class="text-sm">Humidity: ${humidity}%</div>
        `;
        forecastList.appendChild(forecastItem);
    });
}

function saveRecentSearch(city) {
    let recentCities = JSON.parse(sessionStorage.getItem('recentCities')) || [];
    if (!recentCities.includes(city)) {
        recentCities.push(city);
        if (recentCities.length > 5) {
            recentCities.shift();
        }
        sessionStorage.setItem('recentCities', JSON.stringify(recentCities));
        populateCityDropdown(recentCities);
    }
}

function populateCityDropdown(cities) {
    const dropdown = document.getElementById('cityDropdown');
    dropdown.innerHTML = '<option value="">Recently Searched Cities</option>';

    cities.forEach(city => {
        const option = document.createElement('option');
        option.value = city;
        option.innerText = city;
        dropdown.appendChild(option);
    });
}

document.getElementById('getWeather').addEventListener('click', function () {
    const city = document.getElementById('city').value;
    getWeather(city);
    getForecast(city); 
});

document.getElementById('getCurrentLocation').addEventListener('click', function () {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            getWeatherByLocation(lat, lon);
            getForecastByLocation(lat, lon);
        }, function () {
            alert('Unable to retrieve your location.');
        });
    } else {
        alert('Geolocation is not supported by this browser.');
    }
});


document.getElementById('cityDropdown').addEventListener('change', function () {
    const city = this.value;
    if (city) {
        getWeather(city);
        getForecast(city); 
    }
});

window.onload = function () {
    const recentCities = JSON.parse(sessionStorage.getItem('recentCities')) || [];
    populateCityDropdown(recentCities);
};
