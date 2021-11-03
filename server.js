const express = require("express");
const fs = require("fs");
const path = require("path");
// const sessionManager = require("session-manager").create({engine: "memory"});
const sql = require("mysql2");
const sessionMysql = require("mysql2/promise");

const server = express();
const PORT = 8080;

const cashierDB = sql.createConnection({
    host: "localhost",
    database: "cashier_system",
    user: "root",
    password: ""
})

const checkUserSession = (req, res, next) => {
    const session = sessionManager.start(req, res);
    if (session.get("user")) {
        return next()

    }
    return res.redirect("/login");
}

server.use(express.json());
server.use(express.static("public"));


server.listen(PORT, () => {
    console.log(`Server running in this url http://localhost:${PORT}`);
})

server.get("/login", (req, res) => {
    res.sendFile(`${__dirname}/public/login.html`);
});

server.get("/", (req, res) => {
    res.sendFile(`${__dirname}/public/home.html`);
});

server.post("/login", (req, res) => {
    const {
        username,
        password
    } = req.body;
    const query = `SELECT * FROM users WHERE username="${username.toString().trim()}" AND username="${password.toString().trim()}"`
    cashierDB.query(query, (err, rows) => {
        if(err) throw err;
        if(rows[0]) {
            res.json(rows[0]);
        } else {
            res.json({
                status: "Failed",
                message: "User not found"
            });
        }
    })
})