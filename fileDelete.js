import config from "./config.js";
import axios from "axios";
import { publishMessage } from "./queue/publishMessage.js";



export async function fileDelete(queueId,removeFromClient=true,blocklist=true,skipRedownload=false){
   await axios.delete(`${config.ip}/api/v3/queue/bulk`,{
    headers: {
        "X-Api-Key": config.api
      },
      params:{
        removeFromClient:removeFromClient,
        blocklist:blocklist,
        skipRedownload:skipRedownload,
        changeCategory:false
      },
      data:{
        ids:queueId,
      }
})
console.log(`✅ Removed ${queueId.length} movies`);
    await publishMessage({
  message: `✅ Removed ${queueId.length} movies`
});

}