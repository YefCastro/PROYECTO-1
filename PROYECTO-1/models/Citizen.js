/**
 * ============================================
 * CITY BUILDER GAME - CITIZEN MODEL
 * ============================================
 * Representa un ciudadano individual.
 */

import { Helpers } from "../js/utils/helpers.js";

export class Citizen {

    constructor(name = null, basicConsumption = {}) {
        this.id = Helpers.generateId("cit");
        this.name = name || this.generateRandomName();
        this.happiness = 50;       // 0 - 100
        this.isEmployed = false;
        this.homeId = null;        // ID del edificio donde vive
        this.basicConsumption = this.normalizeBasicConsumption(basicConsumption);
        this.needs = {
            housing: true,
            employment: true,
            publicServices: true,
            recreation: true
        };
    }

    /**
     * Genera nombre simple aleatorio
     */
    generateRandomName() {
        const names = ["Alex", "Maria", "Juan", "Laura", "Carlos", "Sofia"];
        return names[Math.floor(Math.random() * names.length)];
    }

    /**
     * =========================
     * HAPPINESS
     * =========================
     */

    increaseHappiness(amount) {
        this.happiness = Math.min(100, this.happiness + amount);
    }

    decreaseHappiness(amount) {
        this.happiness = Math.max(0, this.happiness - amount);
    }

    setHappiness(value) {
        this.happiness = Math.max(0, Math.min(100, value));
    }

    normalizeBasicConsumption(consumption = {}) {
        return {
            water: Math.max(0, Number(consumption.water ?? 1)),
            electricity: Math.max(0, Number(consumption.electricity ?? 1)),
            food: Math.max(0, Number(consumption.food ?? 1))
        };
    }

    setBasicConsumption(consumption) {
        this.basicConsumption = this.normalizeBasicConsumption(consumption);
    }

    getBasicConsumption() {
        return { ...this.basicConsumption };
    }

    /**
     * =========================
     * EMPLOYMENT
     * =========================
     */

    employ() {
        this.isEmployed = true;
    }

    fire() {
        this.isEmployed = false;
    }

    /**
     * =========================
     * HOUSING
     * =========================
     */

    assignHome(buildingId) {
        this.homeId = buildingId;
    }

    removeHome() {
        this.homeId = null;
    }

    /**
     * =========================
     * SERIALIZATION
     * =========================
     */

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            happiness: this.happiness,
            isEmployed: this.isEmployed,
            homeId: this.homeId,
            basicConsumption: this.basicConsumption,
            needs: this.needs
        };
    }

    loadFromJSON(data) {
        this.id = data.id;
        this.name = data.name;
        this.happiness = data.happiness;
        this.isEmployed = data.isEmployed;
        this.homeId = data.homeId;
        this.basicConsumption = this.normalizeBasicConsumption(data.basicConsumption || {});
        this.needs = data.needs || {
            housing: true,
            employment: true,
            publicServices: true,
            recreation: true
        };
    }

}
