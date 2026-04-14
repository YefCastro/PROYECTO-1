/**
 * ============================================
 * CITY BUILDER GAME - FORM CONTROLLER
 * ============================================
 * Maneja formularios de interaccion del usuario.
 */

export class FormController {

    constructor(game, buildingManager, modalController, regionService = null) {

        this.game = game;
        this.buildingManager = buildingManager;
        this.modalController = modalController;
        this.regionService = regionService;

        this.cityForm = document.getElementById("city-form");
        this.cityNameInput = document.getElementById("city-name-input");
        this.regionSelect = document.getElementById("region-city-select");
        this.mapWidthInput = document.getElementById("map-width-input");
        this.mapHeightInput = document.getElementById("map-height-input");

        this.mapTemplateForm = document.getElementById("map-template-form");
        this.mapTemplateInput = document.getElementById("map-template-input");

        this.buildForm = document.getElementById("build-form");
        this.typeSelect = document.getElementById("building-type");
        this.subTypeSelect = document.getElementById("building-subtype");
        this.posXInput = document.getElementById("pos-x");
        this.posYInput = document.getElementById("pos-y");

        this.demolishForm = document.getElementById("demolish-form");
        this.demolishXInput = document.getElementById("demolish-x");
        this.demolishYInput = document.getElementById("demolish-y");

        this.routeForm = document.getElementById("route-form");
        this.routeStartXInput = document.getElementById("route-start-x");
        this.routeStartYInput = document.getElementById("route-start-y");
        this.routeEndXInput = document.getElementById("route-end-x");
        this.routeEndYInput = document.getElementById("route-end-y");
        this.clearRouteBtn = document.getElementById("clear-route-btn");

        this.populateBuildingTypes();
        this.populateBuildingSubtypes();
        this.populateRegions();
        this.syncFromGame();

        this.bindEvents();
    }

    parseCoordinatePair(xInput, yInput) {
        const x = Number.parseInt(xInput?.value, 10);
        const y = Number.parseInt(yInput?.value, 10);

        if (!Number.isInteger(x) || !Number.isInteger(y)) {
            return null;
        }

        return { x, y };
    }

    populateRegions() {
        if (!this.regionSelect || !this.regionService) {
            return;
        }

        const cities = this.regionService.getAvailableCities();
        this.regionSelect.innerHTML = "";

        cities.forEach(city => {
            const option = document.createElement("option");
            option.value = city.name;
            option.textContent = `${city.name} (${city.department})`;
            this.regionSelect.appendChild(option);
        });
    }

    syncFromGame() {
        if (this.cityNameInput) {
            this.cityNameInput.value = this.game.getCityName();
        }

        const mapSize = this.game.getMapSize();

        if (this.mapWidthInput) {
            this.mapWidthInput.value = mapSize.width;
        }

        if (this.mapHeightInput) {
            this.mapHeightInput.value = mapSize.height;
        }

        if (this.regionSelect) {
            this.regionSelect.value = this.game.getGeographicRegion()?.name || "";
        }
    }

    /**
     * Vincular eventos
     */
    bindEvents() {

        this.cityForm?.addEventListener("submit", async (e) => {
            e.preventDefault();
            await this.handleCityConfiguration();
        });

        this.mapTemplateForm?.addEventListener("submit", (e) => {
            e.preventDefault();
            this.handleMapTemplate();
        });

        this.buildForm?.addEventListener("submit", (e) => {
            e.preventDefault();
            this.handleBuild();
        });

        this.demolishForm?.addEventListener("submit", (e) => {
            e.preventDefault();
            this.handleDemolition();
        });

        this.routeForm?.addEventListener("submit", (e) => {
            e.preventDefault();
            this.handleRoutePlanning();
        });

        this.clearRouteBtn?.addEventListener("click", () => {
            this.game.uiManager?.clearRoute?.();
        });

        this.typeSelect?.addEventListener("change", () => {
            this.populateBuildingSubtypes();
        });
    }

    async handleCityConfiguration() {
        const nextName = this.cityNameInput?.value?.trim();
        const nextMapWidth = Number.parseInt(this.mapWidthInput?.value, 10);
        const nextMapHeight = Number.parseInt(this.mapHeightInput?.value, 10);
        const selectedRegionName = this.regionSelect?.value;

        if (!nextName) {
            this.modalController.show("Nombre invalido", "Escribe un nombre para la ciudad.");
            return;
        }

        const region = this.regionService
            ? await this.regionService.resolveCityByName(selectedRegionName)
            : this.game.getGeographicRegion();

        const result = this.game.reconfigureCity({
            name: nextName,
            mapWidth: nextMapWidth,
            mapHeight: nextMapHeight,
            geographicRegion: region
        });

        this.game.uiManager?.clearRoute?.();
        this.syncFromGame();

        if (result.reset) {
            this.modalController.show(
                "Ciudad reconfigurada",
                `Se reinicio la ciudad con mapa ${result.city.getMapLabel()} en ${result.city.getGeographicRegion().name}.`
            );
            return;
        }

        this.game.uiManager?.render?.();
        this.modalController.show(
            "Ciudad actualizada",
            `La ciudad ahora se llama ${this.game.getCityName()} y permanece en ${this.game.getGeographicRegion().name}.`
        );
    }

