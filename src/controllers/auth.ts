import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';
import cors from 'cors';
import { Router, json, urlencoded } from 'express';
import winston from 'winston';
import { pool as db } from '../classes/db';
import path from 'node:path';

const corsOpts = {
    origin: "*"
}

export const router = Router();
router.use(cors(corsOpts));
router.use(urlencoded({ extended: true }));
router.use(json());

export interface ValidatedRequest extends Express.Request {
    headers: Array<any>,
    validated?: Boolean,
    UID?: string,
    token?: string,
    refresh?: string,
    body?: any
}

function decode(token) {
    let decode;
    try {
        decode = jwt.verify(token, process.env.JWT_KEY);
    } catch (err) {
        return null;
    }finally{
        return decode ? decode : null;
    }
}

async function isValidToken(token) {
    const result = await db.query(`SELECT COUNT(*) FROM tokens WHERE token='${token}';`);
    winston.info(result?.rows[0].count)
    return result?.rows[0].count === "0";
}

export async function isAuthorized(req: ValidatedRequest, res, next) {
    const token = req.headers["x-access-token"] || null;
    const refresh = req.headers["x-refresh-token"] || null;
    if (!token || token === "" || token === null) {
        winston.info("Invalid or missing token");
        req.validated = false;
        return next();
    } else {
        try {
            const decode = jwt.verify(token, process.env.JWT_KEY);
            console.log("decode:", decode);
            if (decode && await isValidToken(token)) {
                req.UID = decode;
                if (req.UID) {
                    req.validated = true;
                    const { UID, email, colony_name, username, faction_name } = decode
                    req.token = jwt.sign(
                        { UID, email, colony_name, username, faction_name },
                        process.env.JWT_KEY,
                        { expiresIn: "10m" }
                    )
                    const now = Date.now() / 1000;
                    await db.query(`INSERT INTO tokens(token, age) VALUES('${refresh}',
                    to_timestamp(${now}));`).catch((err) => {
                        console.log(err);
                        winston.error("There was an error updating the tokens in the database...");
                    })
                    req.refresh = jwt.sign(
                        { username, email: await bcrypt.hash(decode.email, parseInt(process.env.PWD_HASH_COUNT as string)) },
                        process.env.JWT_KEY,
                        { expiresIn: "7d" }
                    )
                }
                else { req.validated = false };
            }
            else { req.validated = false };
        }
        catch (err) {
            console.log("Access token invalid or expired.");
            if (refresh && await isValidToken(refresh)) {
                try {
                    const decode = jwt.verify(refresh, process.env.JWT_KEY);
                    console.log("Decode:", decode);
                    if (decode) {
                        const username = decode.username;
                        const result = await db.query(`SELECT * FROM users JOIN factions ON users.faction_id=factions.faction_id WHERE username=$1;`, [username]);
                        req.validated = true;
                        const { id, email, colony_name, faction_name } = result.rows[0];
                        req.token = jwt.sign(
                            { UID: id, email, colony_name, username, faction_name },
                            process.env.JWT_KEY,
                            { expiresIn: "10m" }
                        )
                        const now = Date.now() / 1000;
                        await db.query(`INSERT INTO tokens(token, age) VALUES(
                            '${token}',
                            to_timestamp(${now})
                        ),
                        ('${refresh}',
                        to_timestamp(${now}));`).catch((err) => {
                            console.log(err);
                            winston.error("There was an error updating the tokens in the database...");
                        })
                        req.refresh = jwt.sign(
                            { username, email: await bcrypt.hash(decode.email, parseInt(process.env.PWD_HASH_COUNT as string)) },
                            process.env.JWT_KEY,
                            { expiresIn: "7d" }
                        )
                    }
                    else { req.validated = false };
                }
                catch (err) {
                    winston.info("Refresh token expired.")
                    req.validated = false
                };
            } else {
                winston.error("Refresh token invalid or expired.");
                req.validated = false;
            }
        } finally {

            winston.info(`Authorization block passed.
Authorization status is: ${req.validated}`);
            return next();
        }
    }
}

