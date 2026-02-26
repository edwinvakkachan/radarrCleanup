import config from "./config.js";
import axios from "axios";
import { sendTelegramMessage } from "./telegramMessage.js";
import { fileDelete } from "./fileDelete.js";



export async function removeMoviesAlreadyDeleted(){
     console.log("🔍 Removing movies that are removed from import list");
     await sendTelegramMessage("🔍 Removing movies that are removed from import list")

    const responce =  await axios.get(`${config.ip}/api/v3/queue`,{
         headers: {
        "X-Api-Key": config.api
      },
      params: {
        page: 1,
        pageSize: 500,
        sortDirection: "default",
        includeUnknownMovieItems: true,
        includeMovie: true,
        protocol: "torrent",
      }
    })
   const queueId = [];
    for (const value of responce.data.records){

// movies to ignore 

      if(!value.movieId){
        console.log(value.title)
        if (/malayalam|mal|hindi|hin|tamil|tam/i.test(value.title.toLowerCase())) {
    console.log("🚨 Please remove Manualy ", value.title);
    await sendTelegramMessage("🚨 Please remove Manualy")
    await sendTelegramMessage(value.title)
    continue;
}   
queueId.push(value.id)
console.log(`🗑️ ${value.title}`);
await sendTelegramMessage(`🗑️ ${value.title}`)

      }

    }

      if (!queueId.length) {
    console.log("✅ No movies to remove (Unknown language)");
    await sendTelegramMessage('✅ No movies to remove (Unknown language)')
    return;
  }


  const removeFromClient=true;
  const blocklist=false;
  const skipRedownload=true;

await fileDelete(queueId, removeFromClient, blocklist, skipRedownload);


}