import config from "./config.js";
import axios from "axios";
import { fileDelete } from "./fileDelete.js";
import { delay } from "./delay.js";
import { publishMessage } from "./queue/publishMessage.js";


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
   console.log('🔍started to removing the stalled movies')
  
         await publishMessage({
  message:'🔍started to removing the stalled movies' 
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
    for (const value of responce.data.records){
      if(value.status=='warning' && value.errorMessage=='The download is stalled with no connections'){
      //  console.log('⚠️ stalled movie',value.title)
        if(await qbitorrentFileInfo(value.downloadId)){
          
          await delay(3000,true)
         
if (/malayalam|mal|hindi|hin|tamil|tam/i.test(value.title.toLowerCase())){
  console.log(`☢️  stalled movie, please remove manually ${value.title} `)
  continue;
 }

                    await publishMessage({
  message: '☑️ stalled movie found: '
});
                   await publishMessage({
  message: value.title
});

 console.log('☑️ stalled movie found: ',value.title);
 
          queueId.push(value.id);
        }
      }
    }
    if(!queueId.length){
      console.log('☑️ No stalled movie found')
               await publishMessage({
  message: '☑️ No stalled movie found'
});
      return
    }

    console.log('🗑️ deleteing the stalled movies');
 await delay(1000,true)

  const removeFromClient=true;
  const blocklist=true;
  const skipRedownload=false;

await fileDelete(queueId, removeFromClient, blocklist, skipRedownload);


}