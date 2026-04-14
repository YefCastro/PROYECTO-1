/**
 * ============================================
 * CITY BUILDER GAME - GAME CORE
 * ============================================
 * Clase principal que inicializa el juego.
 */

import { GameState } from "./GameState.js";
import { TurnSystem } from "./TurnSystem.js";
import { City } from "../../models/City.js";

import { ResourceManager } from "../managers/ResourceManager.js";
import { BuildingManager } from "../managers/BuildingManager.js";
import { CitizenManager } from "../managers/CitizenManager.js";
import { ScoreManager } from "../managers/ScoreManager.js";
import { PersistenceManager } from "../managers/PersistenceManager.js";
import { RoutingService } from "../services/RoutingService.js";
import { MapTemplateService } from "../services/MapTemplateService.js";
import { AutoSaveService } from "../services/AutoSaveService.js";

export class Game {

    constructor(config) {

        this.config = config;
        this.mapTemplateService = new MapTemplateService();

        this.gameState = new GameState();

        const city = this.createCity({
            name: config?.city?.name || "Mi Ciudad",
            mapWidth: config?.map?.width ?? config?.map?.size,
            mapHeight: config?.map?.height ?? config?.map?.size,
            geographicRegion: config?.city?.geographicRegion || config?.city?.region
        });

        this.gameState.initialize(city, config);

        this.resourceManager = new ResourceManager(city);
        this.buildingManager = new BuildingManager(city, config);
        this.citizenManager = new CitizenManager(city, config);
        this.scoreManager = new ScoreManager(city, this.gameState);
        this.persistenceManager = new PersistenceManager(this.gameState);
        this.routingService = new RoutingService(city);
        
        // Create AutoSaveService after BuildingManager is initialized
        this.autoSaveService = new AutoSaveService(city, config);

        // Set up DomainRulesService references after all managers are created
        if (this.buildingManager && this.buildingManager.domainRules) {
            this.autoSaveService.setDomainRules(this.buildingManager.domainRules);
            this.citizenManager.domainRules = this.buildingManager.domainRules;
        } else {
            console.error('DomainRulesService not properly initialized in BuildingManager');
        }

        this.turnSystem = new TurnSystem(this.gameState, {
            resourceManager: this.resourceManager,
            citizenManager: this.citizenManager,
            scoreManager: this.scoreManager,
            persistenceManager: this.persistenceManager
        });

        if (Array.isArray(config?.map?.layout) && config.map.layout.length > 0) {
            this.loadMapLayout(config.map.layout);
        }
    }

    clampMapDimension(size) {
        const minSize = Number(this.config?.map?.minSize ?? 15);
        const maxSize = Number(this.config?.map?.maxSize ?? 30);
        const parsedSize = Number(size ?? this.config?.map?.size ?? minSize);

        if (!Number.isFinite(parsedSize)) {
            return minSize;
        }

        return Math.max(minSize, Math.min(maxSize, Math.floor(parsedSize)));
    }

    createCity(options = {}) {
        const mapWidth = this.clampMapDimension(options.mapWidth ?? options.mapSize);
        const mapHeight = this.clampMapDimension(options.mapHeight ?? options.mapSize ?? mapWidth);
        const initialResources = this.config?.resources?.initial || {};
        const citizenNeeds = options.citizenNeeds || this.config?.population?.needs || {};

        return new City(options.name || "Mi Ciudad", {
            width: mapWidth,
            height: mapHeight,
            initialResources,
            citizenNeeds,
            geographicRegion: options.geographicRegion || this.config?.city?.geographicRegion || {},
            currentTurn: this.config?.game?.initialTurn ?? 1,
            accumulatedScore: 0
        });
    }

    syncCityReferences(city) {
        this.resourceManager.city = city;
        this.buildingManager.city = city;
        this.citizenManager.city = city;
        this.scoreManager.city = city;
        this.routingService.city = city;
    }

