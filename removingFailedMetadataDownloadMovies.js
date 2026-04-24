import config from "./config.js";
import axios from "axios";
import { fileDelete } from "./fileDelete.js";
import { delay } from "./delay.js";
import { publishMessage } from "./queue/publishMessage.js";


import { qb } from "./login.js";

async function qbitmetadatainfoSearch(downloadId){
const {data} = await qb.get('/api/v2/torrents/info',{
    params: { hashes: downloadId.toLowerCase() }
  });
  for (const value of data){
    if(value.downloaded==0 && value.has_metadata==false && value.time_active >= 600 && value.availability==0){
      return {
        time:value.time_active,
        value:true
      }
    }
  }
return {
        time:0,
        value:false
      };

}
export async function removingFailedMetadataDownloadMovies(){
  console.log("🔍 Removing metadata failed to dwonload movies");

      await publishMessage({
  message: "🔍 Removing metadata failed to download movies"
});
  const {data} = await axios.get(`${config.ip}/api/v3/queue`,{
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
console.log('it will take upto 2 minute');
for (const value of data.records){
  await delay(300,true)
  if(!value.downloadId){
    console.log(`Torrent hash not found ${value.title}`)
    continue;
  }
  const result = await qbitmetadatainfoSearch(value.downloadId)
 if(result.value){


if (/malayalam|mal|hindi|hin|tamil|tam/i.test(value.title.toLowerCase()) && result.time>=1800){
  console.log(`☢️ Found files with failed metadata downloaded — please remove manually: ${value.title} `)
  continue;
 }

    console.log('☢️ Found files with failed metadata downloaded 📥: ',value.title)
       await publishMessage({
  message: value.title
});

   queueId.push(value.id);
   continue;
 }
}
if(!queueId.length){
  console.log('No files found with zero metadata 📂')
      await publishMessage({
  message: 'No files found with zero metadata 📂'
});
  return;
}


  const removeFromClient=true;
  const blocklist=true;
  const skipRedownload=false;

await fileDelete(queueId, removeFromClient, blocklist, skipRedownload);




}
