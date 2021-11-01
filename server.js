const express = require("express");
const fs = require("fs");
const path = require("path");
const sessionManager = require("session-manager").create({engine: "memory"});
const sql = require("mysql2");

const server = express();
const PORT = 8080;

const checkUserSession = (req, res, next) => {
    const session = sessionManager.start(req, res);
    if(session.get("user")) {
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

server.get("/", checkUserSession, (req, res) => {
    res.sendFile(`${__dirname}/public/index.html`);
});