import "dotenv/config";

async function testBrightData() {
  const apiKey = process.env.BRIGHT_DATA_API_KEY;
  const collectorId = process.env.BRIGHT_DATA_COLLECTOR_ID || "gd_lwxkxvnf1cynvib9co";

  const payload = [
    { url: "https://twitter.com/CityofMGM/status/1765712626803159305" } 
  ];

  try {
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
    console.log(`Status: ${response.status}`);
    console.log(`Body: ${text}`);

  } catch (error) {
    console.error("FAIL:", error);
  }
}

testBrightData();
