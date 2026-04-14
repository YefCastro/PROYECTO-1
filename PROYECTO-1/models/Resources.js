/**
 * ============================================
 * CITY BUILDER GAME - RESOURCES MODEL
 * ============================================
 * Representa el estado de recursos de la ciudad.
 */

import { GAME_CONSTANTS } from "../js/utils/constans.js";

export class Resources {

    constructor(initialResources = {}) {
        this.money = initialResources.money ?? GAME_CONSTANTS.INITIAL_RESOURCES.MONEY;
        this.electricity = initialResources.electricity ?? GAME_CONSTANTS.INITIAL_RESOURCES.ELECTRICITY;
        this.water = initialResources.water ?? GAME_CONSTANTS.INITIAL_RESOURCES.WATER;
        this.food = initialResources.food ?? GAME_CONSTANTS.INITIAL_RESOURCES.FOOD;

        this.electricityProduction = 0;
        this.electricityConsumption = 0;

        this.waterProduction = 0;
        this.waterConsumption = 0;

        this.foodProduction = 0;
        this.foodConsumption = 0;
    }

    normalizeAmount(amount, fallback = 0) {
        const parsedAmount = Number(amount);
        return Number.isFinite(parsedAmount) ? parsedAmount : fallback;
    }

    /**
     * =========================
     * MONEY
     * =========================
     */

    addMoney(amount) {
        this.money += amount;
    }

    subtractMoney(amount) {
        this.money -= amount;
    }

    hasEnoughMoney(amount) {
        return this.money >= amount;
    }

    setMoney(amount) {
        this.money = this.normalizeAmount(amount, this.money);
        return this.money;
    }

    /**
     * =========================
     * ELECTRICITY
     * =========================
     */

    updateElectricity(production, consumption) {
        this.electricityProduction = production;
        this.electricityConsumption = consumption;
        this.electricity += (production - consumption);
    }

    setElectricity(amount) {
        this.electricity = this.normalizeAmount(amount, this.electricity);
        return this.electricity;
    }

    /**
     * =========================
     * WATER
     * =========================
     */

    updateWater(production, consumption) {
        this.waterProduction = production;
        this.waterConsumption = consumption;
        this.water += (production - consumption);
    }

    setWater(amount) {
        this.water = this.normalizeAmount(amount, this.water);
        return this.water;
    }

    /**
     * =========================
     * FOOD
     * =========================
     */

    updateFood(production, consumption = 0) {
        this.foodProduction = production;
        this.foodConsumption = consumption;
        this.food = Math.max(0, this.food + production - consumption);

        return this.food;
    }

    setFood(amount) {
        this.food = Math.max(0, this.normalizeAmount(amount, this.food));
        return this.food;
    }

    setValues(values = {}) {
        if (values.money !== undefined) {
            this.setMoney(values.money);
        }

        if (values.electricity !== undefined) {
            this.setElectricity(values.electricity);
        }

        if (values.water !== undefined) {
            this.setWater(values.water);
        }

        if (values.food !== undefined) {
            this.setFood(values.food);
        }

        return this.getValues();
    }

    getValues() {
        return {
            money: this.money,
            electricity: this.electricity,
            water: this.water,
            food: this.food
        };
    }

    /**
     * =========================
     * BALANCES
     * =========================
     */

    getElectricityBalance() {
        return this.electricityProduction - this.electricityConsumption;
    }

    getWaterBalance() {
        return this.waterProduction - this.waterConsumption;
    }

    getFoodBalance() {
        return this.foodProduction - this.foodConsumption;
    }

    /**
     * =========================
     * VALIDATION
     * =========================
     */

    isElectricityNegative() {
        return this.electricity < 0;
    }

    isWaterNegative() {
        return this.water < 0;
    }

    isMoneyNegative() {
        return this.money < 0;
    }

    isFoodNegative() {
        return this.food < 0;
    }

    /**
     * =========================
     * SERIALIZATION
     * =========================
     */

    toJSON() {
        return {
            money: this.money,
            electricity: this.electricity,
            water: this.water,
            food: this.food,
            electricityProduction: this.electricityProduction,
            electricityConsumption: this.electricityConsumption,
            waterProduction: this.waterProduction,
            waterConsumption: this.waterConsumption,
            foodProduction: this.foodProduction,
            foodConsumption: this.foodConsumption
        };
    }

    loadFromJSON(data) {
        this.money = data.money;
        this.electricity = data.electricity;
        this.water = data.water;
        this.food = data.food;

        this.electricityProduction = data.electricityProduction || 0;
        this.electricityConsumption = data.electricityConsumption || 0;
        this.waterProduction = data.waterProduction || 0;
        this.waterConsumption = data.waterConsumption || 0;
        this.foodProduction = data.foodProduction || 0;
        this.foodConsumption = data.foodConsumption || 0;
    }

}
