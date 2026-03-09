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

  // The collector ONLY accepts status URLs according to the validation error
  const payload = [
    { url: "https://x.com/CityofMontgomAL/status/1762148784136950259" } 
  ];

  try {
    console.log("Triggering scrape...");
    const cleanCollectorId = collectorId.split('&')[0];
    
    const response = await fetch(
      `https://api.brightdata.com/datasets/v3/scrape?dataset_id=${cleanCollectorId}&include_errors=true`,
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
    console.log(`Response Status: ${response.status}`);
    console.log(`Response Body: ${text}`);

    if (response.ok) {
      const data = JSON.parse(text);
      if (data.snapshot_id) {
        console.log("SUCCESS: Triggered scrape, received snapshot_id:", data.snapshot_id);
      } else {
        console.log("RECEIVED DATA:", JSON.stringify(data, null, 2));
      }
    } else {
      console.error("FAIL: Non-OK response from Bright Data");
    }
  } catch (error) {
    console.error("FAIL: Exception during fetch:", error);
  }
}

testBrightData();
