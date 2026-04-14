/**
 * ============================================
 * CITY BUILDER GAME - WEATHER SERVICE
 * ============================================
 * Obtiene clima real con fallback local y
 * expone modificadores jugables por turno.
 */

import { APIService } from "./APIService.js";

const DEFAULT_MODIFIERS = {
    electricityProduction: 1,
    waterProduction: 1,
    foodProduction: 1,
    electricityConsumption: 1,
    waterConsumption: 1,
    foodConsumption: 1,
    income: 1,
    maintenance: 1
};

const WEATHER_PROFILES = {
    SUNNY: {
        label: "Soleado",
        modifiers: {
            electricityProduction: 1.05,
            waterProduction: 0.95,
            foodProduction: 1.05,
            electricityConsumption: 1,
            waterConsumption: 1.02,
            foodConsumption: 1,
            income: 1.08,
            maintenance: 1
        }
    },
    CLOUDY: {
        label: "Nublado",
        modifiers: {
            ...DEFAULT_MODIFIERS
        }
    },
    RAINY: {
        label: "Lluvioso",
        modifiers: {
            electricityProduction: 1,
            waterProduction: 1.15,
            foodProduction: 1.02,
            electricityConsumption: 1.02,
            waterConsumption: 0.95,
            foodConsumption: 1,
            income: 0.98,
            maintenance: 1.02
        }
    },
    STORM: {
        label: "Tormenta",
        modifiers: {
            electricityProduction: 0.85,
            waterProduction: 1.05,
            foodProduction: 0.85,
            electricityConsumption: 1.08,
            waterConsumption: 1.05,
            foodConsumption: 1.03,
            income: 0.85,
            maintenance: 1.15
        }
    },
    DROUGHT: {
        label: "Sequia",
        modifiers: {
            electricityProduction: 0.95,
            waterProduction: 0.7,
            foodProduction: 0.78,
            electricityConsumption: 1.05,
            waterConsumption: 1.2,
            foodConsumption: 1.02,
            income: 0.92,
            maintenance: 1.08
        }
    }
};

export class WeatherService {

    constructor(config = {}) {
        this.config = config;
        this.locationCache = new Map();
        this.currentWeather = this.createWeatherState({
            type: "SUNNY",
            source: "fallback",
            location: config.defaultLocation || "Bogota"
        });
        
        // OpenWeatherMap API configuration
        this.apiKey = config.openWeatherMapApiKey || null;
        this.updateInterval = 30 * 60 * 1000; // 30 minutes in milliseconds
        this.lastUpdate = 0;
        this.updateTimer = null;
        
        // Auto-update configuration
        if (config.autoUpdate !== false) {
            this.startAutoUpdate();
        }
    }

    getLocationQuery(cityName) {
        const trimmedName = typeof cityName === "string"
            ? cityName.trim()
            : "";

        if (!trimmedName || trimmedName.toLowerCase() === "mi ciudad") {
            return this.config.defaultLocation || "Bogota";
        }

        return trimmedName;
    }

    async resolveLocation(cityName) {
        const primaryLocation = this.getLocationQuery(cityName);
        const fallbackLocation = this.config.defaultLocation || "Bogota";
        const queries = [...new Set([primaryLocation, fallbackLocation].filter(Boolean))];

        for (const query of queries) {
            const location = await this.fetchLocation(query);

            if (location) {
                return location;
            }
        }

        return null;
    }

    async fetchLocation(query) {
        const cacheKey = query.toLowerCase();

        if (this.locationCache.has(cacheKey)) {
            return this.locationCache.get(cacheKey);
        }

        const params = new URLSearchParams({
            name: query,
            count: "1",
            language: "es",
            format: "json"
        });

        const countryCode = this.config.countryCode || "";

        if (countryCode) {
            params.set("countryCode", countryCode);
        }

        const data = await APIService.fetchExternalJSON(
            `https://geocoding-api.open-meteo.com/v1/search?${params.toString()}`
        );

        const result = data?.results?.[0];

        if (!result) {
            return null;
        }

        const location = {
            name: result.name,
            latitude: result.latitude,
            longitude: result.longitude,
            countryCode: result.country_code || countryCode || "",
            admin: result.admin1 || ""
        };

        this.locationCache.set(cacheKey, location);

        return location;
    }

