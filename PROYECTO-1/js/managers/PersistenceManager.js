/**
 * ============================================
 * CITY BUILDER GAME - PERSISTENCE MANAGER
 * ============================================
 * Maneja guardado y carga de partidas.
 */

import { Storage } from "../utils/localStorage.js";
import { City } from "../../models/City.js";
import { Citizen } from "../../models/Citizen.js";
import { ResidentialBuilding } from "../../models/ResidentialBuilding.js";
import { CommercialBuilding } from "../../models/CommercialBuilding.js";
import { IndustrialBuilding } from "../../models/IndustrialBuilding.js";
import { ServiceBuilding } from "../../models/ServiceBuilding.js";
import { UtilityPlant } from "../../models/UtilityPlant.js";
import { Road } from "../../models/Road.js";

export class PersistenceManager {

    constructor(gameState) {
        this.gameState = gameState;
        this.storageKey = "city-builder-save";
    }

    /**
     * =========================
     * GUARDAR
     * =========================
     */

    saveGame() {
        const data = this.gameState.toJSON();
        Storage.set(this.storageKey, data);
    }

    getBuildingTypesConfig(config) {
        return config?.buildingTypes || config?.buildings || {};
    }

    getRawBuildingConfig(config, type, subType = null) {
        const rawConfig = this.getBuildingTypesConfig(config)[type];

        if (!rawConfig) {
            return null;
        }

        if (!rawConfig.variants) {
            return rawConfig;
        }

        const normalizedSubtype = String(subType || "").toUpperCase();
        const variantConfig = rawConfig.variants[normalizedSubtype];

        if (!variantConfig) {
            return null;
        }

        return {
            ...rawConfig,
            ...variantConfig,
            category: rawConfig.category || variantConfig.category || "GENERAL",
            label: variantConfig.label || rawConfig.label || type,
            requiresRoad: variantConfig.requiresRoad ?? rawConfig.requiresRoad ?? false,
            stats: {
                ...(rawConfig.stats || {}),
                ...(variantConfig.stats || {})
            },
            variantKey: normalizedSubtype,
            serviceType: variantConfig.serviceType || rawConfig.serviceType || null,
            utilityType: variantConfig.utilityType || rawConfig.utilityType || null,
            coverageRadius: variantConfig.coverageRadius ?? rawConfig.coverageRadius ?? 0,
            happinessBoost: variantConfig.happinessBoost ?? rawConfig.happinessBoost ?? 0
        };
    }

    getNormalizedBuildingConfig(config, type, subType = null) {
        const rawConfig = this.getRawBuildingConfig(config, type, subType);

        if (!rawConfig) {
            return null;
        }

        const stats = rawConfig.stats || {};

        return {
            cost: rawConfig.cost || 0,
            maintenance: rawConfig.maintenance || rawConfig.maintenanceCost || 0,
            capacity:
                stats.capacity ||
                stats.populationCapacity ||
                rawConfig.capacity ||
                rawConfig.populationCapacity ||
                rawConfig.jobCapacity ||
                0,
            electricityConsumption: stats.electricityConsumption || rawConfig.electricityConsumption || 0,
            waterConsumption: stats.waterConsumption || rawConfig.waterConsumption || 0,
            foodConsumption: stats.foodConsumption || rawConfig.foodConsumption || 0,
            electricityProduction: stats.electricityProduction || rawConfig.electricityProduction || 0,
            waterProduction: stats.waterProduction || rawConfig.waterProduction || 0,
            foodProduction: stats.foodProduction || rawConfig.foodProduction || 0,
            incomePerTurn: stats.moneyProduction || rawConfig.moneyProduction || 0,
            happinessBoost: rawConfig.happinessBoost || stats.happinessImpact || rawConfig.happinessImpact || 0,
            pollutionImpact: rawConfig.pollutionImpact || Math.abs(stats.happinessImpact || 0),
            coverageRadius: rawConfig.coverageRadius || stats.coverageRadius || 0,
            serviceType: rawConfig.serviceType || null,
            utilityType: rawConfig.utilityType || null
        };
    }

