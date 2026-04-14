/**
 * ============================================
 * CITY BUILDER GAME - BUILDING MANAGER
 * ============================================
 * Gestiona construccion, eliminacion y mejoras.
 */

import { Building } from "../../models/Building.js";
import { ResidentialBuilding } from "../../models/ResidentialBuilding.js";
import { CommercialBuilding } from "../../models/CommercialBuilding.js";
import { IndustrialBuilding } from "../../models/IndustrialBuilding.js";
import { ServiceBuilding } from "../../models/ServiceBuilding.js";
import { Road } from "../../models/Road.js";
import { UtilityPlant } from "../../models/UtilityPlant.js";
import { DomainRulesService } from "../services/DomainRulesService.js";

export class BuildingManager {

    constructor(city, config) {
        this.city = city;
        this.config = config;
        this.domainRules = new DomainRulesService(city);
        this.supportedTypes = [
            "RESIDENTIAL",
            "COMMERCIAL",
            "INDUSTRIAL",
            "SERVICE",
            "PARK",
            "UTILITY_PLANT",
            "ROAD"
        ];
    }

    getServiceBenefitOverrides() {
        return this.config?.serviceBenefits || {};
    }

    getServiceBenefitOverride(serviceType) {
        const overrides = this.getServiceBenefitOverrides();
        return Number(overrides?.[serviceType]);
    }

    /**
     * =========================
     * CONSTRUCCION GENERAL
     * =========================
     */
    getAvailableBuildings() {
        return Object.keys(this.getBuildingTypesConfig())
            .filter(type => this.supportedTypes.includes(type));
    }

    getAvailableBuildingOptions() {
        const buildingTypes = this.getBuildingTypesConfig();

        return this.getAvailableBuildings().map(type => ({
            type,
            label: buildingTypes[type]?.label || type,
            category: buildingTypes[type]?.category || "GENERAL",
            hasSubtypes: this.getBuildingSubtypeOptions(type).length > 0
        }));
    }

    getBuildingTypesConfig() {
        return this.config?.buildingTypes || this.config?.buildings || {};
    }

