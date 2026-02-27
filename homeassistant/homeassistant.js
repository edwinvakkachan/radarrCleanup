import config from "../config.js";
import axios from "axios";



const HA_WEBHOOK_URL = process.env.HOMEASSISTANTWEBHOOK; 


export async function triggerHomeAssistantWebhook(payload = {}) {
  if (!HA_WEBHOOK_URL) {
    throw new Error("HA_WEBHOOK_URL not set");
  }

  try {
    const response = await axios.post(
      HA_WEBHOOK_URL,
      payload,
      {
        headers: { "Content-Type": "application/json" },
        timeout: 5000,
      }
    );

    console.log("✅ Home Assistant webhook triggered:", response.status);
    return response.data;

  } catch (error) {
    console.error("❌ Failed to trigger Home Assistant webhook:", error.message);
    throw error;   // REQUIRED
  }
}




