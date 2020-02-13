const express = require('express');
const router = new express.Router();
const db = require('../db');
const ExpressError = require('../expressError');

router.get('/', async function (req, res, next){
    try {
        const invoices = await db.query("SELECT id, comp_code FROM invoices");
        return res.status(200).json({ invoices: invoices.rows });
    } catch (err){
        return next(err);
    }
    
});

router.get('/:id', async function (req, res, next) {
    try {
        const invoice = await db.query(
            // Fix comp code later; will learn in the afternoon
                `SELECT id, amt, paid, add_date, paid_date, comp_code
                   FROM invoices
                   WHERE id= $1`,
                [req.params.id])

        if (invoice.rows.length === 0) {
            let notFoundError = new Error(`There is no invoice with id ${req.params.id}`);
            notFoundError.status = 404;
            throw notFoundError;
        }
        return res.status(200).json({ invoice: invoice.rows[0] });
    } catch (err) {
        return next(err);
    }
});

module.exports = router;