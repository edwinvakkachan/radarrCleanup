import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';

const api = process.env.API;
const ip = process.env.IP;

if (!api || !ip) {
  console.error("❌ Missing API or IP environment variables");
  process.exit(1);
}

//delay function 

function delay(ms) {
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




async function main() {
  try {
    console.log("🚀 Radarr cleanup started");

    await removedMoviesDelete();
    await delay(15)
    await removedCompletedMovies();

    console.log("🏁 Cleanup completed successfully");
    process.exit(0); // ✅ clean exit
  } catch (err) {
    console.error("❌ Cleanup failed:", err.message);
    process.exit(1); // ❌ failure exit
  }
}

main();

