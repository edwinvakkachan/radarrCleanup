
import  config  from './config.js';
import  {sendTelegramMessage}  from './telegramMessage.js';
import { delay } from './delay.js';
import { removeMoviesAlreadyDeleted } from './removeMoviesAlreadyDeleted.js';
import { removeMoviesWhichAreCompletedAndDeleted } from './removeMoviesWhichAreCompletedAndDeleted.js';
import { removingStoppedMOvies } from './removingStoppedMovies.js';
import { login } from './login.js';
import { removingStalledMovies } from './removingStalledMovies.js';
import { removingFailedMetadataDownloadMovies } from './removingFailedMetadataDownloadMovies.js';
import { triggerHAWebhook } from './homeassistant.js';

if (!config.api || !config.ip) {
  console.error("❌ Missing API or IP environment variables");
  process.exit(1);
}


async function main() {
  try {
    console.log("🚀 Radarr cleanup started");
    await sendTelegramMessage("🚀 Radarr cleanup started")

    await login();
    // await removeMoviesAlreadyDeleted();
    // await delay(10000)
    // await removeMoviesWhichAreCompletedAndDeleted();
    // await delay(10000)
    // await removingStoppedMOvies();
    // await delay(10000)
    await removingStalledMovies()
    await delay(10000)
    await removingFailedMetadataDownloadMovies();

    
  
    console.log("🏁 Radarr Cleanup completed successfully");
   await sendTelegramMessage("🏁 Radarr Cleanup completed successfully")
    process.exit(0); // ✅ clean exit
  } catch (err) {
    console.error("❌ Radarr Cleanup error :", err.message);
   await sendTelegramMessage("❌ Radarr Cleanup error triggering webhook:")
   await sendTelegramMessage(err.message)
   await triggerHAWebhook('worked')
    process.exit(1); // ❌ failure exit
  }
}

main();

