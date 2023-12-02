import pg from 'pg';
import winston from 'winston';

export const pool = new pg.Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT as string)
})
export async function init() {
    try {
        const res = await pool.query('SELECT $1::text as message', ['Connected to PostgreSQL'])
        winston.info(res.rows[0].message)
        const checkDB = await pool.query("SELECT db_version FROM system;").catch((err) => {
            winston.error("There was an error receiving the version...")
            winston.error(err);
            return { rows: ["0"] };
        });
        if (parseInt(checkDB.rows[0].db_version) === parseInt(process.env.DB_VERSION as string)) {
            winston.info("Luna database exists and is correct/expected version.");
        } else {
            winston.info(`Luna Database is out of date or unexpected version. Database version is ${parseInt(checkDB.rows[0].db_version)} (directly received ${checkDB.rows[0].db_version}). Expected version ${parseInt(process.env.DB_VERSION as string)}`);
            const dropTables = await pool.query(`SELECT * FROM pg_catalog.pg_tables WHERE schemaname != 'pg_catalog' AND schemaname != 'information_schema';`);
            if (dropTables.rows.length > 0) {
                const dropQuery = `DROP TABLE${dropTables.rows.map((table) => ` ${table.tablename}`)}`;
                await pool.query(`${dropQuery.substring(0, dropQuery.length)};`).catch(winston.error);
            }
            winston.info("Tables dropped. Creating new tables...");
            const tables = {
                system: await pool.query(`CREATE TABLE system (
                    "db_version" int,
                    "app_version" varchar(16)
                    );`).then(async () => {
                    return await pool.query(`INSERT INTO system VALUES 
                    (${process.env.DB_VERSION}, '${process.env.APP_VERSION}');`)
                        .catch((err) => {
                            winston.error(err);
                            return "FAIL"
                        }).then(() => {
                            winston.info("System Table Created");
                            return "PASS";
                        }, () => {
                            winston.info("System Table Failed to Create");
                            return "FAIL";
                        })
                }),
                users: await pool.query(`
                CREATE TABLE users (
                    "id" serial,
                    "username" varchar(16) unique not null,
                    "email" varchar(90) unique not null,
                    "colony_name" varchar(16) unique not null,
                    "password" varchar(72) not null,
                    "faction_id" int,
                    PRIMARY KEY ("id")
                    );`).then(() => {
                    winston.info("Users Table Created");
                    return "PASS";
                }, () => {
                    winston.info("Users Table Failed to Create");
                    return "FAIL";
                }),
                factions: await pool.query(`
                CREATE TABLE factions (
                    "faction_id" serial,
                    "faction_name" varchar(45) unique not null,
                    PRIMARY KEY ("faction_id")
                    );`).then(async() => {
                        return await pool.query(`INSERT INTO factions(faction_name) VALUES('Defiance'), ('Enlightened'), ('Aristocrats');`)
                        .catch((err) => {
                            winston.error(err);
                            return "FAIL"
                        }).then(() => {
                            winston.info("Factions Table Created");
                            return "PASS";
                        }, () => {
                            winston.info("Factions Table Failed to Create");
                            return "FAIL";
                        })
                }),
                structures: await pool.query(`
                CREATE TABLE structures (
                    "id" int,
                    "owner" int not null,
                    "type" int not null,
                    "level" int not null,
                    "productivity" int not null,
                    PRIMARY KEY ("id")
                    );`).then(() => {
                    winston.info("Structures Table Created");
                    return "PASS";
                }, () => {
                    winston.info("Structures Table Failed to Create");
                    return "FAIL";
                }),
                tokens: await pool.query(`
                CREATE TABLE tokens (
                    "token" text unique,
                    "age" timestamp
                );`).then(() => {
                    winston.info("Tokens Table Created");
                    return "PASS";
                }, () => {
                    winston.info("Tokens Table Failed to Create");
                    return "FAIL";
                })
            }
            winston.info("Created Luna tables for first time:")
            console.table(tables);
        }
    } catch (err) {
        console.error(err);
    }

}
