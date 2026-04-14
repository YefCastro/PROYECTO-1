/**
 * ============================================
 * CITY BUILDER GAME - INDUSTRIAL BUILDING
 * ============================================
 * Edificio industrial: alto ingreso, alto consumo,
 * impacto negativo en felicidad.
 */

import { Building } from "./Building.js";

export class IndustrialBuilding extends Building {

    constructor(x, y, config) {
        super("industrial", x, y, config);

        this.employees = [];
        this.incomePerTurn = config.incomePerTurn || 0;
        this.pollutionImpact = config.pollutionImpact || 5; // Impacto base
    }

    /**
     * =========================
     * EMPLEADOS
     * =========================
     */

    addEmployee(citizen) {
        if (this.isFull()) return false;

        this.employees.push(citizen);
        citizen.employ();
        return true;
    }

    removeEmployee(citizenId) {
        this.employees = this.employees.filter(c => c.id !== citizenId);
    }

    getEmployeeCount() {
        return this.employees.length;
    }

    isFull() {
        return this.employees.length >= this.capacity;
    }

    hasVacancy() {
        return this.employees.length < this.capacity;
    }

    /**
     * =========================
     * INGRESOS
     * =========================
     */

    calculateIncome(resources = null) {
        if (!this.isOperational(resources)) return 0;
        if (this.capacity <= 0) return 0;

        const employmentFactor = this.employees.length / this.capacity;
        return Math.floor(this.incomePerTurn * employmentFactor);
    }

    /**
     * =========================
     * IMPACTO AMBIENTAL
     * =========================
     */

    getPollutionImpact() {
        return this.isActive ? this.pollutionImpact : 0;
    }

    /**
     * =========================
     * UPGRADE
     * =========================
     */

    upgrade() {
        super.upgrade();

        this.capacity = Math.floor(this.capacity * 1.25);
        this.incomePerTurn = Math.floor(this.incomePerTurn * 1.3);
        this.pollutionImpact = Math.floor(this.pollutionImpact * 1.1);
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
            incomePerTurn: this.incomePerTurn,
            pollutionImpact: this.pollutionImpact,
            employees: this.employees.map(c => c.toJSON())
        };
    }

    loadFromJSON(data, CitizenClass) {
        super.loadFromJSON(data);

        this.incomePerTurn = data.incomePerTurn || 0;
        this.pollutionImpact = data.pollutionImpact || 5;

        if (data.employees && CitizenClass) {
            this.employees = data.employees.map(cData => {
                const citizen = new CitizenClass();
                citizen.loadFromJSON(cData);
                return citizen;
            });
        }
    }

}
