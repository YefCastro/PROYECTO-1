/**
 * ============================================
 * CITY BUILDER GAME - RESOURCE MANAGER
 * ============================================
 * Calcula produccion, consumo e ingresos por turno.
 */

import { Resources } from "../../models/Resources.js";

export class ResourceManager {

    constructor(city) {
        this.city = city;
    }

    buildOperationalResourcesSnapshot(resources) {
        return {
            money: resources.money,
            electricity: resources.electricity,
            water: resources.water,
            food: resources.food
        };
    }

    isBuildingOperational(building, resourcesSnapshot) {
        return typeof building.isOperational === "function"
            ? building.isOperational(resourcesSnapshot)
            : true;
    }

    /**
     * Ejecuta todos los calculos de recursos por turno
     */
    processTurn(weather = null) {
        const resources = this.city.resources;
        const resourcesSnapshot = this.buildOperationalResourcesSnapshot(resources);
        const totalPopulation = this.city.getPopulation();
        const modifiers = {
            electricityProduction: weather?.modifiers?.electricityProduction ?? 1,
            waterProduction: weather?.modifiers?.waterProduction ?? 1,
            foodProduction: weather?.modifiers?.foodProduction ?? 1,
            electricityConsumption: weather?.modifiers?.electricityConsumption ?? 1,
            waterConsumption: weather?.modifiers?.waterConsumption ?? 1,
            foodConsumption: weather?.modifiers?.foodConsumption ?? 1,
            income: weather?.modifiers?.income ?? 1,
            maintenance: weather?.modifiers?.maintenance ?? 1
        };

        let totalElectricityProduction = 0;
        let totalElectricityConsumption = 0;

        let totalWaterProduction = 0;
        let totalWaterConsumption = 0;

        let totalFoodProduction = 0;
        let totalCitizenFoodConsumption = 0;

        let totalIncome = 0;
        let totalMaintenance = 0;

        const safeNumber = value => Number.isFinite(value) ? value : 0;
        const applyModifier = (value, modifier) => {
            return Math.round(safeNumber(value) * modifier);
        };

        this.city.buildings.forEach(building => {
            const isOperational = this.isBuildingOperational(building, resourcesSnapshot);

            totalElectricityProduction += applyModifier(
                isOperational ? building.getElectricityProduction() : 0,
                modifiers.electricityProduction
            );
            totalElectricityConsumption += applyModifier(
                building.getElectricityConsumption(),
                modifiers.electricityConsumption
            );

            totalWaterProduction += applyModifier(
                isOperational ? building.getWaterProduction() : 0,
                modifiers.waterProduction
            );
            totalWaterConsumption += applyModifier(
                building.getWaterConsumption(),
                modifiers.waterConsumption
            );

            totalFoodProduction += applyModifier(
                isOperational ? building.getFoodProduction() : 0,
                modifiers.foodProduction
            );

            // Calcular costo de mantenimiento dinámico (0.01% del costo del edificio)
            const dynamicMaintenanceCost = building.cost * 0.0001; // 0.01% = 0.0001 como decimal
            const totalBuildingMaintenance = (building.maintenanceCost || 0) + dynamicMaintenanceCost;
            
            totalMaintenance += applyModifier(
                totalBuildingMaintenance,
                modifiers.maintenance
            );

            if (typeof building.calculateIncome === "function") {
                totalIncome += applyModifier(
                    building.calculateIncome(resourcesSnapshot),
                    modifiers.income
                );
            }
        });

        this.city.citizens.forEach(citizen => {
            const consumption = typeof citizen.getBasicConsumption === "function"
                ? citizen.getBasicConsumption()
                : { water: 0, electricity: 0, food: 0 };

            totalElectricityConsumption += applyModifier(
                consumption.electricity || 0,
                modifiers.electricityConsumption
            );
            totalWaterConsumption += applyModifier(
                consumption.water || 0,
                modifiers.waterConsumption
            );
            totalCitizenFoodConsumption += applyModifier(
                consumption.food || 0,
                modifiers.foodConsumption
            );
        });

        const availableFoodBeforeConsumption = resources.food + totalFoodProduction;
        const foodCoverage = totalCitizenFoodConsumption <= 0
            ? 1
            : Math.min(1, availableFoodBeforeConsumption / totalCitizenFoodConsumption);
        const isFoodSufficient = availableFoodBeforeConsumption >= totalCitizenFoodConsumption;

        resources.updateElectricity(
            totalElectricityProduction,
            totalElectricityConsumption
        );

        resources.updateWater(
            totalWaterProduction,
            totalWaterConsumption
        );

        resources.updateFood(
            totalFoodProduction,
            totalCitizenFoodConsumption
        );

        resources.addMoney(totalIncome);
        resources.subtractMoney(totalMaintenance);

        return {
            income: totalIncome,
            maintenance: totalMaintenance,
            electricityBalance: resources.getElectricityBalance(),
            waterBalance: resources.getWaterBalance(),
            foodBalance: resources.getFoodBalance(),
            citizenFoodConsumption: totalCitizenFoodConsumption,
            availableFoodBeforeConsumption,
            foodCoverage,
            foodSufficient: isFoodSufficient,
            population: totalPopulation,
            weatherModifiers: modifiers
        };
    }

    /**
     * Verifica si hay colapso de recursos
     */
    checkForCollapse() {
        const resources = this.city.resources;

        if (resources.isElectricityNegative()) {
            return "electricity";
        }

        if (resources.isWaterNegative()) {
            return "water";
        }

        return null;
    }

}
