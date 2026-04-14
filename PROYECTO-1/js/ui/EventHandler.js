/**
 * ============================================
 * CITY BUILDER GAME - EVENT HANDLER
 * ============================================
 * Maneja todos los eventos globales de la UI.
 */

export class EventHandler {

    constructor(uiManager, modalController) {

        this.uiManager = uiManager;
        this.modalController = modalController;

        this.nextTurnBtn = document.getElementById("next-turn-btn");
        this.autoTurnBtn = document.getElementById("auto-turn-btn");
        this.turnDurationInput = document.getElementById("turn-duration-input");
        this.scoreDetailsBtn = document.getElementById("score-details-btn");
        this.routingModeBtn = document.getElementById("routing-mode-btn");
        this.saveBtn = document.getElementById("save-btn");
        this.loadBtn = document.getElementById("load-btn");
        this.forceSaveBtn = document.getElementById("force-save-btn");
        this.exportBtn = document.getElementById("export-btn");
        this.importBtn = document.getElementById("import-btn");
        this.importFileInput = document.getElementById("import-file");
        this.autoSaveStatus = document.getElementById("auto-save-status");
        this.nextSaveTime = document.getElementById("next-save-time");
        this.gridContainer = document.getElementById("game-grid");

        // Routing system state
        this.routingMode = false;
        this.selectedBuilding = null;
        this.routingStart = null;
        this.routingEnd = null;

        this.citizenWaterNeedInput = document.getElementById("citizen-water-need");
        this.citizenElectricityNeedInput = document.getElementById("citizen-electricity-need");
        this.citizenFoodNeedInput = document.getElementById("citizen-food-need");
        this.citizenGrowthRateInput = document.getElementById("citizen-growth-rate");

        this.resourceElectricityInput = document.getElementById("resource-electricity-input");
        this.resourceWaterInput = document.getElementById("resource-water-input");
        this.resourceFoodInput = document.getElementById("resource-food-input");

        this.servicePoliceBenefitInput = document.getElementById("service-police-benefit");
        this.serviceFireBenefitInput = document.getElementById("service-fire-benefit");
        this.serviceHospitalBenefitInput = document.getElementById("service-hospital-benefit");
        this.serviceParkBenefitInput = document.getElementById("service-park-benefit");

        // API configuration elements
        this.openWeatherApiKeyInput = document.getElementById("openweather-api-key");
        this.newsApiKeyInput = document.getElementById("newsapi-api-key");
        this.saveWeatherApiBtn = document.getElementById("save-weather-api-btn");
        this.saveNewsApiBtn = document.getElementById("save-news-api-btn");
        this.weatherStatusText = document.getElementById("weather-status-text");
        this.newsStatusText = document.getElementById("news-status-text");
    }

    getCitizenNeedsFromInputs() {
        const currentNeeds = this.uiManager.game.getCitizenNeeds();

        return {
            water: Number(this.citizenWaterNeedInput?.value ?? currentNeeds.water),
            electricity: Number(this.citizenElectricityNeedInput?.value ?? currentNeeds.electricity),
            food: Number(this.citizenFoodNeedInput?.value ?? currentNeeds.food),
            growthRate: Number(this.citizenGrowthRateInput?.value ?? 2)
        };
    }

    getServiceBenefitsFromInputs() {
        const currentBenefits = this.uiManager.game.getServiceBenefits();

        return {
            police: Number(this.servicePoliceBenefitInput?.value ?? currentBenefits.police),
            fire: Number(this.serviceFireBenefitInput?.value ?? currentBenefits.fire),
            hospital: Number(this.serviceHospitalBenefitInput?.value ?? currentBenefits.hospital),
            park: Number(this.serviceParkBenefitInput?.value ?? currentBenefits.park)
        };
    }

    getEditableResourcesFromInputs() {
        const currentResources = this.uiManager.game.getEditableResourceValues();

        return {
            electricity: Number(this.resourceElectricityInput?.value ?? currentResources.electricity),
            water: Number(this.resourceWaterInput?.value ?? currentResources.water),
            food: Number(this.resourceFoodInput?.value ?? currentResources.food)
        };
    }

