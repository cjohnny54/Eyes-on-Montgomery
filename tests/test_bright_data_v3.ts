import "dotenv/config";

async function testBrightData() {
  const apiKey = process.env.BRIGHT_DATA_API_KEY;
  const snapshotId = "sd_mmj4ehyc2agwjzipk4"; // Hardcoded from previous success

  console.log(`Polling snapshot: ${snapshotId}`);

  try {
    const response = await fetch(
      `https://api.brightdata.com/datasets/v3/snapshot/${snapshotId}?format=json`,
      {
        headers: { "Authorization": `Bearer ${apiKey}` }
      }
    );

    const text = await response.text();
    console.log(`Snapshot Status: ${response.status}`);
    console.log(`Snapshot Body Content: ${text.substring(0, 500)}...`);

  } catch (error) {
    console.error("FAIL: Exception during fetch:", error);
  }
}

testBrightData();
