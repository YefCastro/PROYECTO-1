/**
 * ============================================
 * CITY BUILDER GAME - BUILDING BASE CLASS
 * ============================================
 * Clase base abstracta para todos los edificios.
 */

import { Helpers } from "../js/utils/helpers.js";

export class Building {

    constructor(type, x, y, config) {

        if (new.target === Building) {
            throw new Error("Building es una clase abstracta y no puede instanciarse directamente.");
        }

        this.id = Helpers.generateId("bld");
        this.type = type;
        this.variantKey = config.variantKey || null;

        this.x = x;
        this.y = y;

        this.level = 1;
        this.isActive = true;

        // Configuración específica del edificio
        this.cost = config.cost || 0;
        this.maintenanceCost = config.maintenance || 0;

        this.electricityConsumption = config.electricityConsumption || 0;
        this.waterConsumption = config.waterConsumption || 0;

        this.electricityProduction = config.electricityProduction || 0;
        this.waterProduction = config.waterProduction || 0;
        this.foodProduction = config.foodProduction || 0;

        this.capacity = config.capacity || 0;
        this.happinessImpact = config.happinessImpact || 0;
        this.requiresElectricity = Boolean(config.requiresElectricity);
        this.requiresWater = Boolean(config.requiresWater);
    }

    /**
     * =========================
     * POSICIÓN
     * =========================
     */

    getPosition() {
        return { x: this.x, y: this.y };
    }

    setPosition(x, y) {
        this.x = x;
        this.y = y;
    }

    getKey() {
        return `${this.x}-${this.y}`;
    }

    /**
     * =========================
     * ACTIVACIÓN
     * =========================
     */

    activate() {
        this.isActive = true;
    }

    deactivate() {
        this.isActive = false;
    }

    isOperational(resources = null) {
        if (!this.isActive) {
            return false;
        }

        if (!resources) {
            return true;
        }

        if (this.requiresElectricity && resources.electricity <= 0) {
            return false;
        }

        if (this.requiresWater && resources.water <= 0) {
            return false;
        }

        return true;
    }

    /**
     * =========================
     * NIVEL
     * =========================
     */

    upgrade() {
        this.level++;
        this.capacity = Math.floor(this.capacity * 1.2);
        this.maintenanceCost = Math.floor(this.maintenanceCost * 1.1);
    }

    /**
     * =========================
     * PRODUCCIÓN / CONSUMO
     * =========================
     */

    getElectricityConsumption() {
        return this.isActive ? this.electricityConsumption : 0;
    }

    getWaterConsumption() {
        return this.isActive ? this.waterConsumption : 0;
    }

    getElectricityProduction() {
        return this.isActive ? this.electricityProduction : 0;
    }

    getWaterProduction() {
        return this.isActive ? this.waterProduction : 0;
    }

    getFoodProduction() {
        return this.isActive ? this.foodProduction : 0;
    }

    /**
     * =========================
     * SERIALIZACIÓN
     * =========================
     */

    toJSON() {
        return {
            id: this.id,
            type: this.type,
            x: this.x,
            y: this.y,
            level: this.level,
            isActive: this.isActive,
            cost: this.cost,
            maintenanceCost: this.maintenanceCost,
            electricityConsumption: this.electricityConsumption,
            waterConsumption: this.waterConsumption,
            electricityProduction: this.electricityProduction,
            waterProduction: this.waterProduction,
            foodProduction: this.foodProduction,
            capacity: this.capacity,
            happinessImpact: this.happinessImpact,
            requiresElectricity: this.requiresElectricity,
            requiresWater: this.requiresWater,
            variantKey: this.variantKey
        };
    }

    loadFromJSON(data) {
        this.id = data.id;
        this.type = data.type;
        this.x = data.x;
        this.y = data.y;
        this.level = data.level;
        this.isActive = data.isActive;
        this.cost = data.cost;
        this.maintenanceCost = data.maintenanceCost;
        this.electricityConsumption = data.electricityConsumption;
        this.waterConsumption = data.waterConsumption;
        this.electricityProduction = data.electricityProduction;
        this.waterProduction = data.waterProduction;
        this.foodProduction = data.foodProduction;
        this.capacity = data.capacity;
        this.happinessImpact = data.happinessImpact || 0;
        this.requiresElectricity = Boolean(data.requiresElectricity);
        this.requiresWater = Boolean(data.requiresWater);
        this.variantKey = data.variantKey || null;
    }

}
