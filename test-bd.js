import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

async function test() {
  const API_KEY = process.env.BRIGHT_DATA_API_KEY;
  const COLLECTOR_ID = "gd_lwxkxvnf1cynvib9co";
  
  const headers = {
      "Authorization": `Bearer ${API_KEY}`,
      "Content-Type": "application/json"
  };
  
  const payload = [
      {"url": "https://x.com/CityofMGM/status/1897356262174306443"},
  ];
  
  try {
    const response = await fetch(
        `https://api.brightdata.com/datasets/v3/scrape?dataset_id=${COLLECTOR_ID}&include_errors=true`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify(payload)
        }
    );
    const data = await response.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (e) {
    console.error(e);
  }
}

test();
