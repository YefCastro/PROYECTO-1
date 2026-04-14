/**
 * ============================================
 * CITY BUILDER GAME - PANEL CONTROLLER
 * ============================================
 * Controla la actualizacion de los paneles UI.
 */

export class PanelController {

    constructor() {
        this.cityNameEl = document.getElementById("city-name-display");
        this.regionEl = document.getElementById("region-display");
        this.mapSizeEl = document.getElementById("map-size-display");
        this.moneyEl = document.getElementById("money");
        this.electricityEl = document.getElementById("electricity");
        this.waterEl = document.getElementById("water");
        this.foodEl = document.getElementById("food");

        this.turnEl = document.getElementById("turn");
        this.scoreEl = document.getElementById("score");
        this.weatherEl = document.getElementById("weather");

        this.newsEl = document.getElementById("news");
        this.routeSummaryEl = document.getElementById("route-summary");
    }

    updateCityName(name) {
        if (this.cityNameEl) {
            this.cityNameEl.textContent = name || "Mi Ciudad";
        }
    }

    updateCityMeta(region, mapSize) {
        if (this.regionEl) {
            this.regionEl.textContent = region
                ? `Region: ${region.name}, ${region.department}`
                : "Region: Sin definir";
        }

        if (this.mapSizeEl) {
            this.mapSizeEl.textContent = mapSize
                ? `Mapa: ${mapSize.width}x${mapSize.height}`
                : "Mapa: Sin definir";
        }
    }

    /**
     * Actualiza recursos
     */
    updateResources(resources) {
        if (this.moneyEl) this.moneyEl.textContent = `Dinero: $${resources.money}`;
        if (this.electricityEl) {
            this.electricityEl.textContent = `Electricidad: ${resources.electricity} (Balance ${resources.getElectricityBalance()})`;
        }
        if (this.waterEl) {
            this.waterEl.textContent = `Agua: ${resources.water} (Balance ${resources.getWaterBalance()})`;
        }
        if (this.foodEl) {
            this.foodEl.textContent = `Comida: ${resources.food} (Balance ${resources.getFoodBalance()})`;
        }
    }

    /**
     * Actualiza turno
     */
    updateTurn(turn) {
        if (this.turnEl) {
            this.turnEl.textContent = `Turno: ${turn}`;
        }
    }

    /**
     * Actualiza puntaje
     */
    updateScore(score) {
        if (this.scoreEl) {
            this.scoreEl.textContent = `Puntuacion: ${score}`;
        }
    }

    /**
     * Actualiza clima
     */
    updateWeather(weather) {
        if (!this.weatherEl) {
            return;
        }

        if (!weather) {
            this.weatherEl.textContent = "Clima: Sin datos";
            return;
        }

        if (typeof weather === "string") {
            this.weatherEl.textContent = `Clima: ${weather}`;
            return;
        }

        const details = [weather.label || weather.type || "Sin datos"];

        if (Number.isFinite(weather.temperature)) {
            details.push(`${Math.round(weather.temperature)} C`);
        }

        if (weather.location) {
            details.push(weather.location);
        }

        details.push(weather.source === "open-meteo" ? "real" : "local");

        this.weatherEl.textContent = `Clima: ${details.join(" | ")}`;
    }

    /**
     * Mostrar noticia
     */
    showNews(message) {
        if (this.newsEl) {
            this.newsEl.textContent = message;
        }
    }

    updateRouteSummary(route) {
        if (!this.routeSummaryEl) {
            return;
        }

        if (!route) {
            this.routeSummaryEl.textContent = "Sin ruta activa.";
            return;
        }

        this.routeSummaryEl.textContent = [
            `Origen (${route.origin.x}, ${route.origin.y})`,
            `Destino (${route.destination.x}, ${route.destination.y})`,
            `Tramos: ${route.distance}`,
            `Costo: ${route.cost}`
        ].join(" | ");
    }

    /**
     * Mostrar mensaje generico
     */
    showMessage(message) {
        alert(message);
    }

}
