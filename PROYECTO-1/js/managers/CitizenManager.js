/**
 * ============================================
 * CITY BUILDER GAME - CITIZEN MANAGER
 * ============================================
 * Gestiona poblacion, vivienda, empleo y felicidad.
 */

import { Citizen } from "../../models/Citizen.js";
import { DomainRulesService } from "../services/DomainRulesService.js";

export class CitizenManager {

    constructor(city, config = {}) {
        this.city = city;
        this.config = config;
        this.domainRules = new DomainRulesService(city);
        this.growthRate = Math.max(1, Math.min(3, Number(config?.citizenGrowthRate ?? 2)));
    }

    getPopulationConfig() {
        return this.config?.population || {};
    }

    getGrowthRate() {
        return Math.max(0, Number(this.getPopulationConfig().growthRate ?? 0.05));
    }

    getBaseHappiness() {
        return Math.max(0, Number(this.getPopulationConfig().baseHappiness ?? 50));
    }

    getResidentialBuildingsWithSpace() {
        return this.city
            .getBuildingsByType("residential")
            .filter(building => building.hasAvailableSpace());
    }

    getEmploymentRate() {
        const population = this.city.getPopulation();

        if (population === 0) {
            return 1;
        }

        const employed = this.city.citizens.filter(citizen => citizen.isEmployed).length;
        return employed / population;
    }

    hasStableResources() {
        const resources = this.city.resources;

        return !resources.isElectricityNegative()
            && !resources.isWaterNegative()
            && !resources.isMoneyNegative();
    }

    getFoodSecurity(context = {}) {
        const report = context?.resourceReport || {};
        const demand = Number(report.citizenFoodConsumption ?? 0);
        const storedFood = Number(this.city.resources.food ?? 0);

        if (demand <= 0) {
            return {
                sufficient: true,
                coverage: 1
            };
        }

        if (Number.isFinite(report.foodCoverage)) {
            return {
                sufficient: Boolean(report.foodSufficient),
                coverage: Math.max(0, Math.min(1, report.foodCoverage))
            };
        }

        return {
            sufficient: storedFood >= demand,
            coverage: Math.max(0, Math.min(1, storedFood / demand))
        };
    }

    calculateServiceFactor() {
        const serviceCount = this.city.buildings.filter(building => building.type === "service").length;

        if (serviceCount === 0) {
            return 0.8;
        }

        return Math.min(1.25, 0.8 + (serviceCount * 0.08));
    }

    calculateGrowthCapacity() {
        // Use DomainRulesService to check growth requirements
        const growthRequirements = this.domainRules.checkGrowthRequirements();
        
        if (!growthRequirements.valid) {
            return 0;
        }

        const residentialBuildings = this.getResidentialBuildingsWithSpace();
        const totalAvailableSpace = residentialBuildings.reduce(
            (total, building) => total + (building.capacity - building.getResidentCount()),
            0
        );

        if (totalAvailableSpace <= 0) {
            return 0;
        }

        if (!this.hasStableResources()) {
            return 0;
        }

        const population = this.city.getPopulation();
        const averageHappiness = population === 0
            ? this.getBaseHappiness()
            : this.city.getAverageHappiness();

        if (population > 0 && averageHappiness < 25) {
            return 0;
        }

        const happinessFactor = Math.max(0.25, averageHappiness / 100);
        const employmentFactor = population === 0
            ? 1
            : Math.max(0.35, this.getEmploymentRate());
        const serviceFactor = this.calculateServiceFactor();

        const growthCapacity = Math.ceil(
            totalAvailableSpace
            * this.getGrowthRate()
            * happinessFactor
            * employmentFactor
            * serviceFactor
        );

        return Math.min(
            totalAvailableSpace,
            Math.max(1, growthCapacity)
        );
    }

    /**
     * Verifica las condiciones para la creación de ciudadanos
     */
    canCitizensBeCreated() {
        const population = this.city.getPopulation();
        const averageHappiness = population === 0
            ? this.getBaseHappiness()
            : this.city.getAverageHappiness();

        // Condición 1: Hay viviendas disponibles
        const hasHousing = this.getResidentialBuildingsWithSpace().length > 0;

        // Condición 2: Felicidad promedio > 60
        const hasGoodHappiness = averageHappiness > 60;

        // Condición 3: Hay empleos disponibles
        const hasJobs = this.hasAvailableJobs();

        return hasHousing && hasGoodHappiness && hasJobs;
    }

    /**
     * Verifica si hay empleos disponibles
     */
    hasAvailableJobs() {
        const jobBuildings = this.city.buildings.filter(building =>
            (building.type === "commercial" || building.type === "industrial")
            && building.hasVacancy?.()
        );

        return jobBuildings.length > 0;
    }

    getResidentialBuildingById(id) {
        return this.city.buildings.find(building => building.id === id) || null;
    }

    isServiceOperational(serviceBuilding) {
        return typeof serviceBuilding.isOperational === "function"
            ? serviceBuilding.isOperational(this.city.resources)
            : true;
    }