    syncCitizenNeedsInputs() {
        const needs = this.uiManager.game.getCitizenNeeds();

        if (this.citizenWaterNeedInput) {
            this.citizenWaterNeedInput.value = needs.water;
        }

        if (this.citizenElectricityNeedInput) {
            this.citizenElectricityNeedInput.value = needs.electricity;
        }

        if (this.citizenFoodNeedInput) {
            this.citizenFoodNeedInput.value = needs.food;
        }

        if (this.citizenGrowthRateInput) {
            this.citizenGrowthRateInput.value = this.uiManager.game.getCitizenManager().getCurrentGrowthRate();
        }
    }

    syncEditableResourceInputs() {
        const resources = this.uiManager.game.getEditableResourceValues();

        if (this.resourceElectricityInput) {
            this.resourceElectricityInput.value = resources.electricity;
        }

        if (this.resourceWaterInput) {
            this.resourceWaterInput.value = resources.water;
        }

        if (this.resourceFoodInput) {
            this.resourceFoodInput.value = resources.food;
        }
    }

    syncServiceBenefitsInputs() {
        const benefits = this.uiManager.game.getServiceBenefits();

        if (this.servicePoliceBenefitInput) {
            this.servicePoliceBenefitInput.value = benefits.police;
        }

        if (this.serviceFireBenefitInput) {
            this.serviceFireBenefitInput.value = benefits.fire;
        }

        if (this.serviceHospitalBenefitInput) {
            this.serviceHospitalBenefitInput.value = benefits.hospital;
        }

        if (this.serviceParkBenefitInput) {
            this.serviceParkBenefitInput.value = benefits.park;
        }
    }

    bindCitizenNeedsEvents() {
        const inputs = [
            this.citizenWaterNeedInput,
            this.citizenElectricityNeedInput,
            this.citizenFoodNeedInput,
            this.citizenGrowthRateInput
        ].filter(Boolean);

        inputs.forEach(input => {
            input.addEventListener("change", () => {
                const citizenNeeds = this.getCitizenNeedsFromInputs();
                
                // Update citizen needs
                this.uiManager.game.updateCitizenNeeds(citizenNeeds);
                
                // Update growth rate separately
                if (input === this.citizenGrowthRateInput) {
                    this.uiManager.game.getCitizenManager().setGrowthRate(citizenNeeds.growthRate);
                }
                
                this.syncCitizenNeedsInputs();
                this.uiManager.render();
                input.blur();
            });
        });
    }

    bindEditableResourceEvents() {
        const inputs = [
            this.resourceElectricityInput,
            this.resourceWaterInput,
            this.resourceFoodInput
        ].filter(Boolean);

        inputs.forEach(input => {
            input.addEventListener("change", () => {
                const result = this.uiManager.game.updateEditableResourceValues(this.getEditableResourcesFromInputs());
                this.syncEditableResourceInputs();
                this.uiManager.render();

                if (result?.collapse === "electricity") {
                    this.modalController.show("Juego terminado", "La electricidad cayo por debajo de cero.");
                }

                if (result?.collapse === "water") {
                    this.modalController.show("Juego terminado", "El agua cayo por debajo de cero.");
                }

                input.blur();
            });
        });
    }

    bindServiceBenefitsEvents() {
        const inputs = [
            this.servicePoliceBenefitInput,
            this.serviceFireBenefitInput,
            this.serviceHospitalBenefitInput,
            this.serviceParkBenefitInput
        ].filter(Boolean);

        inputs.forEach(input => {
            input.addEventListener("change", () => {
                this.uiManager.game.updateServiceBenefits(this.getServiceBenefitsFromInputs());
                this.syncServiceBenefitsInputs();
                this.uiManager.render();
                input.blur();
            });
        });
    }

    bindAutoTurnEvents() {
        // Turn duration input
        if (this.turnDurationInput) {
            this.turnDurationInput.addEventListener("change", () => {
                const seconds = Number(this.turnDurationInput.value);
                this.uiManager.game.setTurnDuration(seconds);
                this.syncTurnDurationInput();
            });
        }

        // Auto-turn button
        if (this.autoTurnBtn) {
            this.autoTurnBtn.addEventListener("click", () => {
                this.toggleAutoTurn();
            });
        }
    }

    syncTurnDurationInput() {
        if (this.turnDurationInput) {
            this.turnDurationInput.value = this.uiManager.game.getTurnDuration();
        }
    }

