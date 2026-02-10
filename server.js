import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';
import { wrapper } from "axios-cookiejar-support";
import { CookieJar } from "tough-cookie";




const api = process.env.API;
const ip = process.env.IP;
const BOT_TOKEN = process.env.TG_BOT_TOKEN;
const CHAT_ID = process.env.TG_CHAT_ID;
const qbitTime = process.env.QBIT_TIME;
const qbitIp = process.env.QBITIP;
const qbitUserName= process.env.QBITUSER;
const qbitPassword = process.env.QBITPASS;


//qbit login
const jar = new CookieJar();
const qb = wrapper(axios.create({
  baseURL: qbitIp, // qBittorrent Web UI
  jar,
  withCredentials: true
}));

if (!api || !ip) {
  console.error("❌ Missing API or IP environment variables");
  process.exit(1);
}
//telgram bot message
async function sendTelegramMessage(text) {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  await axios.post(url, {
    chat_id: CHAT_ID,
    text: text
  });
}

//delay function 

async function delay(ms,noLog) {
  if(noLog){
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  else{
console.log(`Waiting...${ms} sec`);
  return new Promise(resolve => setTimeout(resolve, ms));
  }
   
}
// function to delete files
async function fileDelete(queueId){
   await axios.delete(`${ip}/api/v3/queue/bulk`,{
    headers: {
        "X-Api-Key": api
      },
      params:{
        removeFromClient:true,
        blocklist:true,
        skipRedownload:false,
        changeCategory:false
      },
      data:{
        ids:queueId,
      }
})
console.log(`✅ Removed ${queueId.length} movies`);
}
// removing movies that are removed from importlist
async function removedMoviesDelete(){
     console.log("🔍 Removing movies that are removed from import list");

    const responce =  await axios.get(`${ip}/api/v3/queue`,{
         headers: {
        "X-Api-Key": api
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

        for (const value2 of value.languages){
            if(value2.name=='Unknown'){
                queueId.push(value.id)
                console.log(`🗑️ ${value.title}`);
               await sendTelegramMessage(`🗑️ ${value.title}`)
            }
        }
    }

      if (!queueId.length) {
    console.log("✅ No movies to remove (Unknown language)");
    return;
  }

     console.log(queueId)



await axios.delete(`${ip}/api/v3/queue/bulk`,{
    headers: {
        "X-Api-Key": api
      },
      params:{
        removeFromClient:true,
        blocklist:false,
        skipRedownload:false,
        changeCategory:false
      },
      data:{
        ids:queueId,
      }
})

 console.log(`✅ Removed ${queueId.length} movies`);

}



//Removing completed movies with title mismatch

async function removedCompletedMovies(){

  console.log("🔍 Removing completed movies with title mismatch");
    const responce =  await axios.get(`${ip}/api/v3/queue`,{
         headers: {
        "X-Api-Key": api
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
       queueId.push(value.id)
       console.log(`🗑️ ${value.title}`);
       await sendTelegramMessage(`🗑️ ${value.title}`)
  }
}

  if (!queueId.length) {
    console.log("✅ No completed movies to remove");
    return;
  }

} catch (error) {
  console.error(error)
}



await axios.delete(`${ip}/api/v3/queue/bulk`,{
    headers: {
        "X-Api-Key": api
      },
      params:{
        removeFromClient:true,
        blocklist:false,
        skipRedownload:false,
        changeCategory:false
      },
      data:{
        ids:queueId,
      }
})
console.log(`✅ Removed ${queueId.length} completed movies`);

}
//removing stopped movies
async function removingStoppedMOvies(){
  console.log('🔍started to removing the stopped movies')
 const responce =  await axios.get(`${ip}/api/v3/queue`,{
         headers: {
        "X-Api-Key": api
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
       await sendTelegramMessage(value.title)
      }
    }

 if(!queueId.length){
console.log('✅ no movies are paused to remove')
return;
 }

 console.log('🗑️ deleteing the paused moovies');
 await delay(1000)
 await axios.delete(`${ip}/api/v3/queue/bulk`,{
    headers: {
        "X-Api-Key": api
      },
      params:{
        removeFromClient:true,
        blocklist:true,
        skipRedownload:false,
        changeCategory:false
      },
      data:{
        ids:queueId,
      }
})

 console.log(`✅ Removed ${queueId.length} paused movies`);


    
}
//removing the stalled movies ....................
async function login() {
  const res = await qb.post(
    "/api/v2/auth/login",
    new URLSearchParams({
      username: qbitUserName,
      password: qbitPassword
    })
  );

  if (res.data !== "Ok.") {
    throw new Error("Login failed");
  }

  console.log("✅ Logged into qBittorrent");
}

async function qbitorrentFileInfo(downloadId){
  const {data} = await qb.get('/api/v2/torrents/info',{
    params: { hashes: downloadId.toLowerCase() }
  });
 
     for (const value of data){
        if(value.time_active>=qbitTime){
        console.log(`✅ YES atcive time: ${Math.round(value.time_active/3600)}hrs` )
        return true
      }
      else {
        console.log(`❌ NO atcive time: ${Math.round(value.time_active/3600)}hrs`)
        return false
      } 
     }
}
async function removingStalledMovies(){
   console.log('🔍started to removing the delayed movies')
 const responce =  await axios.get(`${ip}/api/v3/queue`,{
         headers: {
        "X-Api-Key": api
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
 await axios.delete(`${ip}/api/v3/queue/bulk`,{
    headers: {
        "X-Api-Key": api
      },
      params:{
        removeFromClient:true,
        blocklist:true,
        skipRedownload:false,
        changeCategory:false
      },
      data:{
        ids:queueId,
      }
})

 console.log(`✅ Removed ${queueId.length} stalled movies`);


}
// removing the failed metadata download movies ..........
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
async function removingFailedMetadataDownloadMovies(){
  console.log("🔍 Removing metadata failed to dwonload movies");
  const {data} = await axios.get(`${ip}/api/v3/queue`,{
  headers: {
        "X-Api-Key": api
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
   queueId.push(value.id);
   continue;
 }
}
if(!queueId.length){
  console.log('No file found with zero metadata')
  return;
}

console.log('Zero metadata movies are going to delete')
await fileDelete(queueId);


}


async function main() {
  try {
    console.log("🚀 Radarr cleanup started");
    await sendTelegramMessage("🚀 Radarr cleanup started")

    await login();
    await removedMoviesDelete();
    await delay(10000)
    await removedCompletedMovies();
    await delay(10000)
    await removingStoppedMOvies();
    await delay(10000)
    await removingStalledMovies()
    await delay(10000)
    await removingFailedMetadataDownloadMovies();
  
  

    console.log("🏁 Cleanup completed successfully");
   await sendTelegramMessage("🏁 Cleanup completed successfully")
    process.exit(0); // ✅ clean exit
  } catch (err) {
    console.error("❌ Cleanup failed:", err.message);
   await sendTelegramMessage("❌ Cleanup failed:", err.message)
    process.exit(1); // ❌ failure exit
  }
}

main();

