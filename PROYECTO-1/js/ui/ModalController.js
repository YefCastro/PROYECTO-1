/**
 * ============================================
 * CITY BUILDER GAME - MODAL CONTROLLER
 * ============================================
 * Controla ventanas modales del sistema.
 */

export class ModalController {

    constructor() {

        this.overlay = document.getElementById("modal-overlay");
        this.titleEl = document.getElementById("modal-title");
        this.contentEl = document.getElementById("modal-content");
        this.closeBtn = document.getElementById("modal-close");

        this.bindEvents();
    }

    /**
     * Vincular eventos del modal
     */
    bindEvents() {
        if (this.closeBtn) {
            this.closeBtn.addEventListener("click", () => {
                this.hide();
            });
        }

        if (this.overlay) {
            this.overlay.addEventListener("click", (e) => {
                if (e.target === this.overlay) {
                    this.hide();
                }
            });
        }
    }

    /**
     * Mostrar modal
     */
    show(title, content) {

        if (!this.overlay) return;

        if (this.titleEl) this.titleEl.textContent = title;
        if (this.contentEl) this.contentEl.textContent = content;

        this.overlay.classList.remove("hidden");
    }

    /**
     * Ocultar modal
     */
    hide() {
        if (this.overlay) {
            this.overlay.classList.add("hidden");
        }
    }

}