import dotenv from 'dotenv';
dotenv.config();


const config ={
    api : process.env.API,
ip : process.env.IP,
 BOT_TOKEN : process.env.TG_BOT_TOKEN,
 CHAT_ID : process.env.TG_CHAT_ID,
 qbitTime : process.env.QBIT_TIME,
 qbitIp : process.env.QBITIP,
 qbitUserName: process.env.QBITUSER,
 qbitPassword : process.env.QBITPASS,
 homeassistantWebHook : process.env.HOMEASSISTANTWEBHOOK,
}

export default config;