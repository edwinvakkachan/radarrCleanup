import config from "../config.js";
import axios from "axios";
import { fileDelete } from "./fileDelete.js";
import { delay } from "../utils/delay.js";
import { publishMessage } from "../services/message/publishMessage.js";


import { qb } from "../login.js";


 async function qbitorrentFileInfo(downloadId){

  const {data} = await qb.get('/api/v2/torrents/info',{
    params: { hashes: downloadId.toLowerCase() }
  });
 
let movies ={};

     for (const value of data){

          movies ={
          name:value.name,
          state:value.state,
          progress:value.progress,
          availability:value.availability,
          seeders:value.num_seeds,
          dlspeed:value.dlspeed
         }

console.log(movies);
// finding the dead torrents 
        if(value.time_active>=1800 
          && value.state=='stalledDL' 
          && value.progress<0.1
          && value.availability === 0
          && value.num_seeds === 0 
          && value.dlspeed === 0
         ){
        console.log(`✅ Found dead torrent` )
        return {
          value:true,
          time:value.time_active
        }
      }else if(value.time_active>=config.qbitTime){
console.log(`✅ Found stalled torrent : ${Math.round(value.time_active/3600)}hrs` );
return {
          value:true,
          time:value.time_active
        }
      }
      else {
        console.log(`❌ NO atcive time: ${Math.round(value.time_active/3600)}hrs`)
        return {
          value:false,
          time:value.time_active
        }
      } 
     }
}


export async function removingStalledMovies(){
   console.log('🔍Started removing the stalled movies 🎬')
  
         await publishMessage({
  message:'🔍Started removing the stalled movies 🎬' 
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
    const resetQueue=[];
    for (const value of responce.data.records){
      if(value.status=='warning' && value.errorMessage=='The download is stalled with no connections'){
       console.log('⚠️ For movie',value.title)
       const result = await qbitorrentFileInfo(value.downloadId)
        if(result.value){
          
          await delay(3000,true)
         
if (/malayalam|mal|hindi|hin|tamil|tam/i.test(value.title.toLowerCase())){
  console.log(`☢️ Stalled movie — please remove manually: ${value.title} `)
  if(result.value<7200){
    
    continue;
  }
 }


 console.log('☑️ Stalled movie found: 🎬',value.title);
 
          queueId.push(value.id);
        }

        if(result.value==false && result.time>3600){
     
          console.log(`movie going to push to bottom \n ${value.title} \n time ${result.time/3600}`);
          resetQueue.push(value.downloadId);
        }
      }
    }

//function to move stalled move to bottom 
if(resetQueue.length>0){
  console.log(`moving stalled movie to bottom, count: ${resetQueue.length}`)
    await qb.post('/api/v2/torrents/bottomPrio', new URLSearchParams({
  hashes: resetQueue.join('|')
}))
}
  
    if(!queueId.length){
      console.log('✅ No stalled movies found 🎬')
               await publishMessage({
  message: '✅ No stalled movies found 🎬'
});
      return
    }

    console.log('🗑️ Deleting stalled movies 🎬');
 await delay(1000,true)

  const removeFromClient=true;
  const blocklist=true;
  const skipRedownload=false;

await fileDelete(queueId, removeFromClient, blocklist, skipRedownload);  
}


