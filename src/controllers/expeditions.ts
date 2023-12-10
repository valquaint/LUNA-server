import cors from 'cors';
import { Router, json, urlencoded } from 'express';
import winston from 'winston';
import { pool as db } from '../classes/db';
import { ValidatedRequest, isAuthorized } from './auth';

const corsOpts = {
    origin: "*"
}

export const router = Router();
router.use(cors(corsOpts));
router.use(urlencoded({ extended: true }));
router.use(json());

router.post("/expeditions", isAuthorized, async (req: ValidatedRequest, res) => {
    if (req.validated) {
        const expeditions = await db.query("SELECT * FROM expeditions");
        res.status(200).json({ result: "PASS", msg:expeditions.rows })
    }else{
        res.status(403).json({ result: "FAIL", msg:"Not Authorized" })
    }
})