/**
 * ============================================
 * CITY BUILDER GAME - MAP MODEL
 * ============================================
 * Representa el grid de la ciudad.
 */

export class Map {

    constructor(width, height) {
        this.width = this.normalizeDimension(width);
        this.height = this.normalizeDimension(height);

        this.grid = this.initializeGrid();
    }

    normalizeDimension(value) {
        const parsedValue = Number(value);

        if (!Number.isFinite(parsedValue)) {
            return 15;
        }

        return Math.max(15, Math.min(30, Math.floor(parsedValue)));
    }

    /**
     * Crea matriz vacía
     */
    initializeGrid() {
        const grid = [];

        for (let y = 0; y < this.height; y++) {
            const row = [];

            for (let x = 0; x < this.width; x++) {
                row.push(null);
            }

            grid.push(row);
        }

        return grid;
    }

    /**
     * =========================
     * VALIDACIONES
     * =========================
     */

    isWithinBounds(x, y) {
        return (
            x >= 0 &&
            y >= 0 &&
            x < this.width &&
            y < this.height
        );
    }

    isCellEmpty(x, y) {
        if (!this.isWithinBounds(x, y)) return false;
        return this.grid[y][x] === null;
    }

    /**
     * =========================
     * MANIPULACIÓN
     * =========================
     */

    placeEntity(entity, x, y) {
        if (!this.isWithinBounds(x, y)) return false;
        if (!this.isCellEmpty(x, y)) return false;

        this.grid[y][x] = entity;
        return true;
    }

    removeEntity(x, y) {
        if (!this.isWithinBounds(x, y)) return false;

        this.grid[y][x] = null;
        return true;
    }

    getEntity(x, y) {
        if (!this.isWithinBounds(x, y)) return null;
        return this.grid[y][x];
    }

    /**
     * Devuelve todas las entidades del mapa
     */
    getAllEntities() {
        const entities = [];

        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (this.grid[y][x] !== null) {
                    entities.push(this.grid[y][x]);
                }
            }
        }

        return entities;
    }

    /**
     * =========================
     * SERIALIZACIÓN
     * =========================
     */

    toJSON() {
        return {
            width: this.width,
            height: this.height,
            grid: this.grid
        };
    }

    loadFromJSON(data) {
        this.width = this.normalizeDimension(data.width);
        this.height = this.normalizeDimension(data.height);
        this.grid = data.grid;
    }

    normalizeTextLayout(layout) {
        if (Array.isArray(layout)) {
            return layout
                .map(row => Array.isArray(row)
                    ? row.map(cell => String(cell).trim())
                    : String(row).trim().split(/\s+/))
                .filter(row => row.length > 0);
        }

        if (typeof layout !== "string") {
            return [];
        }

        return layout
            .split(/\r?\n/)
            .map(row => row.trim())
            .filter(Boolean)
            .map(row => row.split(/\s+/));
    }

    validateTextLayout(layout) {
        const rows = this.normalizeTextLayout(layout);

        if (rows.length === 0) {
            return {
                valid: false,
                message: "El mapa textual esta vacio."
            };
        }

        const width = rows[0].length;
        const hasIrregularRows = rows.some(row => row.length !== width);

        if (hasIrregularRows) {
            return {
                valid: false,
                message: "Todas las filas del mapa textual deben tener el mismo ancho."
            };
        }

        if (width < 15 || width > 30 || rows.length < 15 || rows.length > 30) {
            return {
                valid: false,
                message: "El mapa textual debe estar entre 15x15 y 30x30."
            };
        }

        return {
            valid: true,
            width,
            height: rows.length,
            rows
        };
    }

}
