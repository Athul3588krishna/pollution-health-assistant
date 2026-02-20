const axios = require('axios');

class PollutionService {
  constructor() {
    this.apiKey = process.env.OPENWEATHER_API_KEY;
    this.baseUrl = 'http://api.openweathermap.org/data/2.5';
  }

  // Get coordinates for a city
  async getCoordinates(city) {
    try {
      const response = await axios.get(`${this.baseUrl}/weather`, {
        params: {
          q: city,
          appid: this.apiKey
        }
      });

      return {
        lat: response.data.coord.lat,
        lon: response.data.coord.lon,
        city: response.data.name,
        country: response.data.sys.country
      };
    } catch (error) {
      throw new Error(`Failed to get coordinates for ${city}: ${error.message}`);
    }
  }

  // Get air pollution data
  async getAirPollution(lat, lon) {
    try {
      const response = await axios.get(`${this.baseUrl}/air_pollution`, {
        params: {
          lat,
          lon,
          appid: this.apiKey
        }
      });

      const data = response.data.list[0];
      
      return {
        aqi: data.main.aqi,
        components: {
          co: data.components.co,
          no2: data.components.no2,
          o3: data.components.o3,
          so2: data.components.so2,
          pm25: data.components.pm2_5,
          pm10: data.components.pm10
        }
      };
    } catch (error) {
      throw new Error(`Failed to get air pollution data: ${error.message}`);
    }
  }

  // Get weather data
  async getWeather(lat, lon) {
    try {
      const response = await axios.get(`${this.baseUrl}/weather`, {
        params: {
          lat,
          lon,
          appid: this.apiKey,
          units: 'metric'
        }
      });

      return {
        city: response.data.name,
        country: response.data.sys.country,
        temperature: response.data.main.temp,
        feelsLike: response.data.main.feels_like,
        humidity: response.data.main.humidity,
        windSpeed: response.data.wind.speed,
        description: response.data.weather[0].description,
        icon: response.data.weather[0].icon
      };
    } catch (error) {
      throw new Error(`Failed to get weather data: ${error.message}`);
    }
  }

  // Get complete environmental data
  async getCompleteData(city) {
    try {
      const coords = await this.getCoordinates(city);
      const [pollution, weather] = await Promise.all([
        this.getAirPollution(coords.lat, coords.lon),
        this.getWeather(coords.lat, coords.lon)
      ]);

      return {
        location: {
          city: coords.city,
          country: coords.country,
          coordinates: {
            lat: coords.lat,
            lon: coords.lon
          }
        },
        pollution,
        weather
      };
    } catch (error) {
      throw error;
    }
  }

  async getCompleteDataByCoordinates(lat, lon) {
    try {
      const [pollution, weather] = await Promise.all([
        this.getAirPollution(lat, lon),
        this.getWeather(lat, lon)
      ]);

      return {
        location: {
          city: weather.city || 'Current Location',
          country: weather.country || 'N/A',
          coordinates: {
            lat,
            lon
          }
        },
        pollution,
        weather
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new PollutionService();
