
import  config  from './config.js';
import { delay } from './utils/delay.js';
import { removeMoviesAlreadyDeleted } from './jobs/removeMoviesAlreadyDeleted.js';
import { removeMoviesWhichAreCompletedAndDeleted } from './jobs/removeMoviesWhichAreCompletedAndDeleted.js';
import { removingStoppedMOvies } from './jobs/removingStoppedMovies.js';
import { login } from './login.js';
import { removingStalledMovies } from './jobs/removingStalledMovies.js';
import { removingFailedMetadataDownloadMovies } from './jobs/removingFailedMetadataDownloadMovies.js';
import { triggerHomeAssistantWebhook } from './services/homeassistant/homeassistant.js';
import { retry } from './services/homeassistant/retryWrapper.js';
import { publishMessage } from './services/message/publishMessage.js';
import { log } from './utils/timelog.js';
import { runCleanup } from './jobs/radarrCleanupfromtrakt.js';

if (!config.api || !config.ip) {
  console.error("❌ Missing API or IP environment variables");
  process.exit(1);
}


async function main() {
  try {
await log()
    console.log("🚀 Radarr cleanup started");
    await publishMessage({
  message: "🚀 Radarr cleanup started"
});
    await login();
    await delay(2000)
    await runCleanup();
    await removingStoppedMOvies();
    await delay(2000)
    await removingFailedMetadataDownloadMovies();
    await delay(2000)
    await removingStalledMovies()
    await delay(2000)
    // await removeMoviesAlreadyDeleted();
    // await delay(2000)
    // await removeMoviesWhichAreCompletedAndDeleted();

    
  
    console.log("🏁 Radarr Cleanup completed successfully");
  
       await publishMessage({
  message: "🏁 Radarr Cleanup completed successfully"
});
await log();
    process.exit(0); // ✅ clean exit
  } catch (err) {
    console.error("❌ Radarr Cleanup error :", err.message);
      await publishMessage({
  message: "❌ Radarr Cleanup error triggering webhook:"
});

      await retry(
  triggerHomeAssistantWebhook,
  { status: "success" },
  "homeassistant-success",
  5
);
    process.exit(1); // ❌ failure exit
  }
}

main();