    async updateWeather(cityName) {
        if (this.config.enabled === false) {
            return this.currentWeather;
        }

        // Check if we need to update (30-minute interval)
        const now = Date.now();
        if (now - this.lastUpdate < this.updateInterval && this.currentWeather.source !== "fallback") {
            return this.currentWeather;
        }

        const location = await this.resolveLocation(cityName);

        if (!location) {
            this.currentWeather = this.generateFallbackWeather(cityName);
            this.lastUpdate = now;
            return this.currentWeather;
        }

        // Try OpenWeatherMap API first
        if (this.apiKey) {
            try {
                const weatherData = await this.fetchOpenWeatherMap(location.latitude, location.longitude);
                if (weatherData) {
                    this.currentWeather = this.createWeatherStateFromOpenWeather(weatherData, location.name);
                    this.lastUpdate = now;
                    return this.currentWeather;
                }
            } catch (error) {
                console.warn('OpenWeatherMap API failed, falling back to Open-Meteo:', error);
            }
        }

        // Fallback to Open-Meteo
        const params = new URLSearchParams({
            latitude: String(location.latitude),
            longitude: String(location.longitude),
            current: "temperature_2m,precipitation,weather_code,wind_speed_10m,relativehumidity_2m",
            timezone: "auto"
        });

        const data = await APIService.fetchExternalJSON(
            `https://api.open-meteo.com/v1/forecast?${params.toString()}`
        );

        const current = data?.current;

        if (!current) {
            this.currentWeather = this.generateFallbackWeather(location.name);
            this.lastUpdate = now;
            return this.currentWeather;
        }

        const type = this.mapWeatherType(
            current.weather_code,
            current.precipitation,
            current.wind_speed_10m,
            current.temperature_2m
        );

        this.currentWeather = this.createWeatherState({
            type,
            temperature: current.temperature_2m,
            precipitation: current.precipitation,
            windSpeed: current.wind_speed_10m,
            humidity: current.relativehumidity_2m,
            source: "open-meteo",
            location: location.name
        });

        this.lastUpdate = now;
        return this.currentWeather;
    }

    /**
     * Fetch weather data from OpenWeatherMap API
     */
    async fetchOpenWeatherMap(lat, lon) {
        const params = new URLSearchParams({
            lat: lat.toString(),
            lon: lon.toString(),
            appid: this.apiKey,
            units: "metric", // For Celsius
            lang: "es" // Spanish
        });

        const data = await APIService.fetchExternalJSON(
            `https://api.openweathermap.org/data/2.5/weather?${params.toString()}`
        );

        return data;
    }

    /**
     * Create weather state from OpenWeatherMap data
     */
    createWeatherStateFromOpenWeather(data, location) {
        const type = this.mapOpenWeatherCondition(data.weather?.[0]?.main, data.weather?.[0]?.description);
        
        return this.createWeatherState({
            type,
            temperature: data.main?.temp,
            precipitation: data.rain?.['1h'] || data.snow?.['1h'] || 0,
            windSpeed: data.wind?.speed ? data.wind.speed * 3.6 : null, // Convert m/s to km/h
            humidity: data.main?.humidity,
            source: "openweathermap",
            location: location,
            condition: data.weather?.[0]?.description || "Desconocido"
        });
    }

