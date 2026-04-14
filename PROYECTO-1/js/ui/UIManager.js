/**
 * ============================================
 * CITY BUILDER GAME - UI MANAGER
 * ============================================
 * Controlador principal de la interfaz.
 */

export class UIManager {

    constructor(game, services = {}) {

        this.game = game;

        this.weatherService = services.weatherService || null;
        this.newsService = services.newsService || null;
        this.isProcessingTurn = false;
        this.currentRoute = null;

        this.gridRenderer = null;
        this.panelController = null;
        this.eventBinder = null;
        this.formController = null;
    }

    /**
     * Inicializar UI
     */
    initialize(gridRenderer, panelController, eventBinder) {

        this.gridRenderer = gridRenderer || null;
        this.panelController = panelController || null;
        this.eventBinder = eventBinder || null;

        if (!this.gridRenderer) {
            console.error("GridRenderer no fue proporcionado a UIManager");
        }

        if (!this.panelController) {
            console.error("PanelController no fue proporcionado a UIManager");
        }

        if (this.eventBinder && typeof this.eventBinder.bindEvents === "function") {
            this.eventBinder.bindEvents();
            this.eventBinder.syncEditableResourceInputs?.();
            this.eventBinder.syncCitizenNeedsInputs?.();
            this.eventBinder.syncServiceBenefitsInputs?.();
            this.eventBinder.syncTurnDurationInput?.();
            this.eventBinder.syncAutoTurnButton?.();
        } else {
            console.warn("EventBinder no definido o no tiene bindEvents()");
        }

        // Set up auto-turn callback
        this.game.setTurnCompleteCallback((result) => {
            return this.handleAutoTurnComplete(result);
        });

        this.render();
    }

    /**
     * Render completo
     */
    render() {

        if (!this.gridRenderer || !this.panelController) return;

        const state = this.game.getState();
        const city = state.city;

        this.gridRenderer.render(city.map, {
            route: this.currentRoute
        });
        this.panelController.updateCityName(city.name);
        this.panelController.updateCityMeta(
            city.getGeographicRegion?.(),
            city.getMapSize?.()
        );
        this.panelController.updateResources(city.resources);
        this.panelController.updateTurn(state.turn);
        this.panelController.updateScore(state.score);
        this.panelController.updateWeather(this.weatherService?.getCurrentWeather?.());
        this.panelController.updateRouteSummary(this.currentRoute);
        this.eventBinder?.syncEditableResourceInputs?.();
        this.eventBinder?.syncAutoTurnButton?.();
    }

    /**
     * Maneja la completion de un turno automático
     */
    async handleAutoTurnComplete(result) {
        try {
            if (!this.weatherService || !this.newsService) {
                console.warn("Servicios externos no definidos para turno automático");
            }

            const city = this.game.getState().city;
            const geographicRegion = city.getGeographicRegion?.();
            const weatherLocation = geographicRegion?.name || city?.name;
            const weather = this.weatherService
                ? await this.weatherService.updateWeather(weatherLocation)
                : null;

            const news = this.newsService
                ? await this.newsService.generateNews(
                    this.game.getState().city,
                    weather,
                    result?.collapse
                )
                : null;

            // Update UI
            if (this.panelController) {
                this.panelController.updateWeather(weather);
                this.panelController.showNews(news || "Sin novedades externas.");
            }

            this.render();

            const collapseMessage = this.getCollapseMessage(result?.collapse);
            if (collapseMessage) {
                this.panelController?.showMessage?.(collapseMessage);
            }
        } catch (error) {
            console.error('Error en handleAutoTurnComplete:', error);
            // Asegurar que la UI se actualice incluso si hay error
            this.render();
        }
    }

    getCollapseMessage(collapse) {
        if (collapse === "electricity") {
            return "La partida ha terminado: la electricidad cayo por debajo de cero.";
        }

        if (collapse === "water") {
            return "La partida ha terminado: el agua cayo por debajo de cero.";
        }

        return null;
    }

    /**
     * Ejecutar turno desde UI
     */
    async nextTurn() {

        if (this.isProcessingTurn) {
            return;
        }

        this.isProcessingTurn = true;

        try {
            if (!this.weatherService || !this.newsService) {
                console.warn("Servicios externos no definidos");
            }

            const city = this.game.getState().city;
            const geographicRegion = city.getGeographicRegion?.();
            const weatherLocation = geographicRegion?.name || city?.name;
            const weather = this.weatherService
                ? await this.weatherService.updateWeather(weatherLocation)
                : null;

            const result = this.game.nextTurn({ weather });

            const news = this.newsService
                ? await this.newsService.generateNews(
                    this.game.getState().city,
                    weather,
                    result?.collapse
                )
                : null;

            if (this.panelController) {
                this.panelController.updateWeather(weather);
                this.panelController.showNews(news || "Sin novedades externas.");
            }

            this.render();

            const collapseMessage = this.getCollapseMessage(result?.collapse);

            if (collapseMessage) {
                this.panelController?.showMessage?.(collapseMessage);
            }
        } finally {
            this.isProcessingTurn = false;
        }
    }

    /**
     * Guardar partida
     */
    saveGame() {
        this.game.save();
    }

    showRoute(route) {
        this.currentRoute = route;
        this.panelController?.updateRouteSummary(route);
        this.render();
    }

    clearRoute() {
        this.currentRoute = null;
        this.panelController?.updateRouteSummary(null);
        this.render();
    }

    /**
     * Cargar partida
     */
    loadGame() {
        const loaded = this.game.load();

        if (loaded) {
            this.currentRoute = null;
            this.render();
            this.eventBinder?.syncEditableResourceInputs?.();
            this.eventBinder?.syncCitizenNeedsInputs?.();
            this.eventBinder?.syncServiceBenefitsInputs?.();
            this.formController?.syncFromGame?.();
        }

        return loaded;
    }
}