    handleMapTemplate() {
        const layout = this.mapTemplateInput?.value?.trim();

        if (!layout) {
            this.modalController.show("Mapa invalido", "Pega un mapa textual usando tokens como g, r, R1 o C1.");
            return;
        }

        const result = this.game.loadMapLayout(layout);

        if (!result.success) {
            this.modalController.show("Mapa invalido", result.message);
            return;
        }

        this.game.uiManager?.clearRoute?.();
        this.syncFromGame();
        this.modalController.show(
            "Mapa cargado",
            `Se aplico un mapa de ${result.width}x${result.height} con ${result.placed} celdas ocupadas.`
        );
    }

    /**
     * Manejar construccion
     */
    handleBuild() {

        const type = this.typeSelect.value;
        const subType = this.subTypeSelect && !this.subTypeSelect.disabled
            ? this.subTypeSelect.value
            : null;
        const coordinates = this.parseCoordinatePair(this.posXInput, this.posYInput);

        if (!coordinates) {
            this.modalController.show("Error", "Coordenadas invalidas.");
            return;
        }

        const result = this.buildingManager.build(type, coordinates.x, coordinates.y, subType);

        if (!result.success) {
            this.modalController.show("Construccion fallida", result.message);
            return;
        }

        this.game.uiManager?.clearRoute?.();
        this.modalController.show(
            "Construccion exitosa",
            "El edificio fue construido correctamente."
        );
    }

    handleDemolition() {
        const coordinates = this.parseCoordinatePair(this.demolishXInput, this.demolishYInput);

        if (!coordinates) {
            this.modalController.show("Demolicion fallida", "Coordenadas invalidas.");
            return;
        }

        const result = this.game.demolishAt(coordinates.x, coordinates.y);

        if (!result.success) {
            this.modalController.show("Demolicion fallida", result.message);
            return;
        }

        this.game.uiManager?.clearRoute?.();
        this.modalController.show(
            "Demolicion completada",
            `Se retiro la estructura ubicada en (${coordinates.x}, ${coordinates.y}).`
        );
    }

    handleRoutePlanning() {
        const start = this.parseCoordinatePair(this.routeStartXInput, this.routeStartYInput);
        const end = this.parseCoordinatePair(this.routeEndXInput, this.routeEndYInput);

        if (!start || !end) {
            this.modalController.show("Ruta invalida", "Debes indicar coordenadas enteras para origen y destino.");
            return;
        }

        const route = this.game.planRoute(start, end);

        if (!route.success) {
            this.game.uiManager?.clearRoute?.();
            this.modalController.show("Ruta no disponible", route.message);
            return;
        }

        this.game.uiManager?.showRoute?.(route);
        this.modalController.show(
            "Ruta calculada",
            `Se encontro una ruta de ${route.distance} tramos entre (${start.x}, ${start.y}) y (${end.x}, ${end.y}).`
        );
    }

    populateBuildingTypes() {

        if (!this.typeSelect) return;

        const buildings = this.buildingManager.getAvailableBuildingOptions();

        this.typeSelect.innerHTML = "";

        buildings.forEach(({ type, label, category }) => {
            const option = document.createElement("option");
            option.value = type;
            option.textContent = `${label} (${category})`;

            this.typeSelect.appendChild(option);
        });
    }

    populateBuildingSubtypes() {
        if (!this.subTypeSelect || !this.typeSelect) return;

        const type = this.typeSelect.value;
        const subtypeOptions = this.buildingManager.getBuildingSubtypeOptions(type);

        this.subTypeSelect.innerHTML = "";

        if (subtypeOptions.length === 0) {
            this.subTypeSelect.hidden = true;
            this.subTypeSelect.disabled = true;
            return;
        }

        subtypeOptions.forEach(({ value, label }) => {
            const option = document.createElement("option");
            option.value = value;
            option.textContent = label;

            this.subTypeSelect.appendChild(option);
        });

        this.subTypeSelect.hidden = false;
        this.subTypeSelect.disabled = false;
    }

}
