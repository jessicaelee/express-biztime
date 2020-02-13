const express = require('express');
const router = new express.Router();
const db = require('../db');
const ExpressError = require('../expressError');



router.get('/', async function (req, res, next) {
    try {
        const companies = await db.query("SELECT code, name FROM companies");
        return res.status(200).json({ companies: companies.rows });
    } catch (err) {
        return next(err);
    }
});

router.get('/:code', async function (req, res, next) {
    try {
        const companyRes = await db.query(
            `SELECT code, name, description 
                   FROM companies 
                   WHERE code = $1`,
            [req.params.code]);

        const invoicesRes = await db.query(
            `SELECT id FROM invoices 
            WHERE comp_code = $1`,
            [req.params.code]);

        if (companyRes.rows.length === 0) {
            let notFoundError = new Error(`There is no company with code ${req.params.code}`);
            notFoundError.status = 404;
            throw notFoundError;
        }

        let company = companyRes.rows[0];
        let invoices = invoicesRes.rows.map(invoice => invoice.id);

        return res.status(200).json({ ...company, invoices });
    } catch (err) {
        return next(err);
    }
});

router.post('/', async function (req, res, next) {
    try {
        const { code, name, description } = req.body;
        const result = await db.query(
            `INSERT INTO companies (code, name, description) 
               VALUES ($1, $2, $3) 
               RETURNING code, name, description`,
            [code, name, description]);

        return res.status(201).json({ company: result.rows[0] });
    } catch (err) {
        return next(err);
    }
});

router.put('/:code', async function (req, res, next) {
    try {
        const { name, description } = req.body;
        const result = await db.query(
            `UPDATE companies SET name=$1, description=$2
               WHERE code=$3
               RETURNING code, name, description`,
            [name, description, req.params.code]);

        return res.status(200).json({ company: result.rows[0] });
    } catch (err) {
        return next(err);
    }
});

router.delete('/:code', async function (req, res, next) {
    try {
        const result = await db.query(
            `DELETE FROM companies WHERE code=$1 RETURNING code`,
            [req.params.code]);

        if (result.rows.length === 0) {
            throw new ExpressError(`There is no company with code of '${req.params.code}`, 404);
        }
        return res.status(200).json({ status: "Deleted" });
    } catch (err) {
        return next(err);
    }
});

module.exports = router;