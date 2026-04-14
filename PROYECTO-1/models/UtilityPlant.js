/**
 * ============================================
 * CITY BUILDER GAME - UTILITY PLANT
 * ============================================
 * Planta de servicios (electricidad, agua, etc.)
 */

import { Building } from "./Building.js";

export class UtilityPlant extends Building {

    constructor(utilityType, x, y, config) {
        super("utility", x, y, config);

        this.utilityType = utilityType; // "electricity" | "water" | "food"
    }

    /**
     * =========================
     * PRODUCCIÓN SEGÚN TIPO
     * =========================
     */

    getProduction() {
        if (!this.isOperational()) return 0;

        switch (this.utilityType) {
            case "electricity":
                return this.electricityProduction;

            case "water":
                return this.waterProduction;

            case "food":
                return this.foodProduction;

            default:
                return 0;
        }
    }

    /**
     * =========================
     * UPGRADE
     * =========================
     */

    upgrade() {
        super.upgrade();

        // Incrementa producción 20%
        this.electricityProduction = Math.floor(this.electricityProduction * 1.2);
        this.waterProduction = Math.floor(this.waterProduction * 1.2);
        this.foodProduction = Math.floor(this.foodProduction * 1.2);
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
            utilityType: this.utilityType
        };
    }

    loadFromJSON(data) {
        super.loadFromJSON(data);
        this.utilityType = data.utilityType;
    }

}