router.post("/authorize", isAuthorized, async (req: ValidatedRequest, res) => {
    if (req.validated) {
        const { UID, email, colony_name, faction_name, username } = decode(req.token);
        res.status(200).json({ UID, email, colony_name, username, faction_name, token: req.token, refresh: req.refresh });
        return true;
    } else {
        res.sendStatus(403);
        return false;
    }
})

router.post("/login", async (req, res) => {
    winston.info("Login has been hit.");
    winston.info(`Luna App Version in Header: ${req.headers["l-app-version"]}`)
    if (req.headers['l-app-version'] !== process.env.APP_VERSION) {
        return res.status(403).json({ result: "FAIL", msg: "Your application is out of date. Please update your application." });
    }
    const { email, password } = req.body;

    if (!(email && password)) {
        return res.status(400).send({ result: "FAIL", msg: "Both fields are required" });
    }
    const result = await db.query(`SELECT * FROM users JOIN factions ON users.faction_id=factions.faction_id WHERE email=$1;`, [email]);
    if (result?.rows.length && (await bcrypt.compare(password, result.rows[0].password))) {
        const { username, colony_name, faction_name } = result.rows[0];
        const token = jwt.sign(
            { UID: result.rows[0].id, email, colony_name, username, faction_name },
            process.env.JWT_KEY,
            { expiresIn: "10m" }
        );
        const refresh = jwt.sign(
            { username, email: await bcrypt.hash(email, parseInt(process.env.PWD_HASH_COUNT as string)) },
            process.env.JWT_KEY,
            { expiresIn: "7d" }
        )
        return res.status(200).json({ email: email, username: username, colony_name: colony_name, faction_name: faction_name, token: token, refresh: refresh });
    }
    winston.info("Fail: Invalid login.");
    return res.status(400).json({ result: "FAIL", msg: "Invalid username/password combination." });
});

router.post("/register", async (req, res) => {
    const { username, email, password, colony_name, faction_id } = req.body;

    if (!(username && email && password && colony_name && faction_id)) {
        return res.status(400).json({ result: "FAIL", msg: "Missing all required input fields." });
    }
    let find = await db.query(`SELECT COUNT(*) FROM users WHERE email = '${email}';`);
    console.log("Matching Users:", find.rows[0].count)
    if (find.rows[0].count === "1") {
        winston.info("User exists in database");
        return res.status(409).json({ result: "FAIL", msg: "A user exists with that email. Please register with a different email address" });
    } else {
        winston.info("User provided unique email. Creating entry in database.");
        const hashedPassword = await bcrypt.hash(password, parseInt(process.env.PWD_HASH_COUNT as string));
        const result = await db.query(`INSERT INTO users(
            username,
            email,
            colony_name,
            password,
            faction_id
        ) VALUES(
            $1,
            $2,
            $3,
            '${hashedPassword}',
            ${faction_id}
        );`, [username, email, colony_name]);
        const newUser = await db.query(`SELECT * FROM users JOIN factions ON users.faction_id=factions.faction_id WHERE email=$1;`, [email]);
        const { id, faction_name } = newUser.rows[0];
        const token = jwt.sign(
            { UID: id, email, colony_name, username, faction_name },
            process.env.JWT_KEY,
            { expiresIn: "10m" }
        );
        const refresh = jwt.sign(
            { username, email: await bcrypt.hash(email, parseInt(process.env.PWD_HASH_COUNT as string)) },
            process.env.JWT_KEY,
            { expiresIn: "7d" }
        )
        if (result?.rowCount === 1) {
            winston.info("User registered in database.");
        } else {
            return res.status(409).json({ result: "FAIL", msg: "There was an error creating your user. Please contact an administrator. CODE: PG-CRU-01" })
        }
        return res.status(200).json({ result: "PASS", msg: "User created successfully. You may now log in.", token, refresh });
    }
});