    syncAutoTurnButton() {
        if (this.autoTurnBtn) {
            const isEnabled = this.uiManager.game.isAutoTurnEnabled();
            this.autoTurnBtn.textContent = isEnabled ? "Detener Turnos Automáticos" : "Iniciar Turnos Automáticos";
            this.autoTurnBtn.classList.toggle("active", isEnabled);
        }
    }

    toggleAutoTurn() {
        const isEnabled = this.uiManager.game.isAutoTurnEnabled();
        
        if (isEnabled) {
            this.uiManager.game.stopAutoTurn();
        } else {
            this.uiManager.game.startAutoTurn();
        }
        
        this.syncAutoTurnButton();
    }

    showScoreDetails() {
        const breakdown = this.uiManager.game.scoreManager.getScoreBreakdown();
        
        let content = `
            <div class="score-breakdown">
                <h3>Puntuación Base</h3>
                <div class="score-section">
                    <div>Población (${breakdown.base.population / 10} × 10): <span class="positive">+${breakdown.base.population}</span></div>
                    <div>Felicidad (${(breakdown.base.happiness / 5).toFixed(1)} × 5): <span class="positive">+${breakdown.base.happiness}</span></div>
                    <div>Dinero (÷ 100): <span class="positive">+${breakdown.base.money}</span></div>
                    <div>Edificios (${breakdown.base.buildings / 50} × 50): <span class="positive">+${breakdown.base.buildings}</span></div>
                    <div>Balance Electricidad (× 2): <span class="${breakdown.base.electricity >= 0 ? 'positive' : 'negative'}">${breakdown.base.electricity >= 0 ? '+' : ''}${breakdown.base.electricity}</span></div>
                    <div>Balance Agua (× 2): <span class="${breakdown.base.water >= 0 ? 'positive' : 'negative'}">${breakdown.base.water >= 0 ? '+' : ''}${breakdown.base.water}</span></div>
                    <div class="total">Subtotal Base: <strong>${breakdown.base.total}</strong></div>
                </div>
                
                <h3>Bonificaciones</h3>
                <div class="score-section">
                    <div class="${breakdown.bonuses.allEmployed > 0 ? 'positive' : 'disabled'}">Todos empleados: ${breakdown.bonuses.allEmployed > 0 ? '+' + breakdown.bonuses.allEmployed : 'No aplicable'}</div>
                    <div class="${breakdown.bonuses.highHappiness > 0 ? 'positive' : 'disabled'}">Felicidad > 80: ${breakdown.bonuses.highHappiness > 0 ? '+' + breakdown.bonuses.highHappiness : 'No aplicable'}</div>
                    <div class="${breakdown.bonuses.allResourcesPositive > 0 ? 'positive' : 'disabled'}">Recursos positivos: ${breakdown.bonuses.allResourcesPositive > 0 ? '+' + breakdown.bonuses.allResourcesPositive : 'No aplicable'}</div>
                    <div class="${breakdown.bonuses.largeCity > 0 ? 'positive' : 'disabled'}">Ciudad > 1000: ${breakdown.bonuses.largeCity > 0 ? '+' + breakdown.bonuses.largeCity : 'No aplicable'}</div>
                    <div class="total">Total Bonificaciones: <strong>+${breakdown.bonuses.total}</strong></div>
                </div>
                
                <h3>Penalizaciones</h3>
                <div class="score-section">
                    <div class="${breakdown.penalties.negativeMoney > 0 ? 'negative' : 'disabled'}">Dinero negativo: ${breakdown.penalties.negativeMoney > 0 ? '-' + breakdown.penalties.negativeMoney : 'No aplicable'}</div>
                    <div class="${breakdown.penalties.negativeElectricity > 0 ? 'negative' : 'disabled'}">Electricidad negativa: ${breakdown.penalties.negativeElectricity > 0 ? '-' + breakdown.penalties.negativeElectricity : 'No aplicable'}</div>
                    <div class="${breakdown.penalties.negativeWater > 0 ? 'negative' : 'disabled'}">Agua negativa: ${breakdown.penalties.negativeWater > 0 ? '-' + breakdown.penalties.negativeWater : 'No aplicable'}</div>
                    <div class="${breakdown.penalties.lowHappiness > 0 ? 'negative' : 'disabled'}">Felicidad < 40: ${breakdown.penalties.lowHappiness > 0 ? '-' + breakdown.penalties.lowHappiness : 'No aplicable'}</div>
                    <div class="${breakdown.penalties.unemployment > 0 ? 'negative' : 'disabled'}">Desempleo (${breakdown.penalties.unemployment / 10} ciudadanos × 10): ${breakdown.penalties.unemployment > 0 ? '-' + breakdown.penalties.unemployment : 'No aplicable'}</div>
                    <div class="total">Total Penalizaciones: <strong>-${breakdown.penalties.total}</strong></div>
                </div>
                
                <div class="final-score">
                    <h3>Puntuación Final</h3>
                    <div class="score-total">${breakdown.base.total} + ${breakdown.bonuses.total} - ${breakdown.penalties.total} = <strong>${breakdown.total}</strong></div>
                </div>
            </div>
        `;
        
        this.modalController.show("Detalles de Puntuación", content);
    }