    resetManagersForCity(city) {
        this.syncCityReferences(city);
        this.gameState.city = city;
        this.gameState.syncCityProgress();
    }

    /**
     * Avanza turno
     */
    nextTurn(context = {}) {
        return this.turnSystem.nextTurn(context);
    }

    /**
     * Guardar partida
     */
    save() {
        this.persistenceManager.saveGame();
    }

    /**
     * Cargar partida
     */
    load() {
        const wasLoaded = this.persistenceManager.loadGame(this.config);

        if (wasLoaded) {
            this.syncCityReferences(this.gameState.city);
        }

        return wasLoaded;
    }

    /**
     * Obtener estado actual
     */
    getState() {
        return this.gameState;
    }

    getCitizenNeeds() {
        return this.gameState.city.getCitizenNeeds();
    }

    updateCitizenNeeds(needs) {
        return this.gameState.city.setCitizenNeeds(needs);
    }

    getCriticalResourceCollapse() {
        const resources = this.gameState.city.resources;

        if (resources.isElectricityNegative()) {
            return "electricity";
        }

        if (resources.isWaterNegative()) {
            return "water";
        }

        return null;
    }

    getEditableResourceValues() {
        const { electricity, water, food } = this.gameState.city.resources.getValues();

        return {
            electricity,
            water,
            food
        };
    }

    updateEditableResourceValues(values = {}) {
        const resources = this.gameState.city.resources.setValues({
            electricity: values.electricity,
            water: values.water,
            food: values.food
        });

        const collapse = this.getCriticalResourceCollapse();

        if (collapse) {
            this.gameState.isPaused = true;
        }

        return {
            resources,
            collapse
        };
    }

    setCityName(name) {
        return this.gameState.city.setName(name);
    }

    getCityName() {
        return this.gameState.city.getName();
    }

    setGeographicRegion(region) {
        return this.gameState.city.setGeographicRegion(region);
    }

    getGeographicRegion() {
        return this.gameState.city.getGeographicRegion();
    }

    getMapSize() {
        return this.gameState.city.getMapSize();
    }

    getServiceBenefits() {
        return {
            police: Number(this.config?.serviceBenefits?.police ?? 10),
            fire: Number(this.config?.serviceBenefits?.fire ?? 10),
            hospital: Number(this.config?.serviceBenefits?.hospital ?? 10),
            park: Number(this.config?.serviceBenefits?.park ?? 5)
        };
    }

    updateServiceBenefits(benefits = {}) {
        const currentBenefits = this.getServiceBenefits();
        this.config.serviceBenefits = {
            ...currentBenefits,
            ...Object.fromEntries(
                Object.entries(benefits).map(([key, value]) => [
                    key,
                    Math.max(0, Number(value ?? currentBenefits[key] ?? 0))
                ])
            )
        };

        this.gameState.city.buildings.forEach(building => {
            if (building.type !== "service") {
                return;
            }

            const overrideValue = this.config.serviceBenefits?.[building.serviceType];

            if (Number.isFinite(overrideValue)) {
                building.happinessBoost = overrideValue;
            }
        });

        return this.getServiceBenefits();
    }

    reconfigureCity(options = {}) {
        const currentCity = this.gameState.city;
        const nextWidth = this.clampMapDimension(options.mapWidth ?? options.mapSize);
        const nextHeight = this.clampMapDimension(options.mapHeight ?? options.mapSize ?? nextWidth);
        const currentMapSize = currentCity.getMapSize();
        const nextName = options.name || currentCity.getName();
        const nextRegion = options.geographicRegion || currentCity.getGeographicRegion();

        if (nextWidth === currentMapSize.width && nextHeight === currentMapSize.height) {
            currentCity.setName(nextName);
            currentCity.setGeographicRegion(nextRegion);
            this.gameState.syncCityProgress();

            return {
                success: true,
                reset: false,
                city: currentCity
            };
        }

        const nextCity = this.createCity({
            name: nextName,
            mapWidth: nextWidth,
            mapHeight: nextHeight,
            geographicRegion: nextRegion,
            citizenNeeds: currentCity.getCitizenNeeds()
        });

        this.gameState.initialize(nextCity, this.config);
        this.resetManagersForCity(nextCity);

        return {
            success: true,
            reset: true,
            city: nextCity
        };
    }

