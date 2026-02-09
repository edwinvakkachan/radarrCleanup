import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';

const api = process.env.API;
const ip = process.env.IP;
const BOT_TOKEN = process.env.TG_BOT_TOKEN;
const CHAT_ID = process.env.TG_CHAT_ID;

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

async function delay(ms) {
   console.log(`Waiting...${ms} sec`);
  return new Promise(resolve => setTimeout(resolve, ms));
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
                sendTelegramMessage(`🗑️ ${value.title}`)
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
       sendTelegramMessage(`🗑️ ${value.title}`)
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
        sendTelegramMessage(value.title)
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
async function qbitorrentFileInfo(downloadId){
  const responce = await axios.get('http://192.168.0.90:8080/api/v2/torrents/info');
  for (const value of responce.data){
    if(value.hash==downloadId.toLowerCase()){
      if(value.time_active>=86400){
        console.log('YES atcive time: ',value.time_active)
        return true
      }
      else {
        console.log('NO active time : ',value.time_active)
        return false
      } 
    }
  }
  console.log('NO data found')
  return false;
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
        if(await qbitorrentFileInfo(value.downloadId)){
          console.log('stalled movie found');
          await delay(3000)
          sendTelegramMessage('stalled ',value.title)
          console.log(value.title)
          queueId.push(value.id);
          //delte functionality
        }
      }
    }
    if(!queueId.length){
      console.log('No delayed movie')
      return
    }

    console.log('🗑️ deleteing the delayed movies');
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

 console.log(`✅ Removed ${queueId.length} delayed movies`);


}


async function main() {
  try {
    console.log("🚀 Radarr cleanup started");

    await removedMoviesDelete();
    await delay(10000)
    await removedCompletedMovies();
    await delay(10000)
    await removingStoppedMOvies();
    await delay(10000)
    await removingStalledMovies()

    console.log("🏁 Cleanup completed successfully");
    sendTelegramMessage("🏁 Cleanup completed successfully")
    process.exit(0); // ✅ clean exit
  } catch (err) {
    console.error("❌ Cleanup failed:", err.message);
    sendTelegramMessage("❌ Cleanup failed:", err.message)
    process.exit(1); // ❌ failure exit
  }
}

main();

