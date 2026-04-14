/**
 * ============================================
 * CITY BUILDER GAME - VALIDATORS
 * ============================================
 * Funciones de validación reutilizables.
 */

import { GAME_CONSTANTS } from "./constans.js";

export const Validators = {

    /**
     * Valida que un texto no esté vacío y no exceda longitud máxima
     */
    validateText(value, maxLength = 50) {
        if (!value) return false;
        if (typeof value !== "string") return false;
        if (value.trim().length === 0) return false;
        if (value.trim().length > maxLength) return false;
        return true;
    },

    /**
     * Valida tamaño del mapa dentro del rango permitido
     */
    validateMapSize(size) {
        return (
            size >= GAME_CONSTANTS.MAP.MIN_SIZE &&
            size <= GAME_CONSTANTS.MAP.MAX_SIZE
        );
    },

    /**
     * Valida que una celda esté vacía
     */
    validateEmptyCell(cell) {
        return cell === null;
    },

    /**
     * Valida que haya suficiente dinero
     */
    validateEnoughMoney(currentMoney, cost) {
        return currentMoney >= cost;
    },

    /**
     * Valida coordenadas dentro del mapa
     */
    validateCoordinates(x, y, width, height) {
        return x >= 0 && y >= 0 && x < width && y < height;
    },

    /**
     * Valida que un recurso no sea negativo
     */
    validatePositiveResource(value) {
        return value >= 0;
    },

    /**
     * Valida felicidad dentro del rango permitido
     */
    validateHappiness(value) {
        return (
            value >= GAME_CONSTANTS.CITIZENS.MIN_HAPPINESS &&
            value <= GAME_CONSTANTS.CITIZENS.MAX_HAPPINESS
        );
    },

    /**
     * Valida que un archivo sea tipo .txt
     */
    validateTxtFile(fileName) {
        return fileName && fileName.toLowerCase().endsWith(".txt");
    },

    /**
     * Valida estructura básica de matriz
     */
    validateMatrix(matrix) {
        if (!Array.isArray(matrix)) return false;
        if (!Array.isArray(matrix[0])) return false;
        return true;
    }

};