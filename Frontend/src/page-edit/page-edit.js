"use strict";

import Page from "../page.js";
import HtmlTemplate from "./page-edit.html";

/**
 * Klasse PageEdit: Stellt die Seite zum Anlegen oder Bearbeiten einer Ausgabe
 * zur Verfügung.
 */
export default class PageEdit extends Page {
    /**
     * Konstruktor.
     *
     * @param {App} app Instanz der App-Klasse
     * @param {Integer} editId ID des bearbeiteten Datensatzes
     */
    constructor(app, editId) {
        super(app, HtmlTemplate);

        // Bearbeiteter Datensatz
        this._editId = editId;

        this._dataset = {
            name: "",
            details: "",
            amount: "",
            prio: "",
        };

        // Eingabefelder
        this._nameInput = null;
        this._detailsInput  = null;
        this._amountInput     = null;
        this._prioInput     = null;
    }

    /**
     * HTML-Inhalt und anzuzeigende Daten laden.
     *
     * HINWEIS: Durch die geerbte init()-Methode wird `this._mainElement` mit
     * dem <main>-Element aus der nachgeladenen HTML-Datei versorgt. Dieses
     * Element wird dann auch von der App-Klasse verwendet, um die Seite
     * anzuzeigen. Hier muss daher einfach mit dem üblichen DOM-Methoden
     * `this._mainElement` nachbearbeitet werden, um die angezeigten Inhalte
     * zu beeinflussen.
     *
     * HINWEIS: In dieser Version der App wird mit dem üblichen DOM-Methoden
     * gearbeitet, um den finalen HTML-Code der Seite zu generieren. In größeren
     * Apps würde man ggf. eine Template Engine wie z.B. Nunjucks integrieren
     * und den JavaScript-Code dadurch deutlich vereinfachen.
     */
    async init() {
        // HTML-Inhalt nachladen
        await super.init();

        // Bearbeiteten Datensatz laden
        if (this._editId) {
            this._url = `/expense/${this._editId}`;
            this._dataset = await this._app.backend.fetch("GET", this._url);
            this._title = `${this._dataset.name} `;
        } else {
            this._url = `/expense`;
            this._title = "Ausgabe hinzufügen";
        }

        // Platzhalter im HTML-Code ersetzen
        let html = this._mainElement.innerHTML;
        html = html.replace("$DETAILS$", this._dataset.details);
        html = html.replace("$NAME$", this._dataset.name);
        html = html.replace("$AMOUNT$", this._dataset.amount);
        html = html.replace("$PRIO$", this._dataset.prio);
        this._mainElement.innerHTML = html;

        // Event Listener registrieren
        let saveButton = this._mainElement.querySelector(".action.save");
        saveButton.addEventListener("click", () => this._saveAndExit());

        // Eingabefelder zur späteren Verwendung merken
        this._nameInput = this._mainElement.querySelector("input.name");
        this._detailsInput  = this._mainElement.querySelector("input.details");
        this._amountInput     = this._mainElement.querySelector("input.amount");
        this._prioInput     = this._mainElement.querySelector("input.prio");
    }

    /**
     * Speichert den aktuell bearbeiteten Datensatz und kehrt dann wieder
     * in die Listenübersicht zurück.
     */
    async _saveAndExit() {
        // Eingegebene Werte prüfen
        this._dataset._id        = this._editId;
        this._dataset.name       = this._nameInput.value.trim();
        this._dataset.details    = this._detailsInput.value.trim();
        this._dataset.amount     = this._amountInput.value.trim();
        this._dataset.prio       = this._prioInput.value.trim();

        if (!this._dataset.name) {
            alert("Geben Sie erst einen Namen für die Ausgabe an 💰");
            return;
        }

        if (!this._dataset.amount) {
            alert("Geben Sie einen Betrag für die Ausgabe an 💸");
            return;
        }

        // Datensatz speichern
        try {
            if (this._editId) {
                await this._app.backend.fetch("PUT", this._url, {body: this._dataset});
            } else {
                await this._app.backend.fetch("POST", this._url, {body: this._dataset});
            }
        } catch (ex) {
            this._app.showException(ex);      //ANPASSEN EVENTUELL ?!?!?!?!!?
            return;
        }

        // Zurück zur Übersicht
        location.hash = "#/";
    }
};
