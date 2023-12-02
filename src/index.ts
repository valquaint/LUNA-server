require('dotenv').config();
import winston from 'winston';
import express from 'express';
import cors from 'cors';
import {init, pool as db} from './classes/db';
import { router } from './controllers/auth';

// TODO: Expand logger to include capacity for file called from, and additional levels of logging
const mainTransport = new winston.transports.Console({
    format: winston.format.combine(
        winston.format.colorize({
            level: true,
            colors: {
                info: "blue",
                debug: "orange",
                error: "red"
            }
        }),
        winston.format.splat(),
        winston.format.simple()
    )
})
winston.add(mainTransport);


const app = express();

const findPort = process.env.PORT || 27748;

const corsOpts = {
    origin: "*"
}

app.use(cors(corsOpts));
app.use(router);

app.get("/ping", (req:Express.Request, res:Express.Response) => {
    winston.info("Ping!")
    // TODO: Extend Express.Response eventually
    //@ts-expect-error Express default response needs to be extended, otherwise we get an error
    res.status(200).json({response:"pong"})
})

app.listen(findPort, async () => {
    winston.info(`LUNA Backend is live at http://localhost:${findPort}`);
    await init();
});