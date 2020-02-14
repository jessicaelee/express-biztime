process.env.NODE_ENV = "test";
const request = require("supertest");
const app = require("../app");
const db = require("../db");

let testCompany;

beforeEach(async function() {
    let result = await db.query(`
      INSERT INTO
        companies (code, name, description) VALUES ('testCode', 'testName', 'testDescription')
        RETURNING code, name, description`);
    testCompany = result.rows[0];
});

describe("GET /companies", function(){
    test("Gets a list of 1 company", async function(){
        const response = await request(app).get("/companies")
        expect(response.statusCode).toEqual(200);
        expect(response.body).toEqual({
            companies: [testCompany]
        });
    })
});



afterEach(async function () {
    // delete any data created by test
    await db.query("DELETE FROM companies");
});

afterAll(async function () {
    // close db connection
    await db.end();
});