router.post("/user", isAuthorized, async (req: ValidatedRequest, res) => {
    if (req.validated) {
        const { UID } = decode(req.headers["x-access-token"]) ? decode(req.headers["x-access-token"]) : decode(req.headers["x-refresh-token"])
        const user = await db.query(`SELECT * FROM users JOIN factions ON users.faction_id=factions.faction_id WHERE id=${UID};`);
        const structures = await db.query(`SELECT * FROM shop JOIN structures ON shop.id=structures.structure_id WHERE owner=$1;`, [UID]);
        const gain = {
            power: 0,
            water: 0,
            population: 0
        }
        const cost = {
            power: 0,
            water: 0
        }
        if (structures.rows.length) {
            
            for (const structure of structures.rows) {
                winston.info(`Structure found:`);
                console.log(structure);
                cost.power += parseInt(structure.power);
                cost.water += parseInt(structure.water);
                switch (structure.type) {
                    case "1":
                    case 1:
                        gain.power += parseInt(structure.gain);
                        break;
                    case "2":
                    case 2:
                        gain.water += parseInt(structure.gain);
                        break;
                    case "3":
                    case 3:
                        gain.population += parseInt(structure.gain);
                        break;
                }
            }
        }
            console.log(user.rows[0])
            const { username, colony_name, faction_name, faction_resource, ucr, currency } = user.rows[0];
            res.status(200).json({ username: username, colony_name: colony_name, faction_name: faction_name, faction_resource, ucr, currency, superuser: (user.rows[0].id < 1000),cost, ...gain })
        }
    })

router.post("/factions", isAuthorized, async (req: ValidatedRequest, res) => {
    if (req.validated && req.body.faction_id) {
        const fac_users = await db.query(`SELECT faction_resource, currency FROM users WHERE faction_id=${req.body.faction_id};`)
        res.status(200).json({ result: "PASS", msg: fac_users.rows })
    }else if(req.validated) {
        const fac_users = await db.query(`SELECT faction_resource, currency, faction_id FROM users;`)
        res.status(200).json({ result: "PASS", msg: fac_users.rows })
    } else {
        const factions = await db.query(`SELECT * FROM factions;`);
        const fac_users = await db.query(`SELECT factions.faction_name, COUNT(*) as count from users JOIN factions on users.faction_id=factions.faction_id GROUP BY faction_name;`)
        res.status(200).json({ result: "FAIL", msg: { factions: factions.rows, users: fac_users.rows } })
    }
})

router.post("/shop", isAuthorized, async (req: ValidatedRequest, res) => {
    if (req.validated) {
        const shop = await db.query(`SELECT * FROM shop WHERE faction_id=${req.body.faction_id};`)
        res.status(200).json({ result: "PASS", msg: shop.rows })
    } else {
        res.status(403).json({ result: "FAIL", msg: "Not Authorized" })
    }
})

router.post("/buy", isAuthorized, async (req: ValidatedRequest, res) => {
    if (req.validated) {
        const { UID } = decode(req.headers["x-access-token"]) ? decode(req.headers["x-access-token"]) : decode(req.headers["x-refresh-token"])
        const buy = await db.query(`SELECT * FROM shop WHERE id=${req.body.product};`);
        const user = await db.query(`SELECT * FROM users WHERE id=${UID};`);
        if (buy?.rows.length) {
            console.log(buy.rows[0]);
            if (buy.rows[0].ucr <= user.rows[0].ucr) {
                const newUCR = parseInt(user.rows[0].ucr) - parseInt(buy.rows[0].ucr);
                await db.query(`INSERT INTO structures (owner, structure_id, level) VALUES (${UID}, ${buy.rows[0].id}, 1);`);
                const purchased = await db.query(`UPDATE users SET ucr=${newUCR} WHERE id=${UID};`);
                console.log(purchased);
                return res.status(200).json({ result: "PASS", msg: "Success" })
            } else {
                return res.status(200).json({ result: "FAIL", msg: "Failed - Not Enough UCR" })
            }
        } else {
            return res.status(200).json({ result: "FAIL", msg: "Failed - Product missing from database." })
        }
    } else {
        return res.status(403).json({ result: "FAIL", msg: "Not Authorized" })
    }
})

router.get("/datastore", async (req, res) => {
    const factions = await db.query(`SELECT * FROM factions;`);
    res.status(200).json(factions.rows);
})

router.get("/update", isAuthorized, (req, res) => {
    console.log(path.resolve(__dirname, "../app-debug.apk"))
    res.download(path.resolve(__dirname, "../app-debug.apk"))
})