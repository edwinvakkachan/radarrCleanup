import config from "./config.js";
import axios from "axios";
import { sendTelegramMessage } from "./telegramMessage.js";


export async function triggerHAWebhook(errorMessage) {
  try {
    await axios.post(
      `${config.homeassistantWebHook}`,
      {
        headers: {
          "Content-Type": "application/json"
        },
        timeout: 5000
      }
    );

    console.log("🏠 Home Assistant webhook triggered");
    await sendTelegramMessage("🏠 Home Assistant webhook triggered")
  } catch (err) {
    console.error("⚠️ Failed to trigger HA webhook:", err.message);
    await sendTelegramMessage("⚠️ Failed to trigger HA webhook")
  }
}
