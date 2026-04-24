import config from "../config.js";
import axios from "axios";
import { fileDelete } from "./fileDelete.js"; 
import { publishMessage } from "../services/message/publishMessage.js";



export async function removeMoviesWhichAreCompletedAndDeleted(){

  console.log("🔍Removing movies with title mismatch (file not imported)");
     await publishMessage({
  message: "🔍 Removing movies with title mismatch (file not imported)"
});

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
       if (/malayalam|mal|hindi|hin|tam|tamil/i.test(value.title.toLowerCase())) {
    console.log("🚨 Please remove Manualy ", value.title);
        await publishMessage({
  message: "🚨 Please remove Manualy"
});
    await publishMessage({
  message: value.title
});
    
    
    continue;
}   
    queueId.push(value.id)
       console.log(`🗑️ ${value.title}`);
           await publishMessage({
  message: `🗑️ ${value.title}`
});
       
  }
}

  if (!queueId.length) {
    console.log("✅ No rejected files found (movie title mismatch).");
    
              await publishMessage({
  message: '✅ No rejected files found (movie title mismatch).'
});
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
