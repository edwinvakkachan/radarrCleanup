import { wrapper } from "axios-cookiejar-support";
import { CookieJar } from "tough-cookie";
import config from "./config.js";
import axios from "axios";


// qbit login

// const jar = new CookieJar();
// const qb = wrapper(axios.create({
//   baseURL: config.qbitIp, // qBittorrent Web UI
//   jar,
//   withCredentials: true
// }));


const jar = new CookieJar();

export const qb = wrapper(
  axios.create({
    baseURL: config.qbitIp,
    jar,
    withCredentials: true
  })
);


export async function login() {
  const res = await qb.post(
    "/api/v2/auth/login",
    new URLSearchParams({
      username: config.qbitUserName,
      password: config.qbitPassword
    })
  );

  if (res.data !== "Ok.") {
    throw new Error("Login failed");
  }

  console.log("✅ Logged into qBittorrent");
}