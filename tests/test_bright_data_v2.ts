import "dotenv/config";

async function testBrightData() {
  const apiKey = process.env.BRIGHT_DATA_API_KEY;
  const collectorId = process.env.BRIGHT_DATA_COLLECTOR_ID || "gd_lwxkxvnf1cynvib9co";

  console.log(`Using API Key: ${apiKey ? "******" : "MISSING"}`);
  console.log(`Using Collector ID: ${collectorId}`);

  if (!apiKey) {
    console.error("FAIL: BRIGHT_DATA_API_KEY is missing from .env");
    return;
  }

  // Attempting to trigger a dataset trigger (discovery) rather than a direct status scrape
  // For some collectors, providing a keyword or a generic profile URL might work if the API is configured correctly.
  // However, the error message from before said: 
  // "Value should match pattern https:\\/\\/(www\\.)?(?:x\\.com|twitter\\.com)\\/(?:[a-zA-Z0-9_]+\\/)?status|statuses\\/\\d+"
  
  // This indicates this SPECIFIC collector is a "Post Scraper" and cannot be used for broad sentiment discovery.
  // We need to check if there is another endpoint or if the collector ID is wrong.
  
  const payload = [
    { url: "https://x.com/CityofMontgomAL/status/1762148784136950259" } 
  ];

  try {
    console.log("Triggering scrape...");
    // Some Bright Data collectors use dataset_id, others use collector_id in different versions of the API
    const cleanCollectorId = collectorId.split('&')[0];
    
    const response = await fetch(
      `https://api.brightdata.com/datasets/v3/trigger?dataset_id=${cleanCollectorId}`,
      {
        method: 'POST',
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      }
    );

    const text = await response.text();
    console.log(`Trigger Attempt Status: ${response.status}`);
    console.log(`Trigger Attempt Body: ${text}`);

  } catch (error) {
    console.error("FAIL: Exception during fetch:", error);
  }
}

testBrightData();
