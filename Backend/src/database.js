"use strict"

import { MongoClient } from "mongodb";

/**
 * Singleton-Klasse zum Zugriff auf das MongoDB-Datenbankobjekt, ohne dieses
 * ständig als Methodenparameter durchreichen zu müssen. Stattdessen kann
 * einfach das Singleton-Objekt dieser Klasse importiert und das Attribut
 * `mongodb` oder `database` ausgelesen werden.
 */
class DatabaseFactory {
    /**
     * Ersatz für den Konstruktor, damit aus dem Hauptprogramm heraus die
     * Verbindungs-URL der MongoDB übergeben werden kann. Hier wird dann
     * auch gleich die Verbindung hergestellt.
     *
     * @param {String} connectionUrl URL-String mit den Verbindungsdaten
     */
    async init(connectionUrl) {
        // Datenbankverbindung herstellen
        this.client = new MongoClient(connectionUrl);
        await this.client.connect();
        this.database = this.client.db("expense_manager");

        await this._createDemoData();
    }

    /**
     * Hilfsmethode zum Anlegen von Demodaten. Würde man so in einer
     * Produktivanwendung natürlich nicht machen, aber so sehen wir
     * wenigstens gleich ein paar Daten.
     */
    async _createDemoData() {
        let expenses = this.database.collection("expenses");

        if (await expenses.estimatedDocumentCount() === 0) {
            expenses.insertMany([
                {
                    name: "PS5",
                    details: "Playstation 5",
                    amount: "500",
                    prio: "mittel",
                },
                {
                    name: "Proteinkekse",
                    details: "Geldverschwendung",
                    amount: "35",
                    prio: "niedrig",
                },
                {
                    name: "Gym Mitgliedschaft",
                    details: "Brust gerisse",
                    amount: "25",
                    prio: "hoch",
                },
                {
                    name: "Netto Großeinkauf",
                    details: "Inflation ballert",
                    amount: "100",
                    prio: "hoch",
                },
                {
                    name: "Flug nach London",
                    details: "",
                    amount: "50",
                    prio: "niedrig",
                },
            ]);
        }

        let income = this.database.collection("income");

        if (await income.estimatedDocumentCount() === 0) {
            income.insertMany([
                {
                    name: "Arbeit",
                    details: "Kellner",
                    amount: "5000",
                    prio: "mittel",
                },
                {
                    name: "Taschengeld",
                    details: "",
                    amount: "350",
                    prio: "niedrig",
                },
            ]);
        }

    }
}

export default new DatabaseFactory();
