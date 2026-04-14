/**
 * ============================================
 * CITY BUILDER GAME - RESIDENTIAL BUILDING
 * ============================================
 * Edificio residencial donde viven ciudadanos.
 */

import { Building } from "./Building.js";

export class ResidentialBuilding extends Building {

    constructor(x, y, config) {
        super("residential", x, y, config);

        this.residents = []; // Lista de ciudadanos asignados
        this.housingHappiness = config.happinessImpact || 0;
    }

    /**
     * =========================
     * RESIDENTES
     * =========================
     */

    addResident(citizen) {
        if (this.isFull()) return false;

        this.residents.push(citizen);
        citizen.assignHome(this.id);
        return true;
    }

    removeResident(citizenId) {
        this.residents = this.residents.filter(c => c.id !== citizenId);
    }

    getResidents() {
        return this.residents;
    }

    getResidentCount() {
        return this.residents.length;
    }

    isFull() {
        return this.residents.length >= this.capacity;
    }

    hasAvailableSpace() {
        return this.residents.length < this.capacity;
    }

    getHousingHappinessBoost(resources = null) {
        return this.isOperational(resources) ? this.housingHappiness : 0;
    }

    /**
     * =========================
     * OVERRIDE UPGRADE
     * =========================
     */

    upgrade() {
        super.upgrade();
        // Aumenta capacidad adicional en residenciales
        this.capacity = Math.floor(this.capacity * 1.3);
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
            housingHappiness: this.housingHappiness,
            residents: this.residents.map(c => c.toJSON())
        };
    }

    loadFromJSON(data, CitizenClass) {
        super.loadFromJSON(data);

        if (data.residents && CitizenClass) {
            this.residents = data.residents.map(cData => {
                const citizen = new CitizenClass();
                citizen.loadFromJSON(cData);
                return citizen;
            });
        }

        this.housingHappiness = data.housingHappiness || this.happinessImpact || 0;
    }

}
