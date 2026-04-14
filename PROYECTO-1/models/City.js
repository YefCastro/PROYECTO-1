/**
 * ============================================
 * CITY BUILDER GAME - CITY MODEL
 * ============================================
 * Entidad central que contiene todo el estado urbano.
 */

import { Map } from "./Map.js";
import { Resources } from "./Resources.js";

export class City {

    constructor(name = "Nueva Ciudad", options = {}) {
        this.name = name;

        const width = options.width || 15;
        const height = options.height || width;

        this.map = new Map(width, height);
        this.resources = new Resources(options.initialResources);
        this.citizenNeeds = this.normalizeCitizenNeeds(options.citizenNeeds);
        this.geographicRegion = this.normalizeGeographicRegion(options.geographicRegion);
        this.currentTurn = Number(options.currentTurn ?? 1);
        this.accumulatedScore = Number(options.accumulatedScore ?? 0);

        this.buildings = [];
        this.roads = [];
        this.citizens = [];
    }

    normalizeCitizenNeeds(needs = {}) {
        return {
            water: Math.max(0, Number(needs?.water ?? 1)),
            electricity: Math.max(0, Number(needs?.electricity ?? 1)),
            food: Math.max(0, Number(needs?.food ?? 1))
        };
    }

    normalizeGeographicRegion(region = {}) {
        const latitude = Number(region?.coordinates?.latitude ?? region?.latitude ?? 0);
        const longitude = Number(region?.coordinates?.longitude ?? region?.longitude ?? 0);

        return {
            id: region?.id || null,
            name: String(region?.name || "Bogota"),
            department: String(region?.department || region?.region || "Cundinamarca"),
            country: String(region?.country || "Colombia"),
            coordinates: {
                latitude: Number.isFinite(latitude) ? latitude : 0,
                longitude: Number.isFinite(longitude) ? longitude : 0
            },
            source: region?.source || "local"
        };
    }

    setName(name) {
        const normalizedName = String(name || "").trim();
        this.name = normalizedName || "Mi Ciudad";
        return this.name;
    }

    getName() {
        return this.name;
    }

    setGeographicRegion(region) {
        this.geographicRegion = this.normalizeGeographicRegion(region);
        return this.getGeographicRegion();
    }

    getGeographicRegion() {
        return {
            ...this.geographicRegion,
            coordinates: { ...this.geographicRegion.coordinates }
        };
    }

    setProgress({ turn = this.currentTurn, score = this.accumulatedScore } = {}) {
        this.currentTurn = Number(turn);
        this.accumulatedScore = Number(score);
    }

    getProgress() {
        return {
            turn: this.currentTurn,
            score: this.accumulatedScore
        };
    }

    getMapSize() {
        return {
            width: this.map.width,
            height: this.map.height
        };
    }

    getMapLabel() {
        const { width, height } = this.getMapSize();
        return `${width}x${height}`;
    }

    getCitizenNeeds() {
        return { ...this.citizenNeeds };
    }

    setCitizenNeeds(needs = {}) {
        this.citizenNeeds = this.normalizeCitizenNeeds(needs);

        this.citizens.forEach(citizen => {
            if (typeof citizen.setBasicConsumption === "function") {
                citizen.setBasicConsumption(this.citizenNeeds);
            }
        });

        return this.getCitizenNeeds();
    }

    /**
     * =========================
     * BUILDINGS
     * =========================
     */

    addBuilding(building) {
        this.buildings.push(building);
        this.map.placeEntity(building, building.x, building.y);
    }

    removeBuilding(buildingId) {
        const building = this.buildings.find(b => b.id === buildingId);
        if (!building) return false;

        this.map.removeEntity(building.x, building.y);
        this.buildings = this.buildings.filter(b => b.id !== buildingId);
        return true;
    }

    getBuildingsByType(type) {
        return this.buildings.filter(b => b.type === type);
    }

    getAllBuildings() {
        return this.buildings;
    }

    /**
     * =========================
     * ROADS
     * =========================
     */

    addRoad(road) {
        this.roads.push(road);
        this.map.placeEntity(road, road.x, road.y);
    }

    removeRoad(roadId) {
        const road = this.roads.find(r => r.id === roadId);
        if (!road) return false;

        this.map.removeEntity(road.x, road.y);
        this.roads = this.roads.filter(r => r.id !== roadId);
        return true;
    }

    getAllRoads() {
        return this.roads;
    }

    /**
     * =========================
     * CITIZENS
     * =========================
     */

    addCitizen(citizen) {
        if (typeof citizen.setBasicConsumption === "function") {
            citizen.setBasicConsumption(this.citizenNeeds);
        }

        this.citizens.push(citizen);
    }

    removeCitizen(citizenId) {
        this.citizens = this.citizens.filter(c => c.id !== citizenId);
    }

    getPopulation() {
        return this.citizens.length;
    }

    getAverageHappiness() {
        if (this.citizens.length === 0) return 0;

        const total = this.citizens.reduce((sum, c) => sum + c.happiness, 0);
        return Math.floor(total / this.citizens.length);
    }

    getUnemployedCitizens() {
        return this.citizens.filter(c => !c.isEmployed);
    }

    /**
     * Obtiene el edificio en una posición específica
     */
    getBuildingAt(x, y) {
        return this.buildings.find(building => building.x === x && building.y === y) || null;
    }

    /**
     * =========================
     * SERIALIZACION
     * =========================
     */

    toJSON() {
        return {
            name: this.name,
            geographicRegion: this.geographicRegion,
            currentTurn: this.currentTurn,
            accumulatedScore: this.accumulatedScore,
            map: this.map.toJSON(),
            resources: this.resources.toJSON(),
            citizenNeeds: this.citizenNeeds,
            buildings: this.buildings.map(b => b.toJSON()),
            roads: this.roads.map(r => r.toJSON()),
            citizens: this.citizens.map(c => c.toJSON())
        };
    }

}
