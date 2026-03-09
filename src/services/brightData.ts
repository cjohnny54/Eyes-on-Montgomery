export async function scrapeBrightData(apiKey: string, collectorId: string, payload: any[]) {
  const headers = {
    "Authorization": `Bearer ${apiKey}`,
    "Content-Type": "application/json"
  };

  // 1. Trigger the scrape
  const response = await fetch(
    `https://api.brightdata.com/datasets/v3/scrape?dataset_id=${collectorId}&include_errors=true`,
    {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    }
  );
  
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Bright Data API error: ${response.status} ${text}`);
  }

  const data = await response.json();
  
  // If it returns the data directly (unlikely but possible)
  if (Array.isArray(data) || data.data) {
    return data;
  }

  // If it returns a snapshot ID, we need to poll
  const snapshotId = data.snapshot_id;
  if (!snapshotId) {
    return data; // Return whatever we got
  }

  console.log(`Scrape triggered, snapshot ID: ${snapshotId}. Polling for results...`);
  
  // 2. Poll for results
  let attempts = 0;
  while (attempts < 30) { // Poll for up to 5 minutes (30 * 10s)
    await new Promise(resolve => setTimeout(resolve, 10000));
    attempts++;
    
    const snapshotResponse = await fetch(
      `https://api.brightdata.com/datasets/v3/snapshot/${snapshotId}?format=json`,
      { headers }
    );
    
    if (snapshotResponse.status === 200) {
      return await snapshotResponse.json();
    } else if (snapshotResponse.status === 202) {
      console.log(`Snapshot ${snapshotId} not ready yet (attempt ${attempts})...`);
      continue;
    } else {
      const text = await snapshotResponse.text();
      throw new Error(`Error fetching snapshot: ${snapshotResponse.status} ${text}`);
    }
  }
  
  throw new Error("Timeout waiting for Bright Data scrape to complete");
}
