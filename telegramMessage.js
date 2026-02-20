import axios from 'axios';
import config from "./config.js";
import { delay } from './delay.js';


export async function sendTelegramMessage(text) {
  const url = `https://api.telegram.org/bot${config.BOT_TOKEN}/sendMessage`;
  await axios.post(url, {
    chat_id: config.CHAT_ID,
    text: text
  });
  await delay(2000,true);
}