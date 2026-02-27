
import  config  from './config.js';
import { delay } from './delay.js';
import { removeMoviesAlreadyDeleted } from './removeMoviesAlreadyDeleted.js';
import { removeMoviesWhichAreCompletedAndDeleted } from './removeMoviesWhichAreCompletedAndDeleted.js';
import { removingStoppedMOvies } from './removingStoppedMovies.js';
import { login } from './login.js';
import { removingStalledMovies } from './removingStalledMovies.js';
import { removingFailedMetadataDownloadMovies } from './removingFailedMetadataDownloadMovies.js';
import { triggerHomeAssistantWebhook } from './homeassistant/homeassistant.js';
import { retry } from './homeassistant/retryWrapper.js';
import { publishMessage } from './queue/publishMessage.js';


if (!config.api || !config.ip) {
  console.error("❌ Missing API or IP environment variables");
  process.exit(1);
}


async function main() {
  try {
    console.log('🍋‍🟩🍋‍🟩🍋‍🟩🍋‍🟩🍋‍🟩🍋‍🟩🍋‍🟩🍋‍🟩🍋‍🟩');
        await publishMessage({
  message: '🍋‍🟩🍋‍🟩🍋‍🟩🍋‍🟩🍋‍🟩🍋‍🟩🍋‍🟩🍋‍🟩🍋‍🟩'
});
    console.log("🚀 Radarr cleanup started");
    await publishMessage({
  message: "🚀 Radarr cleanup started"
});
    await login();
    await removingStoppedMOvies();
    await delay(10000)
    await removingFailedMetadataDownloadMovies();
    await delay(10000)
    await removingStalledMovies()
    await delay(10000)
    await removeMoviesAlreadyDeleted();
    await delay(10000)
    await removeMoviesWhichAreCompletedAndDeleted();

    
  
    console.log("🏁 Radarr Cleanup completed successfully");
  
       await publishMessage({
  message: "🏁 Radarr Cleanup completed successfully"
});
   console.log('🍋‍🟩🍋‍🟩🍋‍🟩🍋‍🟩🍋‍🟩🍋‍🟩🍋‍🟩🍋‍🟩🍋‍🟩');

      await publishMessage({
  message: '🍋‍🟩🍋‍🟩🍋‍🟩🍋‍🟩🍋‍🟩🍋‍🟩🍋‍🟩🍋‍🟩🍋‍🟩'
});
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

