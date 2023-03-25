"use strict"

import DatabaseFactory from "../database.js";
import {ObjectId} from "mongodb";

/**
 * Geschäftslogik zur Verwaltung von Ausgaben. Diese Klasse implementiert die
 * eigentliche Anwendungslogik losgelöst vom technischen Übertragungsweg.
 * Die Ausgaben werden der Einfachheit halber in einer MongoDB abgelegt.
 */
export default class ExpenseService {
    /**
     * Konstruktor.
     */
    constructor() {
        this._expenses = DatabaseFactory.database.collection("expenses");
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
        let cursor = this._expenses.find(query, {
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
     * @param {Object} expense Zu speichernde Ausgabedaten
     * @return {Promise} Gespeicherte Ausgabedaten
     */
    async create(expense) {
        expense = expense || {};

        let newExpense = {
            name:       expense.name || "",
            details:    expense.details  || "",
            amount:     expense.amount     || "",
            prio:       expense.prio     || "",
        };

        let result = await this._expenses.insertOne(newExpense);
        return await this._expenses.findOne({_id: result.insertedId});
    }

    /**
     * Auslesen einer vorhandenen Ausgabe anhand ihrer ID.
     *
     * @param {String} id ID der gesuchten Ausgabe
     * @return {Promise} Gefundene Ausgabedaten
     */
    async read(id) {
        let result = await this._expenses.findOne({_id: new ObjectId(id)});
        return result;
    }

    /**
     * Aktualisierung einer Ausgabe, durch Überschreiben einzelner Felder
     * oder des gesamten Ausgabeobjekts (ohne die ID).
     *
     * @param {String} id ID der gesuchten Ausgabe
     * @param {[type]} expense Zu speichernde Ausgabedaten
     * @return {Promise} Gespeicherte Ausgabedaten oder undefined
     */
    async update(id, expense) {
        let oldExpense = await this._expenses.findOne({_id: new ObjectId(id)});
        if (!oldExpense) return;

        let updateDoc = {
            $set: {},
        }

        if (expense.name) updateDoc.$set.name = expense.name;
        if (expense.details)  updateDoc.$set.details  = expense.details;
        if (expense.amount)      updateDoc.$set.amount      = expense.amount;
        if (expense.prio)      updateDoc.$set.prio     = expense.prio;

        await this._expenses.updateOne({_id: new ObjectId(id)}, updateDoc);
        return this._expenses.findOne({_id: new ObjectId(id)});
    }

    /**
     * Löschen einer Ausgabe anhand ihrer ID.
     *
     * @param {String} id ID der gesuchten Auasgabe
     * @return {Promise} Anzahl der gelöschten Datensätze
     */
    async delete(id) {
        let result = await this._expenses.deleteOne({_id: new ObjectId(id)});
        return result.deletedCount;
    }
}
