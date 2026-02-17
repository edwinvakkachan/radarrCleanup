import config from "./config.js";
import axios from "axios";
import { sendTelegramMessage } from "./telegramMessage.js";
import { fileDelete } from "./fileDelete.js";


import { qb } from "./login.js";


 async function qbitorrentFileInfo(downloadId){
  const {data} = await qb.get('/api/v2/torrents/info',{
    params: { hashes: downloadId.toLowerCase() }
  });
 
     for (const value of data){
        if(value.time_active>=config.qbitTime){
        console.log(`✅ YES atcive time: ${Math.round(value.time_active/3600)}hrs` )
        return true
      }
      else {
        console.log(`❌ NO atcive time: ${Math.round(value.time_active/3600)}hrs`)
        return false
      } 
     }
}
export async function removingStalledMovies(){
   console.log('🔍started to removing the delayed movies')
   await sendTelegramMessage('🔍started to removing the delayed movies')
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
    for (const value of responce.data.records){
      if(value.status=='warning' && value.errorMessage=='The download is stalled with no connections'){
       console.log('⚠️ ',value.title)
        if(await qbitorrentFileInfo(value.downloadId)){
          console.log('☑️ stalled movie found');
          await delay(3000)
          await sendTelegramMessage('☑️ stalled ',value.title)
          console.log(value.title)
          await sendTelegramMessage(value.title)
          queueId.push(value.id);
        }
      }
    }
    if(!queueId.length){
      console.log('☑️ No stalled movie found')
      await sendTelegramMessage('☑️ No stalled movie found')
      return
    }

    console.log('🗑️ deleteing the stalled movies');
 await delay(1000)

  const removeFromClient=true;
  const blocklist=true;
  const skipRedownload=false;

await fileDelete(queueId, removeFromClient, blocklist, skipRedownload);


}