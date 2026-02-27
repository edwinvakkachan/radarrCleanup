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
    if(value.downloaded==0 && value.has_metadata==false && value.time_active >= 1200 && value.availability==0){
      return true
    }
  }
return false;

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
 if(await qbitmetadatainfoSearch(value.downloadId)){
   console.log('found: ',value.title)
       await publishMessage({
  message: value.title
});
   queueId.push(value.id);
   continue;
 }
}
if(!queueId.length){
  console.log('No file found with zero metadata')
      await publishMessage({
  message: 'No file found with zero metadata'
});
  return;
}


  const removeFromClient=true;
  const blocklist=true;
  const skipRedownload=false;

await fileDelete(queueId, removeFromClient, blocklist, skipRedownload);




}
