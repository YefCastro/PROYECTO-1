/**
 * ============================================
 * CITY BUILDER GAME - MAP RENDERER
 * ============================================
 * Renderiza visualmente el mapa en el DOM.
 */

export class MapRenderer {

    constructor(containerId) {
        this.container = document.getElementById(containerId);
    }

    buildRouteKeySet(routePath = []) {
        return new Set(
            routePath.map(point => `${point.x},${point.y}`)
        );
    }

    /**
     * Renderiza todo el mapa
     */
    render(map, options = {}) {
        if (!this.container) return;

        this.container.innerHTML = "";

        const width = map.width;
        const height = map.height;
        const routePath = this.buildRouteKeySet(options.route?.path || []);
        const routeOrigin = options.route?.origin
            ? `${options.route.origin.x},${options.route.origin.y}`
            : null;
        const routeDestination = options.route?.destination
            ? `${options.route.destination.x},${options.route.destination.y}`
            : null;

        this.container.classList.add("game-grid");
        // Establecer directamente el grid template para asegurar que funcione
        this.container.style.gridTemplateColumns = `repeat(${width}, var(--tile-size))`;
        this.container.style.gridTemplateRows = `repeat(${height}, var(--tile-size))`;

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {

                const entity = map.getEntity(x, y);
                const tileElement = document.createElement("div");
                const routeKey = `${x},${y}`;

                tileElement.classList.add("tile");
                tileElement.dataset.x = x;
                tileElement.dataset.y = y;
                tileElement.classList.add("tile-border");

                if (!entity) {
                    tileElement.classList.add("tile-empty");
                } else if (String(entity.type).toLowerCase() === "road") {
                    tileElement.classList.add("tile-road");
                } else if (entity.serviceType === "park") {
                    tileElement.classList.add("tile-park");
                } else {
                    tileElement.classList.add(
                        `tile-${entity.type.toLowerCase()}`
                    );
                }

                if (routePath.has(routeKey)) {
                    tileElement.classList.add("tile-route");
                }

                if (routeOrigin === routeKey) {
                    tileElement.classList.add("tile-route-origin");
                }

                if (routeDestination === routeKey) {
                    tileElement.classList.add("tile-route-destination");
                }

                this.container.appendChild(tileElement);
            }
        }
    }

}