    isBuildingWithinCoverage(sourceBuilding, serviceBuilding) {
        if (!sourceBuilding || !serviceBuilding) {
            return false;
        }

        const distance = Math.abs(sourceBuilding.x - serviceBuilding.x)
            + Math.abs(sourceBuilding.y - serviceBuilding.y);

        return distance <= serviceBuilding.getCoverageRadius();
    }

    calculateCitizenHappinessDelta(citizen, context = {}) {
        let positiveFactors = 0;
        let negativeFactors = 0;
        const homeBuilding = this.getResidentialBuildingById(citizen.homeId);

        // Factores positivos
        // Tiene vivienda: +20
        if (homeBuilding) {
            positiveFactors += 20;
        } else {
            negativeFactors += 20; // Sin vivienda: -20
        }

        // Tiene empleo: +15
        if (citizen.isEmployed) {
            positiveFactors += 15;
        } else {
            negativeFactors += 15; // Sin empleo: -15
        }

        // Parques, hospitales, estaciones de policía según su valor
        if (homeBuilding) {
            this.city.buildings
                .filter(building => building.type === "service")
                .forEach(serviceBuilding => {
                    if (!this.isServiceOperational(serviceBuilding)) {
                        return;
                    }

                    if (serviceBuilding.isGlobalService?.()) {
                        positiveFactors += serviceBuilding.getHappinessBoost(this.city.resources);
                        return;
                    }

                    if (this.isBuildingWithinCoverage(homeBuilding, serviceBuilding)) {
                        positiveFactors += serviceBuilding.getHappinessBoost(this.city.resources);
                    }
                });
        }

        // Aplicar fórmula: felicidad = factores_positivos - factores_negativos
        return positiveFactors - negativeFactors;
    }

    /**
     * =========================
     * CRECIMIENTO POBLACIONAL
     * =========================
     */

    processPopulationGrowth() {
        let citizensToAdd = this.calculateGrowthCapacity();

        if (citizensToAdd <= 0) {
            return 0;
        }

        const residentialBuildings = this.getResidentialBuildingsWithSpace();
        let citizensAdded = 0;

        for (const building of residentialBuildings) {
            while (building.hasAvailableSpace() && citizensToAdd > 0) {
                const citizen = new Citizen();
                
                // Asignación automática de vivienda
                const housingAssigned = building.addResident(citizen);

                if (!housingAssigned) {
                    break;
                }

                // Asignar vivienda al ciudadano
                citizen.assignHome(building.id);

                this.city.addCitizen(citizen);
                citizensToAdd--;
                citizensAdded++;
            }

            if (citizensToAdd <= 0) {
                break;
            }
        }

        return citizensAdded;
    }

    /**
     * =========================
     * EMPLEO AUTOMATICO
     * =========================
     */

    assignJobs() {
        const unemployed = this.city.getUnemployedCitizens();

        const jobBuildings = this.city.buildings.filter(building =>
            (building.type === "commercial" || building.type === "industrial")
            && building.hasVacancy?.()
        );

        jobBuildings.forEach(building => {
            while (building.hasVacancy() && unemployed.length > 0) {
                const citizen = unemployed.shift();
                
                // Asignación automática de empleo
                building.addEmployee(citizen);
                citizen.employ();
            }
        });
    }

    /**
     * Asigna empleos a ciudadanos desempleados
     */
    assignJobs() {
        const unemployedCitizens = this.getUnemployedCitizens();

        unemployedCitizens.forEach(citizen => {
            const jobBuildings = this.getJobBuildingsWithVacancies();

            if (jobBuildings.length > 0) {
                const building = jobBuildings[0];
                building.addEmployee(citizen);
                citizen.employ();
            }
        });
    }

    /**
     * Realiza asignación automática de vivienda y empleo usando DomainRulesService
     */
    performAutomaticAssignment() {
        return this.domainRules.performAutomaticAssignment();
    }

    /**
     * Establece la tasa de crecimiento de ciudadanos (1-3 por turno)
     */
    setGrowthRate(rate) {
        this.growthRate = Math.max(1, Math.min(3, Number(rate)));
    }

    /**
     * Obtiene la tasa de crecimiento actual
     */
    getCurrentGrowthRate() {
        return this.growthRate;
    }

    /**
     * =========================
     * AJUSTE DE FELICIDAD
     * =========================
     */

    adjustCitizenHappiness(context = {}) {
        this.city.citizens.forEach(citizen => {
            const happinessDelta = this.calculateCitizenHappinessDelta(citizen, context);

            if (happinessDelta >= 0) {
                citizen.increaseHappiness(happinessDelta);
            } else {
                citizen.decreaseHappiness(Math.abs(happinessDelta));
            }
        });
    }

    /**
     * =========================
     * PROCESAMIENTO COMPLETO
     * =========================
     */

    processTurn(context = {}) {
        this.processPopulationGrowth();
        this.assignJobs();
        this.adjustCitizenHappiness(context);
    }

}
