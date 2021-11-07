const express = require("express");
const sql = require("mysql2");
const sessionMysql = require("mysql2/promise");
const sessionManager = require("express-session");
const uid = require("uuid");


const server = express();
const PORT = 8080;
const MySQLStore = require("express-mysql-session")(sessionManager);

const connectionSession = sessionMysql.createPool({
    host: "localhost",
    database: "cashier_system",
    user: "root",
    password: ""
});
const sessionStore = new MySQLStore({}, connectionSession);
let itemsProduct = [];


const mySession = sessionManager({
    secret: "thisismysecretsession",
    genid: () => uid.v4(),
    saveUninitialized: true,
    resave: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 2,
        sameSite: true,
        httpOnly: true,
        secure: false,
    },
    store: sessionStore
})
const cashierDB = sql.createConnection({
    host: "localhost",
    database: "cashier_system",
    user: "root",
    password: ""
});

const logisticDB = sql.createConnection({
    host: "localhost",
    database: "logistic_system",
    user: "root",
    password: ""
});


const checkUserSession = (req, res, next) => {
    if (req.session.user) {
        return next();
    }
    return res.redirect("/login");
}

server.use(express.json());
server.use(express.static("public"));
server.use(express.urlencoded({
    extended: true
}));
server.use(mySession);


server.listen(PORT, () => {
    console.log(`Server running in this url http://localhost:${PORT}`);
})

server.get("/login", (req, res) => {
    if (req.session.user) return res.redirect("/");
    res.sendFile(`${__dirname}/public/login.html`);
});

server.get("/", checkUserSession, (req, res) => {
    res.sendFile(`${__dirname}/public/home.html`);
});

server.post("/add-transaction", (req, res) => {
    const transaction = req.body;
    console.log(transaction);
    res.json(transaction);
})

server.post("/login", (req, res) => {
    const {
        username,
        password
    } = req.body;
    const query = `SELECT * FROM users WHERE username="${username.toString().trim()}" AND username="${password.toString().trim()}"`
    cashierDB.query(query, (err, rows) => {
        if (err) throw err;
        if (rows[0]) {
            req.session.user = rows[0];
            req.session.save(err => {
                if(err) throw err;
            });
            res.json(rows[0]);
        } else {
            res.json({
                status: "Failed",
                message: "User not found"
            });
        }
    })
});

server.post("/get-user", (req, res) => {
    const user = req.session.user;
    if (user) {
        return res.json(user);
    }
    return res.json({
        status: "Failed",
        message: "User not found"
    });
});

server.post("/delete-item", (req, res) => {
    const idProduct = parseInt(req.body.idProduct);
    // const itemIndex = itemsProduct.findIndex(item => item !== idProduct);
    itemsProduct.forEach(product => {
        if (product.quantity < 2 && product.id_product == idProduct) {
            itemsProduct = itemsProduct.filter(item => item.id_product != idProduct);
            return;
        }
        if(product.id_product == idProduct) {
            product.quantity--;
        }
        // const existingItem = itemsProduct.find(product => product.id_product == idProduct);
        // const existingItemIndex = itemsProduct.findIndex(product => product.id_product == idProduct);
        // itemsProduct.splice(existingItemIndex, 1, existingItem);
    })
    res.json({
        status: "Success",
        message: "This is your items",
        itemsProduct
    });
})

server.post("/logout", (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.json({
                status: "Success",
                message: err
            });
        };
        return res.json({
            status: "Success",
            message: "User has been logged out"
        })
    });
});

server.post("/add-item", (req, res) => {
    const idProduct = parseInt(req.body.idProduct);
    const query = `SELECT name, price, id_product FROM products WHERE id_product = ${idProduct}`;
    logisticDB.query(query, (err, rows) => {
        if (err) throw err;
        if (rows[0]) {
            const existingItem = itemsProduct.find(product => product.id_product == idProduct);
            const existingItemIndex = itemsProduct.findIndex(product => product.id_product == idProduct);
            if (existingItem) {
                existingItem.quantity++;
                itemsProduct.splice(existingItemIndex, 1, existingItem);
            } else {
                rows[0].quantity = 1;
                itemsProduct.push(rows[0]);
            }

            res.json({
                status: "Success",
                message: "Item has been added",
                itemsProduct
            });
        } else {
            res.json({
                status: "Failed",
                message: "Item added unsuccessful",
            });
        }
    })
});

server.post("/clear-all-items", (req, res) => {
    itemsProduct = [];
    if (itemsProduct.length < 1) {
        res.json({
            status: "Success",
            message: "All items has been cleared",
            itemsProduct
        })
    } else {
        res.json({
            status: "Failed",
            message: "All items cleared unsuccessful",
        })
    }
})