    getRawBuildingConfig(type, subType = null) {
        const rawConfig = this.getBuildingTypesConfig()[type];

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

    getBuildingSubtypeOptions(type) {
        const normalizedType = String(type || "").toUpperCase();
        const rawConfig = this.getBuildingTypesConfig()[normalizedType];

        if (!rawConfig?.variants) {
            return [];
        }

        return Object.entries(rawConfig.variants).map(([value, variant]) => ({
            value,
            label: variant.label || value
        }));
    }

    getNormalizedBuildingConfig(type, subType = null) {
        const rawConfig = this.getRawBuildingConfig(type, subType);

        if (!rawConfig) {
            return null;
        }

        const stats = rawConfig.stats || {};

        return {
            label: rawConfig.label || type,
            category: rawConfig.category || "GENERAL",
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
            happinessBoost: Number.isFinite(this.getServiceBenefitOverride(rawConfig.serviceType))
                ? this.getServiceBenefitOverride(rawConfig.serviceType)
                : (rawConfig.happinessBoost || stats.happinessImpact || rawConfig.happinessImpact || 0),
            happinessImpact: rawConfig.happinessImpact || stats.happinessImpact || 0,
            pollutionImpact: rawConfig.pollutionImpact || Math.abs(stats.happinessImpact || 0),
            requiresRoad: rawConfig.requiresRoad ?? false,
            coverageRadius: rawConfig.coverageRadius || stats.coverageRadius || 0,
            serviceType: rawConfig.serviceType || null,
            utilityType: rawConfig.utilityType || null,
            variantKey: rawConfig.variantKey || null,
            requiresElectricity: rawConfig.requiresElectricity ?? false,
            requiresWater: rawConfig.requiresWater ?? false,
            appliesGlobally: rawConfig.appliesGlobally ?? false
        };
    }

    instantiateStructure(type, x, y, configData) {
        switch (type) {
            case "RESIDENTIAL":
                return { kind: "building", instance: new ResidentialBuilding(x, y, configData) };

            case "COMMERCIAL":
                return { kind: "building", instance: new CommercialBuilding(x, y, configData) };

            case "INDUSTRIAL":
                return { kind: "building", instance: new IndustrialBuilding(x, y, configData) };

            case "SERVICE":
                if (!configData.serviceType) {
                    return null;
                }
                return {
                    kind: "building",
                    instance: new ServiceBuilding(configData.serviceType, x, y, configData)
                };

            case "PARK":
                return {
                    kind: "building",
                    instance: new ServiceBuilding("park", x, y, configData)
                };

            case "UTILITY_PLANT":
                if (!configData.utilityType) {
                    return null;
                }
                return {
                    kind: "building",
                    instance: new UtilityPlant(configData.utilityType, x, y, configData)
                };

            case "ROAD":
                return {
                    kind: "road",
                    instance: new Road(x, y, configData)
                };

            default:
                return null;
        }
    }

    placeStructure(type, structure) {
        if (!structure) {
            return false;
        }

        if (type === "ROAD") {
            this.city.addRoad(structure);
            return true;
        }

        this.city.addBuilding(structure);
        return true;
    }

    build(type, x, y, subType = null) {
        const normalizedType = String(type || "").toUpperCase();
        const normalizedSubtype = subType ? String(subType).toUpperCase() : null;

        // Validate subtypes
        const subtypeOptions = this.getBuildingSubtypeOptions(normalizedType);
        if (subtypeOptions.length > 0 && !normalizedSubtype) {
            return { success: false, message: "Selecciona un subtipo valido" };
        }

        // Get configuration
        const configData = this.getNormalizedBuildingConfig(normalizedType, normalizedSubtype);
        if (!configData) {
            return { success: false, message: "Tipo invalido" };
        }

        // Create structure instance to get cost
        const structureDescriptor = this.instantiateStructure(normalizedType, x, y, configData);
        if (!structureDescriptor) {
            return { success: false, message: "Tipo no soportado" };
        }

        // Use DomainRulesService for comprehensive validation
        const validationResult = this.domainRules.validateConstruction(
            x, y, normalizedType, structureDescriptor.instance.cost
        );

        if (!validationResult.valid) {
            return { success: false, message: validationResult.message };
        }

        // All rules passed, proceed with construction
        this.city.resources.subtractMoney(structureDescriptor.instance.cost);
        this.placeStructure(normalizedType, structureDescriptor.instance);

        return {
            success: true,
            [structureDescriptor.kind]: structureDescriptor.instance
        };
    }

    placeFromTemplate(type, x, y, subType = null, level = 1) {
        const normalizedType = String(type || "").toUpperCase();
        const normalizedSubtype = subType ? String(subType).toUpperCase() : null;

        if (!this.city.map.isWithinBounds(x, y) || !this.city.map.isCellEmpty(x, y)) {
            return { success: false, message: "No se puede ubicar la estructura del mapa en esa celda." };
        }

        const configData = this.getNormalizedBuildingConfig(normalizedType, normalizedSubtype);

        if (!configData) {
            return { success: false, message: "Token de mapa no soportado." };
        }

        const descriptor = this.instantiateStructure(normalizedType, x, y, configData);

        if (!descriptor) {
            return { success: false, message: "No se pudo crear la estructura del mapa." };
        }

        this.placeStructure(normalizedType, descriptor.instance);

        for (let currentLevel = 1; currentLevel < Math.max(1, Number(level) || 1); currentLevel++) {
            descriptor.instance.upgrade?.();
        }

        return {
            success: true,
            [descriptor.kind]: descriptor.instance
        };
    }

    /**
     * =========================
     * ELIMINACION
     * =========================
     */

    removeBuilding(id) {
        return this.city.removeBuilding(id);
    }

    removeRoad(id) {
        return this.city.removeRoad(id);
    }

    demolishAt(x, y) {
        if (!this.city.map.isWithinBounds(x, y)) {
            return { success: false, message: "Posicion fuera del mapa" };
        }

        const entity = this.city.map.getEntity(x, y);

        if (!entity) {
            return { success: false, message: "No hay ninguna estructura en esa celda" };
        }

        if (String(entity.type).toLowerCase() === "road") {
            const removedRoad = this.removeRoad(entity.id);

            return removedRoad
                ? { success: true, removedType: "road", entity }
                : { success: false, message: "No se pudo demoler la carretera" };
        }

        if (Array.isArray(entity.residents)) {
            entity.residents.forEach(citizen => {
                citizen.removeHome?.();
            });
            entity.residents = [];
        }

        if (Array.isArray(entity.employees)) {
            entity.employees.forEach(citizen => {
                citizen.fire?.();
            });
            entity.employees = [];
        }

        const removedBuilding = this.removeBuilding(entity.id);

        return removedBuilding
            ? { success: true, removedType: entity.type, entity }
            : { success: false, message: "No se pudo demoler la estructura" };
    }

    /**
     * =========================
     * MEJORAS
     * =========================
     */

    upgradeBuilding(id) {
        const building = this.city.buildings.find(b => b.id === id);
        if (!building) return false;

        building.upgrade();
        return true;
    }

}
