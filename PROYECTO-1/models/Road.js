/**
 * ============================================
 * CITY BUILDER GAME - ROAD MODEL
 * ============================================
 * Representa una carretera en el grid.
 */

import { Helpers } from "../js/utils/helpers.js";
import { GAME_CONSTANTS } from "../js/utils/constans.js";

export class Road {

    constructor(x, y, config = {}) {
        this.id = Helpers.generateId("road");
        this.type = "road";
        this.x = x;
        this.y = y;

        this.cost = config.cost || GAME_CONSTANTS.ROAD?.COST || 0;
        this.maintenanceCost = config.maintenance || config.maintenanceCost || 0;
    }

    /**
     * Devuelve posicion en formato objeto
     */
    getPosition() {
        return {
            x: this.x,
            y: this.y
        };
    }

    /**
     * Devuelve clave unica de celda
     */
    getKey() {
        return `${this.x}-${this.y}`;
    }

    /**
     * Serializacion
     */
    toJSON() {
        return {
            id: this.id,
            type: this.type,
            x: this.x,
            y: this.y
        };
    }

    /**
     * Restauracion desde JSON
     */
    loadFromJSON(data) {
        this.id = data.id;
        this.type = data.type;
        this.x = data.x;
        this.y = data.y;
    }

}
