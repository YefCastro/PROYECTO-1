/**
 * ============================================
 * CITY BUILDER GAME - FILE HANDLERS
 * ============================================
 * Manejo de lectura y descarga de archivos.
 */

export const FileHandlers = {

    /**
     * Lee un archivo de texto (.txt)
     * Retorna una Promise con el contenido del archivo
     */
    readTextFile(file) {
        return new Promise((resolve, reject) => {

            if (!file) {
                reject("No file provided");
                return;
            }

            const reader = new FileReader();

            reader.onload = (event) => {
                resolve(event.target.result);
            };

            reader.onerror = () => {
                reject("Error reading file");
            };

            reader.readAsText(file);
        });
    },

    /**
     * Convierte texto plano en matriz (para mapas)
     */
    parseTextToMatrix(text) {
        return text
            .trim()
            .split("\n")
            .map(line => line.trim().split(/\s+/));
    },

    /**
     * Descarga un objeto como archivo JSON
     */
    downloadJSON(data, fileName = "data.json") {

        const jsonString = JSON.stringify(data, null, 4); // pretty-print

        const blob = new Blob([jsonString], { type: "application/json" });

        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;

        document.body.appendChild(a);
        a.click();

        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    /**
     * Genera nombre automático para exportación de ciudad
     */
    generateCityFileName(cityName) {
        const date = new Date().toISOString().split("T")[0];
        return `ciudad_${cityName}_${date}.json`;
    }

};