    /**
     * Maneja la selección de edificios para rutas
     */
    handleBuildingSelection(x, y) {
        const city = this.uiManager.game.getState().city;
        const building = city.getBuildingAt(x, y);

        if (!building) {
            this.modalController.show("Selección Inválida", "No hay ningún edificio en esta posición.");
            return;
        }

        if (!this.routingStart) {
            // Primer edificio seleccionado (origen)
            this.routingStart = { x, y, building };
            this.highlightBuilding(x, y, 'start');
            this.modalController.show(
                "Origen Seleccionado",
                `Edificio seleccionado como origen: ${building.type} en (${x}, ${y}).<br>Ahora selecciona el edificio de destino.`
            );
        } else if (!this.routingEnd) {
            // Segundo edificio seleccionado (destino)
            this.routingEnd = { x, y, building };
            this.highlightBuilding(x, y, 'end');
            this.calculateAndShowRoute();
        } else {
            // Reiniciar selección
            this.resetRoutingSelection();
            this.handleBuildingSelection(x, y);
        }
    }

    /**
     * Resalta un edificio en el mapa
     */
    highlightBuilding(x, y, type) {
        const tile = document.querySelector(`.tile[data-x="${x}"][data-y="${y}"]`);
        if (tile) {
            tile.classList.remove('route-start', 'route-end');
            tile.classList.add(`route-${type}`);
        }
    }

    /**
     * Calcula y muestra la ruta
     */
    async calculateAndShowRoute() {
        if (!this.routingStart || !this.routingEnd) {
            return;
        }

        try {
            // Usar el servicio de rutas con backend API
            const routeResult = await this.uiManager.game.routingService.calculateRouteViaBackend(
                this.routingStart,
                this.routingEnd
            );

            if (routeResult.success) {
                this.animateRoute(routeResult.path);
                this.uiManager.showRoute(routeResult);
                this.modalController.show(
                    "Ruta Calculada",
                    `Ruta encontrada: ${routeResult.distance} celdas de distancia.<br>Origen: ${this.routingStart.building.type} (${this.routingStart.x}, ${this.routingStart.y})<br>Destino: ${this.routingEnd.building.type} (${this.routingEnd.x}, ${this.routingEnd.y})`
                );
            } else {
                this.modalController.show(
                    "Error de Ruta",
                    routeResult.message || "No se pudo calcular una ruta entre los edificios seleccionados."
                );
                this.resetRoutingSelection();
            }
        } catch (error) {
            console.error('Error calculating route:', error);
            this.modalController.show(
                "Error de Sistema",
                "Ocurrió un error al calcular la ruta. Por favor, intenta nuevamente."
            );
        }
    }

    /**
     * Anima la ruta en el mapa
     */
    animateRoute(path) {
        if (!path || path.length === 0) {
            return;
        }

        // Limpiar ruta anterior
        this.clearRouteAnimation();

        // Animar cada paso de la ruta
        path.forEach((point, index) => {
            setTimeout(() => {
                const tile = document.querySelector(`.tile[data-x="${point.x}"][data-y="${point.y}"]`);
                if (tile) {
                    tile.classList.add('route-path');
                }
            }, index * 100);
        });
    }

    /**
     * Limpia la animación de ruta
     */
    clearRouteAnimation() {
        document.querySelectorAll('.route-path').forEach(tile => {
            tile.classList.remove('route-path');
        });
    }

    /**
     * Reinicia la selección de ruta
     */
    resetRoutingSelection() {
        // Limpiar highlights
        document.querySelectorAll('.route-start, .route-end').forEach(tile => {
            tile.classList.remove('route-start', 'route-end');
        });

        this.clearRouteAnimation();

        this.routingStart = null;
        this.routingEnd = null;
        this.selectedBuilding = null;
    }

