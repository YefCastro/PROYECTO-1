/**
 * ============================================
 * CITY BUILDER GAME - REGION SERVICE
 * ============================================
 * Provee ciudades reales de Colombia con
 * fallback local y enriquecimiento por API.
 */

import { APIService } from "./APIService.js";

export class RegionService {

    constructor(cities = []) {
        this.cities = this.normalizeCities(cities);
    }

    normalizeCity(city = {}) {
        return {
            id: city.id || String(city.name || "").toLowerCase().replace(/\s+/g, "-"),
            name: String(city.name || "Bogota"),
            department: String(city.department || city.region || "Cundinamarca"),
            country: String(city.country || "Colombia"),
            coordinates: {
                latitude: Number(city.coordinates?.latitude ?? city.latitude ?? 0),
                longitude: Number(city.coordinates?.longitude ?? city.longitude ?? 0)
            },
            source: city.source || "local"
        };
    }

    normalizeCities(cities = []) {
        return (cities || [])
            .map(city => this.normalizeCity(city))
            .filter(city => city.country.toLowerCase() === "colombia");
    }

    getAvailableCities() {
        return [...this.cities]
            .sort((a, b) => a.name.localeCompare(b.name, "es"))
            .map(city => ({
                ...city,
                coordinates: { ...city.coordinates }
            }));
    }

    getCityByName(name) {
        const normalizedName = String(name || "").trim().toLowerCase();

        return this.cities.find(city => city.name.toLowerCase() === normalizedName) || null;
    }

    async resolveCityByName(name) {
        const localCity = this.getCityByName(name);

        if (!name) {
            return localCity || null;
        }

        const data = await APIService.fetchExternalJSON(
            `https://api-colombia.com/api/v1/City/search/${encodeURIComponent(name)}`
        );

        const match = Array.isArray(data)
            ? data.find(city => String(city.name || "").toLowerCase() === String(name).trim().toLowerCase())
                || data[0]
            : null;

        if (!match) {
            return localCity || null;
        }

        return this.normalizeCity({
            id: match.id || localCity?.id,
            name: match.name || localCity?.name || name,
            department: match.department?.name || localCity?.department,
            country: "Colombia",
            coordinates: localCity?.coordinates,
            source: "api-colombia"
        });
    }

}
