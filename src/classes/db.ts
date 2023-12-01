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
        console.log(res.rows[0].message)
        const checkDB = await pool.query("SELECT DB_VERSION FROM system;").catch(()=>{
            return {rows:["0"]};
        });
    if(parseInt(checkDB.rows[0]) === parseInt(process.env.DB_VERSION as string)){
        winston.info("Luna database exists and is correct/expected version.");
    }else{
        winston.warn("Luna database out of date or unexpected version. Dropping and recreating tables...");
        // TODO: Drop database, and recreate with updated tables. Current version should be obtained from process.env.DB_VERSION
    }
    const init = await pool.query("CREATE DATABASE luna;").catch((err:string) => {
        if(err){
            return true;
        }
    }).finally(() => {
        winston.info("Created Luna database for first time. Creating tables...")
    });
    winston.info(init === true ? "Luna database exists - Skipping creation." : "Luna database does not exist. Creating...");

    } catch (err) {
        console.error(err);
    }
    
}