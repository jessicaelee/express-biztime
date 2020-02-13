const express = require('express');
const router = new express.Router();
const db = require('../db');
const ExpressError = require('../expressError');

router.get('/', async function (req, res, next) {
    try {
        const invoices = await db.query("SELECT id, comp_code FROM invoices");
        return res.status(200).json({ invoices: invoices.rows });
    } catch (err) {
        return next(err);
    }

});

router.get('/:id', async function (req, res, next) {
    try {
        const invoiceRes = await db.query(
            `SELECT id, amt, paid, add_date, paid_date
                   FROM invoices as i 
                   LEFT JOIN companies as c
                   ON i.comp_code = c.code
                   WHERE id=$1`,
            [req.params.id]);
        const companyRes = await db.query(
            `SELECT code, name, description
                   FROM invoices as i 
                   LEFT JOIN companies as c
                   ON i.comp_code = c.code
                   WHERE id=$1`,
            [req.params.id]);

        let invoice = invoiceRes.rows[0];
        let company = companyRes.rows[0];

        if (invoiceRes.rows.length === 0) {
            let notFoundError = new Error(`There is no invoice with id ${req.params.id}`);
            notFoundError.status = 404;
            throw notFoundError;
        }
        return res.status(200).json({ ...invoice, company });

    } catch (err) {
        return next(err);
    }
});

router.post('/', async function (req, res, next) {
    try {
        const { comp_code, amt } = req.body;
        const resp = await db.query('SELECT code FROM companies WHERE code=$1', [comp_code])

        if (resp.rows.length < 1) {
            const invalidCompanyError = new Error(`There is no company ${comp_code}`);
            invalidCompanyError.status = 404;
            throw invalidCompanyError;
        }
        const result = await db.query(
            `INSERT INTO invoices (comp_Code, amt, paid, paid_date)
                VALUES ($1, $2, false, null)
                RETURNING id, comp_code, amt, paid, add_date, paid_date`,
            [comp_code, amt]);


        return res.status(201).json({ invoice: result.rows[0] });

    } catch (err) {
        return next(err);
    }
});

router.put('/:id', async function (req, res, next) {
    try {
        const amt = req.body.amt
        const result = await db.query(
            `UPDATE invoices SET amt=$1
                WHERE id=$2
                RETURNING id, comp_code, amt, paid, add_date, paid_date`,
            [amt, req.params.id]);
        return res.status(200).json({ invoice: result.rows[0] });

    } catch (err) {
        return next(err);
    }
});

module.exports = router;