    loadMapLayout(layout) {
        const currentCity = this.gameState.city;
        const validation = currentCity.map.validateTextLayout(layout);

        if (!validation.valid) {
            return {
                success: false,
                message: validation.message
            };
        }

        const nextRegion = currentCity.getGeographicRegion();
        const nextCity = this.createCity({
            name: currentCity.getName(),
            mapWidth: validation.width,
            mapHeight: validation.height,
            geographicRegion: nextRegion,
            citizenNeeds: currentCity.getCitizenNeeds()
        });

        this.gameState.initialize(nextCity, this.config);
        this.resetManagersForCity(nextCity);

        const applied = this.mapTemplateService.applyLayout(nextCity, this.buildingManager, layout);

        if (!applied.success) {
            return applied;
        }

        return {
            success: true,
            reset: true,
            placed: applied.placed,
            width: validation.width,
            height: validation.height
        };
    }

    demolishAt(x, y) {
        return this.buildingManager.demolishAt(x, y);
    }

    planRoute(start, end) {
        return this.routingService.findRoute(start, end);
    }

    /**
     * Obtiene el gestor de ciudadanos
     */
    getCitizenManager() {
        return this.citizenManager;
    }

    /**
     * Configura la duración del turno en segundos
     */
    setTurnDuration(seconds) {
        return this.turnSystem.setTurnDuration(seconds);
    }

    /**
     * Obtiene la duración del turno en segundos
     */
    getTurnDuration() {
        return this.turnSystem.getTurnDuration();
    }

    /**
     * Inicia los turnos automáticos
     */
    startAutoTurn() {
        return this.turnSystem.startAutoTurn();
    }

    /**
     * Detiene los turnos automáticos
     */
    stopAutoTurn() {
        return this.turnSystem.stopAutoTurn();
    }

    /**
     * Verifica si los turnos automáticos están activos
     */
    isAutoTurnEnabled() {
        return this.turnSystem.isAutoTurnEnabled();
    }

    /**
     * Establece el callback para cuando se completa un turno
     */
    setTurnCompleteCallback(callback) {
        return this.turnSystem.setTurnCompleteCallback(callback);
    }

    /**
     * Exportar ciudad a archivo JSON
     */
    exportCity() {
        return this.autoSaveService.exportToJSON();
    }

    /**
     * Importar ciudad desde archivo JSON
     */
    importCity(jsonData) {
        const result = this.autoSaveService.importFromJSON(jsonData);
        
        if (result.success) {
            // Reload the game with imported data
            this.loadGameState(result.data);
        }
        
        return result;
    }

    /**
     * Forzar guardado manual
     */
    forceSave() {
        return this.autoSaveService.forceSave();
    }

    /**
     * Obtener estado del guardado automático
     */
    getAutoSaveStatus() {
        return this.autoSaveService.getAutoSaveStatus();
    }

    /**
     * Activar/desactivar guardado automático
     */
    setAutoSaveEnabled(enabled) {
        this.autoSaveService.setAutoSaveEnabled(enabled);
    }

    /**
     * Realizar asignación automática de ciudadanos
     */
    performAutomaticAssignment() {
        return this.citizenManager.performAutomaticAssignment();
    }

    /**
     * Verificar reglas de capacidad residencial
     */
    checkResidentialCapacity() {
        return this.buildingManager.domainRules.checkResidentialCapacity();
    }

    /**
     * Verificar requisitos de crecimiento
     */
    checkGrowthRequirements() {
        return this.buildingManager.domainRules.checkGrowthRequirements();
    }

}
