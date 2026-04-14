/**
 * ============================================
 * CITY BUILDER GAME - APP ENTRY POINT
 * ============================================
 * Inicializa todo el sistema.
 */

import { APIService } from "./services/APIService.js";
import { WeatherService } from "./services/WeatherService.js";
import { NewsService } from "./services/NewService.js";
import { RegionService } from "./services/RegionService.js";

import { Game } from "./core/Game.js";

import { UIManager } from "./ui/UIManager.js";
import { MapRenderer } from "./ui/MapRenderer.js";
import { PanelController } from "./ui/PanelController.js";
import { ModalController } from "./ui/ModalController.js";
import { EventHandler } from "./ui/EventHandler.js";
import { FormController } from "./ui/FormController.js";

document.addEventListener("DOMContentLoaded", async () => {

    // =========================
    // CARGAR CONFIG
    // =========================
    const [gameConfig, buildingTypes, cityCatalog] = await Promise.all([
        APIService.fetchJSON("data/data/game-config.json"),
        APIService.fetchJSON("data/data/building-types.json"),
        APIService.fetchJSON("data/data/cities-coordinates.json")
    ]);

    if (!gameConfig || !buildingTypes) {
        console.error("No se pudo cargar la configuracion inicial del juego.");
        return;
    }

    const availableCities = cityCatalog?.cities || [];

    const config = {
        ...gameConfig,
        buildingTypes,
        availableCities
    };

    // =========================
    // CORE GAME
    // =========================
    const game = new Game(config);

    // =========================
    // SERVICES
    // =========================
    const weatherService = new WeatherService(config.weather || {});
    const newsService = new NewsService(config.news || {});
    const regionService = new RegionService(availableCities);

    // =========================
    // UI COMPONENTS
    // =========================
    const mapRenderer = new MapRenderer("game-grid");
    const panelController = new PanelController();
    const modalController = new ModalController();

    const uiManager = new UIManager(game, {
        weatherService,
        newsService
    });

    game.uiManager = uiManager;

    // =========================
    // EVENTOS
    // =========================
    const eventBinder = new EventHandler(uiManager, modalController);

    const formController = new FormController(
        game,
        game.buildingManager,
        modalController,
        regionService
    );
    uiManager.formController = formController;

    // =========================
    // INICIALIZAR UI
    // =========================
    uiManager.initialize(
        mapRenderer,
        panelController,
        eventBinder
    );

    // =========================
    // RENDERIZAR INICIAL
    // =========================
    uiManager.render();

});