    /**
     * Map OpenWeatherMap conditions to weather types
     */
    mapOpenWeatherCondition(main, description) {
        if (!main) return "SUNNY";

        const mainLower = main.toLowerCase();
        const descLower = (description || "").toLowerCase();

        if (mainLower === "thunderstorm" || descLower.includes("tormenta")) {
            return "STORM";
        }

        if (mainLower === "rain" || mainLower === "drizzle" || descLower.includes("lluvia")) {
            return "RAINY";
        }

        if (mainLower === "snow" || descLower.includes("nieve")) {
            return "STORM"; // Treat snow as storm for game purposes
        }

        if (mainLower === "clouds" || descLower.includes("nubl")) {
            return descLower.includes("despej") || descLower.includes("claro") ? "SUNNY" : "CLOUDY";
        }

        if (mainLower === "clear" || descLower.includes("despej") || descLower.includes("soleado")) {
            return "SUNNY";
        }

        return "CLOUDY";
    }

    mapWeatherType(weatherCode, precipitation = 0, windSpeed = 0, temperature = 0) {
        if (windSpeed >= 40 || [95, 96, 99].includes(weatherCode)) {
            return "STORM";
        }

        if (
            temperature >= 30 &&
            precipitation <= 0.1 &&
            [0, 1].includes(weatherCode)
        ) {
            return "DROUGHT";
        }

        if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(weatherCode)) {
            return "RAINY";
        }

        if ([1, 2, 3, 45, 48].includes(weatherCode)) {
            return "CLOUDY";
        }

        return "SUNNY";
    }

    createWeatherState({
        type,
        temperature = null,
        precipitation = null,
        windSpeed = null,
        humidity = null,
        source = "fallback",
        location = "",
        condition = null
    }) {
        const profile = WEATHER_PROFILES[type] || WEATHER_PROFILES.SUNNY;

        return {
            type,
            label: profile.label,
            temperature,
            precipitation,
            windSpeed,
            humidity,
            condition,
            source,
            location,
            modifiers: {
                ...DEFAULT_MODIFIERS,
                ...profile.modifiers
            },
            updatedAt: new Date().toISOString()
        };
    }

    generateFallbackWeather(cityName) {
        const random = Math.random();
        let type = "SUNNY";

        if (random < 0.3) {
            type = "SUNNY";
        } else if (random < 0.55) {
            type = "CLOUDY";
        } else if (random < 0.8) {
            type = "RAINY";
        } else if (random < 0.92) {
            type = "STORM";
        } else {
            type = "DROUGHT";
        }

        return this.createWeatherState({
            type,
            source: "fallback",
            location: this.getLocationQuery(cityName)
        });
    }

    /**
     * Obtener modificadores según clima actual
     */
    getWeatherModifiers() {
        return this.currentWeather?.modifiers || { ...DEFAULT_MODIFIERS };
    }

    /**
     * Obtener clima actual
     */
    getCurrentWeather() {
        return this.currentWeather;
    }

    /**
     * Iniciar actualización automática cada 30 minutos
     */
    startAutoUpdate(cityName = null) {
        this.stopAutoUpdate(); // Clear any existing timer
        
        const updateWeather = async () => {
            try {
                await this.updateWeather(cityName);
            } catch (error) {
                console.error('Auto-update failed:', error);
            }
        };

        // Initial update
        updateWeather();
        
        // Set up periodic updates
        this.updateTimer = setInterval(updateWeather, this.updateInterval);
    }

    /**
     * Detener actualización automática
     */
    stopAutoUpdate() {
        if (this.updateTimer) {
            clearInterval(this.updateTimer);
            this.updateTimer = null;
        }
    }

    /**
     * Establecer API key de OpenWeatherMap
     */
    setApiKey(apiKey) {
        this.apiKey = apiKey;
    }

    /**
     * Obtener tiempo hasta la próxima actualización
     */
    getTimeUntilNextUpdate() {
        if (!this.lastUpdate) return 0;
        const timeSinceUpdate = Date.now() - this.lastUpdate;
        return Math.max(0, this.updateInterval - timeSinceUpdate);
    }

    /**
     * Forzar actualización manual
     */
    async forceUpdate(cityName) {
        this.lastUpdate = 0; // Reset timer to force update
        return await this.updateWeather(cityName);
    }

}
