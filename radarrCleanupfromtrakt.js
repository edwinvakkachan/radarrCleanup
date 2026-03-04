import axios from "axios";
import pool from "./db/pool.js";

import config from "./config.js";
const RADARR_URL = config.ip
const API_KEY = config.api

const radarr = axios.create({
  baseURL: RADARR_URL,
  headers: {
    "X-Api-Key": API_KEY
  }
});

async function getPredvdTagId() {
  const res = await radarr.get("/api/v3/tag");

  const tag = res.data.find(t => t.label === "predvd");

  if (!tag) throw new Error("predvd tag not found");

  return tag.id;
}

async function deleteMovie(movieId) {
  await radarr.delete(`/api/v3/movie/${movieId}`, {
    params: {
      deleteFiles: true,
      addImportExclusion: false
    }
  });
}

export async function runCleanup() {

  const tagId = await getPredvdTagId();

  const movies = await radarr.get("/api/v3/movie");

  const predvdMovies = movies.data.filter(m =>
    m.tags.includes(tagId)
  );


  const dbRows = await pool.query(`
    SELECT title, year
    FROM radarr_cleanup_queue
    WHERE processed = false
  `);

  for (const row of dbRows.rows) {

    const match = predvdMovies.find(
      m =>
        m.title.toLowerCase() === row.title.toLowerCase() &&
        m.year === row.year
    );

    if (!match)  {
        console.log('movie not matching')
        continue;}

    console.log("Deleting:", match.title);

    await deleteMovie(match.id);

    await pool.query(
      `UPDATE radarr_cleanup_queue
        SET processed = true
        WHERE title = $1 AND year = $2;`,
      [row.title, row.year]
    );
  }

  console.log("Cleanup finished");
}

