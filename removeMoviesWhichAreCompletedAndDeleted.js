import config from "./config.js";
import axios from "axios";
import { sendTelegramMessage } from "./telegramMessage.js";
import { fileDelete } from "./fileDelete.js";



export async function removeMoviesWhichAreCompletedAndDeleted(){

  console.log("🔍 Removing completed movies with title mismatch");
  await sendTelegramMessage("🔍 Removing completed movies with title mismatch");
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

const queueId=[];

try {
 
  for (const value of responce.data.records){ 

  if(value?.statusMessages?.[0]?.messages?.[0] == 'Movie title mismatch, automatic import is not possible. Manual Import required.') {
       if (/malayalam|mal/i.test(value.title.toLowerCase())) {
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
    console.log("✅ No completed movies to remove");
    await sendTelegramMessage('✅ No completed movies to remove')
    return;
  }

} catch (error) {
  console.error(error)
}

  const removeFromClient=true;
  const blocklist=false;
  const skipRedownload=true;

await fileDelete(queueId, removeFromClient, blocklist, skipRedownload);



}
