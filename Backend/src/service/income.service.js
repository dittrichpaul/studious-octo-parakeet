"use strict"

import DatabaseFactory from "../database.js";
import {ObjectId} from "mongodb";

/**
 * Geschäftslogik zur Verwaltung von Ausgaben. Diese Klasse implementiert die
 * eigentliche Anwendungslogik losgelöst vom technischen Übertragungsweg.
 * Die Ausgaben werden der Einfachheit halber in einer MongoDB abgelegt.
 */
export default class IncomeService {
    /**
     * Konstruktor.
     */
    constructor() {
        this._income = DatabaseFactory.database.collection("income");
    }

    /**
     * Ausgaben suchen. Unterstützt wird lediglich eine ganz einfache Suche,
     * bei der einzelne Felder auf exakte Übereinstimmung geprüft werden.
     * Zwar unterstützt MongoDB prinzipiell beliebig komplexe Suchanfragen.
     * Um das Beispiel klein zu halten, wird dies hier aber nicht unterstützt.
     *
     * @param {Object} query Optionale Suchparameter
     * @return {Promise} Liste der gefundenen Ausgaben
     */
    async search(query) {
        let cursor = this._income.find(query, {
            sort: {
                name: 1,
                details: 1,
            }
        });

        return cursor.toArray();
    }

    /**
     * Speichern einer neuen Ausgabe.
     *
     * @param {Object} income Zu speichernde Ausgabedaten
     * @return {Promise} Gespeicherte Ausgabedaten
     */
    async create(income) {
        income = income || {};

        let newIncome = {
            name:       income.name || "",
            details:    income.details  || "",
            amount:     income.amount     || "",
            prio:       income.prio     || "",
        };

        let result = await this._income.insertOne(newIncome);
        return await this._income.findOne({_id: result.insertedId});
    }

    /**
     * Auslesen einer vorhandenen Ausgabe anhand ihrer ID.
     *
     * @param {String} id ID der gesuchten Ausgabe
     * @return {Promise} Gefundene Ausgabedaten
     */
    async read(id) {
        let result = await this._income.findOne({_id: new ObjectId(id)});
        return result;
    }

    /**
     * Aktualisierung einer Ausgabe, durch Überschreiben einzelner Felder
     * oder des gesamten Ausgabeobjekts (ohne die ID).
     *
     * @param {String} id ID der gesuchten Ausgabe
     * @param {[type]} income Zu speichernde Ausgabedaten
     * @return {Promise} Gespeicherte Ausgabedaten oder undefined
     */
    async update(id, income) {
        let oldIncome = await this._income.findOne({_id: new ObjectId(id)});
        if (!oldIncome) return;

        let updateDoc = {
            $set: {},
        }

        if (income.name) updateDoc.$set.name = income.name;
        if (income.details)  updateDoc.$set.details  = income.details;
        if (income.amount)      updateDoc.$set.amount      = income.amount;
        if (income.prio)      updateDoc.$set.prio     = income.prio;

        await this._income.updateOne({_id: new ObjectId(id)}, updateDoc);
        return this._income.findOne({_id: new ObjectId(id)});
    }

    /**
     * Löschen einer Ausgabe anhand ihrer ID.
     *
     * @param {String} id ID der gesuchten Auasgabe
     * @return {Promise} Anzahl der gelöschten Datensätze
     */
    async delete(id) {
        let result = await this._income.deleteOne({_id: new ObjectId(id)});
        return result.deletedCount;
    }
}