    getConfigTypeForSavedBuilding(type) {
        const typeMap = {
            residential: "RESIDENTIAL",
            commercial: "COMMERCIAL",
            industrial: "INDUSTRIAL",
            service: "SERVICE",
            utility: "UTILITY_PLANT",
            road: "ROAD"
        };

        return typeMap[type] || String(type || "").toUpperCase();
    }

    getSubtypeForSavedBuilding(bData) {
        const serviceTypeMap = {
            hospital: "HOSPITAL",
            health: "HOSPITAL",
            police: "POLICE_STATION",
            security: "POLICE_STATION",
            fire: "FIRE_STATION",
            firefighters: "FIRE_STATION",
            park: "PARK",
            recreation: "PARK"
        };

        const utilityTypeMap = {
            electricity: "POWER_PLANT",
            water: "WATER_PLANT",
            food: "FOOD_PLANT"
        };

        if (bData.type === "service") {
            return serviceTypeMap[bData.serviceType] || null;
        }

        if (bData.type === "utility") {
            return utilityTypeMap[bData.utilityType] || null;
        }

        return null;
    }

    createBuildingFromSave(bData, config) {
        const configType = bData.type === "service" && bData.serviceType === "park"
            ? "PARK"
            : this.getConfigTypeForSavedBuilding(bData.type);
        const subType = this.getSubtypeForSavedBuilding(bData);
        const normalizedConfig = this.getNormalizedBuildingConfig(config, configType, subType);

        if (!normalizedConfig) {
            return null;
        }

        let building = null;

        switch (bData.type) {
            case "residential":
                building = new ResidentialBuilding(bData.x, bData.y, normalizedConfig);
                building.loadFromJSON(bData, Citizen);
                break;

            case "commercial":
                building = new CommercialBuilding(bData.x, bData.y, normalizedConfig);
                building.loadFromJSON(bData, Citizen);
                break;

            case "industrial":
                building = new IndustrialBuilding(bData.x, bData.y, normalizedConfig);
                building.loadFromJSON(bData, Citizen);
                break;

            case "service":
                building = new ServiceBuilding(
                    normalizedConfig.serviceType || bData.serviceType,
                    bData.x,
                    bData.y,
                    normalizedConfig
                );
                building.loadFromJSON(bData);
                break;

            case "utility":
                building = new UtilityPlant(
                    normalizedConfig.utilityType || bData.utilityType,
                    bData.x,
                    bData.y,
                    normalizedConfig
                );
                building.loadFromJSON(bData);
                break;
        }

        return building;
    }

    /**
     * =========================
     * CARGAR
     * =========================
     */

    loadGame(config) {

        const data = Storage.get(this.storageKey);
        if (!data?.city) return false;

        const defaultMapWidth = config?.map?.width || config?.map?.size || 15;
        const defaultMapHeight = config?.map?.height || config?.map?.size || defaultMapWidth;
        const city = new City(data.city.name, {
            width: data.city.map?.width || defaultMapWidth,
            height: data.city.map?.height || defaultMapHeight,
            initialResources: config?.resources?.initial || {},
            citizenNeeds: data.city.citizenNeeds || config?.population?.needs || {},
            geographicRegion: data.city.geographicRegion || config?.city?.geographicRegion || {},
            currentTurn: data.city.currentTurn ?? data.turn ?? config?.game?.initialTurn ?? 1,
            accumulatedScore: data.city.accumulatedScore ?? data.score ?? 0
        });

        city.resources.loadFromJSON(data.city.resources);

        data.city.buildings.forEach(bData => {
            const building = this.createBuildingFromSave(bData, config);

            if (building) {
                city.addBuilding(building);
            }
        });

        const roadConfig = this.getNormalizedBuildingConfig(config, "ROAD") || {};

        data.city.roads.forEach(rData => {
            const road = new Road(rData.x, rData.y, roadConfig);
            road.loadFromJSON(rData);
            city.addRoad(road);
        });

        data.city.citizens.forEach(cData => {
            const citizen = new Citizen();
            citizen.loadFromJSON(cData);
            city.addCitizen(citizen);
        });

        this.gameState.initialize(city, config);
        this.gameState.loadFromJSON(data);

        return true;
    }

    /**
     * =========================
     * BORRAR GUARDADO
     * =========================
     */

    clearSave() {
        Storage.remove(this.storageKey);
    }

}
