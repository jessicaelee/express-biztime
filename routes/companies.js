const express = require('express');
const router = new express.Router();
const db = require('../db');
const ExpressError = require('../expressError');



router.get('/', async function (req, res, next) {
    try {
        const companies = await db.query("SELECT code, name FROM companies");
        return res.json({ companies: companies.rows })
    } catch (err) {
        return next(err)
    }
})

router.get('/:code', async function (req, res, next) {
    try {
        const company = await db.query(`SELECT code, name, description FROM companies WHERE code = $1`, [req.params.code])
        if (company.rows.length === 0) {
            let notFoundError = new Error(`There is no company with id ${req.params.code}`);
            notFoundError.status = 404;
            throw notFoundError;
        }
        return res.json({ company: company.rows[0] })
    } catch (err) {
        return next(err)
    }
})


module.exports = router