    /**
     * Activa/desactiva el modo de enrutamiento
     */
    toggleRoutingMode() {
        this.routingMode = !this.routingMode;
        
        if (this.routingMode) {
            this.resetRoutingSelection();
            this.modalController.show(
                "Modo de Enrutamiento",
                "Modo de enrutamiento activado.<br>1. Selecciona un edificio de origen.<br>2. Selecciona un edificio de destino.<br>3. El sistema calculará la ruta óptima."
            );
        } else {
            this.resetRoutingSelection();
            this.modalController.show(
                "Modo de Enrutamiento",
                "Modo de enrutamiento desactivado."
            );
        }
    }

    updateRoutingButton() {
        if (this.routingModeBtn) {
            this.routingModeBtn.textContent = this.routingMode ? "Desactivar Modo de Enrutamiento" : "Activar Modo de Enrutamiento";
            this.routingModeBtn.classList.toggle("active", this.routingMode);
        }
    }

    /**
     * Forzar guardado manual
     */
    forceSave() {
        const result = this.uiManager.game.forceSave();
        
        if (result.success) {
            this.modalController.show("Guardado Forzado", "Ciudad guardada exitosamente.");
        } else {
            this.modalController.show("Error de Guardado", `No se pudo guardar: ${result.message}`);
        }
    }

    /**
     * Exportar ciudad a archivo JSON
     */
    exportCity() {
        const result = this.uiManager.game.exportCity();
        
        if (result.success) {
            this.modalController.show("Exportación Exitosa", "Ciudad exportada exitosamente.");
        } else {
            this.modalController.show("Error de Exportación", `No se pudo exportar: ${result.message}`);
        }
    }

    /**
     * Importar ciudad desde archivo JSON
     */
    importCity(file) {
        if (!file) {
            this.modalController.show("Error", "No se seleccionó ningún archivo.");
            return;
        }

        if (file.type !== 'application/json') {
            this.modalController.show("Error", "El archivo debe ser de tipo JSON.");
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const jsonData = e.target.result;
                const result = this.uiManager.game.importCity(jsonData);
                
                if (result.success) {
                    this.modalController.show("Importación Exitosa", "Ciudad importada exitosamente. La página se recargará.");
                    // Recargar la página para aplicar los cambios
                    setTimeout(() => {
                        window.location.reload();
                    }, 2000);
                } else {
                    this.modalController.show("Error de Importación", `No se pudo importar: ${result.message}`);
                }
            } catch (error) {
                this.modalController.show("Error de Importación", `Error al leer el archivo: ${error.message}`);
            }
        };

