import config from "./config.js";
import axios from "axios";
import { fileDelete } from "./fileDelete.js";
import { delay } from "./delay.js";
import { publishMessage } from "./queue/publishMessage.js";


export async function removingStoppedMOvies(){
  console.log('🔍started to removing the stopped movies')
                     await publishMessage({
  message: '🔍started to removing the stopped movies'
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
    const queueId=[]
    for (const value of responce.data.records){
      if(value.status == 'paused'){
        queueId.push(value.id)
        console.log(value.title);
                          await publishMessage({
  message: value.title
});
      }
    }

 if(!queueId.length){
console.log('✅ no movies are paused to remove')

                   await publishMessage({
  message: '✅ no movies are paused to remove'
});
return;
 }

 console.log('🗑️ deleteing the paused moovies');
 await delay(1000,true)

   const removeFromClient=true;
  const blocklist=true;
  const skipRedownload=false;

await fileDelete(queueId, removeFromClient, blocklist, skipRedownload);

    
}