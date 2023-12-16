import schedule from 'node-schedule';
import { pool as db } from '../classes/db';
import winston from 'winston';

const rules = { 
    everyMinute:new schedule.RecurrenceRule(),
    everyFiveMinutes:new schedule.RecurrenceRule(),
     everyHour: new schedule.RecurrenceRule(),
     };
     
rules.everyMinute.second = 0;

rules.everyFiveMinutes.second = 0;
rules.everyFiveMinutes.minute = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

rules.everyHour.minute = 0;

const upkeepJob = {job:null}

const warJob = {job:null}

async function upkeep(){
    try{
        winston.info("Gathering users...");
        const users = await db.query(`SELECT id FROM users;`);
        if(users.rows.length){
            winston.info(`Found ${users.rows.length} users.`)
            for(const user of users.rows){
                try{
                    const structures = await db.query(`SELECT * FROM shop JOIN structures ON shop.id=structures.structure_id WHERE owner=$1;`, [user.id]);
                    if(structures.rows.length){
                        const gain = {
                            power: 0,
                            water: 0,
                            population: 0,
                            ucr: 0,
                            res : 0
                        }
                        for(const structure of structures.rows){
                            winston.info(`Structure found:`);
                            console.log(structure);
                            switch(structure.type){
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
                                case "4":
                                case 4:
                                    gain.ucr += parseInt(structure.gain);
                                break;
                                case "5":
                                case 5:
                                    gain.res += parseInt(structure.gain);
                                break;
                                default:
                                    winston.warn(`Unsupported structure type: ${structure.type} from structure: ${structure.name}.`)
                                break;
                            }
                        }
                        winston.info(`Calculating gains for user ID ${user.id}:`);
                        console.log(gain);
                    }
                }catch(err){
                    console.log(err);
                    winston.error("There was an error in the scheduler - SELECT STRUCTURES. Please see above.");
                }
            }
        }
    }catch(err){
        console.log(err);
        winston.error("There was an error in the scheduler - SELECT USERS. Please see above.");
    }
}
async function war_2v1(commander, faction_a, factionb){

}

async function war_ffa(...factions){
    const points: any[] = [];
    for(const faction of factions){
        points.push({name: faction.faction_name, points: (faction.currency + faction.resources)});
    }
    points.sort( (a, b) => {
        if( a.points > b.points) return 1
        else return  -1
      });
    console.log(`${points[0].name} has won the war!`)
}

async function war () {
    const factions = await db.query(`SELECT currency, resources, victor, faction_name  FROM factions ORDER BY victor;`)
    if(factions.rows?.length){
        console.log(factions.rows[0].victor);
        if(factions.rows[0].victor==="true"){
            await war_2v1(factions.rows[0], factions.rows[1], factions.rows[2]);
        }else{
            await war_ffa(...factions.rows);
        }
    }

}

export default function Scheduler(){
    upkeepJob.job = schedule.scheduleJob(rules.everyHour, async function(){
        console.log('Upkeep Schedule Fired.');
        await upkeep();
    });

    warJob.job = schedule.scheduleJob(rules.everyFiveMinutes, async function() {
        console.log('War Schedule Fired');
        await war();
    })
}