/**
 * ============================================
 * CITY BUILDER GAME - MAP TEMPLATE SERVICE
 * ============================================
 * Carga mapas textuales usando convenciones
 * del dominio urbano.
 */

import { City } from "../../models/City.js";

const TOKEN_MAP = {
    g: null,
    r: { type: "ROAD", level: 1 },
    R1: { type: "RESIDENTIAL", subType: "HOUSE", level: 1 },
    R2: { type: "RESIDENTIAL", subType: "APARTMENT", level: 1 },
    C1: { type: "COMMERCIAL", subType: "STORE", level: 1 },
    C2: { type: "COMMERCIAL", subType: "MALL", level: 1 },
    I1: { type: "INDUSTRIAL", subType: "FACTORY", level: 1 },
    I2: { type: "INDUSTRIAL", subType: "FARM", level: 1 },
    S1: { type: "SERVICE", subType: "POLICE_STATION", level: 1 },
    S2: { type: "SERVICE", subType: "FIRE_STATION", level: 1 },
    S3: { type: "SERVICE", subType: "HOSPITAL", level: 1 },
    U1: { type: "UTILITY_PLANT", subType: "POWER_PLANT", level: 1 },
    U2: { type: "UTILITY_PLANT", subType: "WATER_PLANT", level: 1 },
    P1: { type: "PARK", level: 1 }
};

export class MapTemplateService {

    validateLayout(map, layout) {
        const validation = map.validateTextLayout(layout);

        if (!validation.valid) {
            return validation;
        }

        for (const row of validation.rows) {
            for (const token of row) {
                if (!(token in TOKEN_MAP)) {
                    return {
                        valid: false,
                        message: `Token de mapa no soportado: ${token}`
                    };
                }
            }
        }

        return validation;
    }

    applyLayout(city, buildingManager, layout) {
        const validation = this.validateLayout(city.map, layout);

        if (!validation.valid) {
            return {
                success: false,
                message: validation.message
            };
        }

        const placements = [];

        validation.rows.forEach((row, y) => {
            row.forEach((token, x) => {
                const descriptor = TOKEN_MAP[token];

                if (descriptor) {
                    placements.push({ x, y, ...descriptor });
                }
            });
        });

        const roads = placements.filter(item => item.type === "ROAD");
        const structures = placements.filter(item => item.type !== "ROAD");

        roads.forEach(item => {
            buildingManager.placeFromTemplate(item.type, item.x, item.y, item.subType, item.level);
        });

        structures.forEach(item => {
            buildingManager.placeFromTemplate(item.type, item.x, item.y, item.subType, item.level);
        });

        return {
            success: true,
            width: validation.width,
            height: validation.height,
            placed: placements.length
        };
    }

}
