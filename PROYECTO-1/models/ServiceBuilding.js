/**
 * ============================================
 * CITY BUILDER GAME - SERVICE BUILDING
 * ============================================
 * Edificios públicos: police, hospital,
 * fire, school y park.
 */

import { Building } from "./Building.js";

export class ServiceBuilding extends Building {

    constructor(serviceType, x, y, config) {
        super("service", x, y, config);

        this.serviceType = serviceType;

        this.happinessBoost = config.happinessBoost || 5;
        this.coverageRadius = config.coverageRadius || 3;
        this.appliesGlobally = Boolean(config.appliesGlobally);
    }

    /**
     * =========================
     * FELICIDAD
     * =========================
     */

    getHappinessBoost(resources = null) {
        return this.isOperational(resources) ? this.happinessBoost : 0;
    }

    /**
     * =========================
     * COBERTURA
     * =========================
     */

    getCoverageRadius() {
        return this.coverageRadius;
    }

    isPark() {
        return this.serviceType === "park";
    }

    isGlobalService() {
        return this.appliesGlobally || this.isPark();
    }

    /**
     * =========================
     * UPGRADE
     * =========================
     */

    upgrade() {
        super.upgrade();

        this.happinessBoost = Math.floor(this.happinessBoost * 1.2);
        this.coverageRadius += 1;
    }

    /**
     * =========================
     * SERIALIZACIÓN
     * =========================
     */

    toJSON() {
        const base = super.toJSON();

        return {
            ...base,
            serviceType: this.serviceType,
            happinessBoost: this.happinessBoost,
            coverageRadius: this.coverageRadius,
            appliesGlobally: this.appliesGlobally
        };
    }

    loadFromJSON(data) {
        super.loadFromJSON(data);

        this.serviceType = data.serviceType;
        this.happinessBoost = data.happinessBoost || 5;
        this.coverageRadius = data.coverageRadius || 3;
        this.appliesGlobally = Boolean(data.appliesGlobally);
    }

}