        reader.readAsText(file);
    }

    /**
     * Actualizar estado del auto-save
     */
    updateAutoSaveStatus() {
        const status = this.uiManager.game.getAutoSaveStatus();
        
        if (this.autoSaveStatus) {
            this.autoSaveStatus.textContent = status.active ? "Activo" : "Inactivo";
        }
        
        if (this.nextSaveTime) {
            const nextSaveIn = Math.ceil(status.nextSaveIn / 1000);
            this.nextSaveTime.textContent = `Próximo: ${nextSaveIn}s`;
        }
    }

    /**
     * Iniciar actualización periódica del estado del auto-save
     */
    startAutoSaveStatusUpdates() {
        setInterval(() => {
            this.updateAutoSaveStatus();
        }, 1000); // Actualizar cada segundo
    }

    /**
     * Vincular eventos de configuración de APIs
     */
    bindApiConfigEvents() {
        if (this.saveWeatherApiBtn) {
            this.saveWeatherApiBtn.addEventListener("click", () => {
                this.saveWeatherApiKey();
            });
        }

        if (this.saveNewsApiBtn) {
            this.saveNewsApiBtn.addEventListener("click", () => {
                this.saveNewsApiKey();
            });
        }

        // Load saved API keys on initialization
        this.loadApiKeys();
    }

    /**
     * Guardar API key de OpenWeatherMap
     */
    saveWeatherApiKey() {
        const apiKey = this.openWeatherApiKeyInput?.value?.trim();
        
        if (!apiKey) {
            this.modalController.show("Error", "Por favor, ingresa una API key válida.");
            return;
        }

        // Save to localStorage
        localStorage.setItem('openweathermap_api_key', apiKey);
        
        // Update service
        this.uiManager.game.weatherService.setApiKey(apiKey);
        
        // Update status
        this.updateApiStatus('weather', 'Configurada');
        
        // Clear input
        if (this.openWeatherApiKeyInput) {
            this.openWeatherApiKeyInput.value = '';
        }

        this.modalController.show("Éxito", "API key de OpenWeatherMap guardada correctamente.");
    }

    /**
     * Guardar API key de NewsAPI
     */
    saveNewsApiKey() {
        const apiKey = this.newsApiKeyInput?.value?.trim();
        
        if (!apiKey) {
            this.modalController.show("Error", "Por favor, ingresa una API key válida.");
            return;
        }

        // Save to localStorage
        localStorage.setItem('newsapi_api_key', apiKey);
        
        // Update service
        this.uiManager.game.newsService.setApiKey(apiKey);
        
        // Update status
        this.updateApiStatus('news', 'Configurada');
        
        // Clear input
        if (this.newsApiKeyInput) {
            this.newsApiKeyInput.value = '';
        }

        this.modalController.show("Éxito", "API key de NewsAPI guardada correctamente.");
    }

    /**
     * Cargar API keys guardadas
     */
    loadApiKeys() {
        const weatherApiKey = localStorage.getItem('openweathermap_api_key');
        const newsApiKey = localStorage.getItem('newsapi_api_key');

        if (weatherApiKey) {
            this.uiManager.game.weatherService.setApiKey(weatherApiKey);
            this.updateApiStatus('weather', 'Configurada');
        }

        if (newsApiKey) {
            this.uiManager.game.newsService.setApiKey(newsApiKey);
            this.updateApiStatus('news', 'Configurada');
        }
    }

    /**
     * Actualizar estado de API
     */
    updateApiStatus(apiType, status) {
        const statusText = apiType === 'weather' ? this.weatherStatusText : this.newsStatusText;
        
        if (statusText) {
            statusText.textContent = status;
            statusText.className = `status-value ${status.toLowerCase().replace(' ', '-')}`;
        }
    }

    /**
     * Vincular eventos principales
     */
    bindEvents() {

        if (this.nextTurnBtn) {
            this.nextTurnBtn.addEventListener("click", () => {
                this.uiManager.nextTurn();
            });
        }

        if (this.scoreDetailsBtn) {
            this.scoreDetailsBtn.addEventListener("click", () => {
                this.showScoreDetails();
            });
        }

        if (this.routingModeBtn) {
            this.routingModeBtn.addEventListener("click", () => {
                this.toggleRoutingMode();
                this.updateRoutingButton();
            });
        }

        if (this.saveBtn) {
            this.saveBtn.addEventListener("click", () => {
                this.uiManager.saveGame();
                this.modalController.show("Guardar", "Partida guardada correctamente.");
            });
        }

        if (this.forceSaveBtn) {
            this.forceSaveBtn.addEventListener("click", () => {
                this.forceSave();
            });
        }

        if (this.exportBtn) {
            this.exportBtn.addEventListener("click", () => {
                this.exportCity();
            });
        }

        if (this.importBtn) {
            this.importBtn.addEventListener("click", () => {
                this.importFileInput?.click();
            });
        }

        if (this.importFileInput) {
            this.importFileInput.addEventListener("change", (e) => {
                this.importCity(e.target.files[0]);
            });
        }

        if (this.loadBtn) {
            this.loadBtn.addEventListener("click", () => {
                const loaded = this.uiManager.loadGame();

                this.modalController.show(
                    "Cargar",
                    loaded
                        ? "Partida cargada correctamente."
                        : "No se encontro una partida guardada."
                );
            });
        }

        if (this.gridContainer) {
            this.gridContainer.addEventListener("click", (e) => {
                const tile = e.target.closest(".tile");
                if (!tile) return;

                const x = parseInt(tile.dataset.x);
                const y = parseInt(tile.dataset.y);

                if (this.routingMode) {
                    this.handleBuildingSelection(x, y);
                } else {
                    this.modalController.show(
                        "Celda seleccionada",
                        `Has seleccionado la posicion (${x}, ${y})`
                    );
                }
            });
        }

        this.bindCitizenNeedsEvents();
        this.bindEditableResourceEvents();
        this.bindServiceBenefitsEvents();
        this.bindAutoTurnEvents();
        this.bindApiConfigEvents();
    }

}
