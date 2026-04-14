/**
 * ============================================
 * CITY BUILDER GAME - COMMERCIAL BUILDING
 * ============================================
 * Edificio comercial que genera empleo e ingresos.
 */

import { Building } from "./Building.js";

export class CommercialBuilding extends Building {

    constructor(x, y, config) {
        super("commercial", x, y, config);

        this.employees = []; // Ciudadanos empleados aquí
        this.incomePerTurn = config.incomePerTurn || 0;
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

        // Ingreso proporcional a empleados
        const employmentFactor = this.employees.length / this.capacity;
        return Math.floor(this.incomePerTurn * employmentFactor);
    }

    /**
     * =========================
     * UPGRADE
     * =========================
     */

    upgrade() {
        super.upgrade();

        this.capacity = Math.floor(this.capacity * 1.25);
        this.incomePerTurn = Math.floor(this.incomePerTurn * 1.2);
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
            employees: this.employees.map(c => c.toJSON())
        };
    }

    loadFromJSON(data, CitizenClass) {
        super.loadFromJSON(data);

        this.incomePerTurn = data.incomePerTurn || 0;

        if (data.employees && CitizenClass) {
            this.employees = data.employees.map(cData => {
                const citizen = new CitizenClass();
                citizen.loadFromJSON(cData);
                return citizen;
            });
        }
    }

}
