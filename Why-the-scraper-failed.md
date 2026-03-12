Why the scraper failed
The original implementation in 

server.ts
 was executing HTTP 

fetch
 requests directly against Bright Data's /v3/trigger endpoint using a collector ID. After exploring E:\bright-data and testing the API behavior, I found two distinct issues:

One of the collector IDs (gd_lwxkxvnf1cynvib9co) was strictly a "Tweet post Scraper" meant for very specific x.com/status URLs, rather than general sentiment-focused Google/organic keyword search endpoints. When provided generic queries (or even URLs of deleted/obscure posts), it systematically failed with dataset mismatched or "error": "Tweet not found."
The alternative collector ID was inactive returning a 404 datasets-error.
The Fix
The project repository already included the @modelcontextprotocol/sdk and @brightdata/mcp packages in 

package.json
. Rather than calling Bright Data's trigger or 

scrape
 loop API manually, I updated the API logic to spawn the Bright Data Server via the SDK (StidoClientTransport executing npx @brightdata/mcp). This correctly pipes credentials, connects logic invisibly, and enables querying through the search_engine command (as used in 

E:\bright-data\bright_data.py
).

The MCP approach directly accepts the query arrays built from the dashboard input.
It polls effectively under the hood and successfully returned 40 results across all 4 query segments.
Verification Process
Per your "Verify, Don't Assume" rule, I verified these fixes by executing Invoke-RestMethod targeting http://localhost:8080/api/sentiment before closing out the backend server process. The results from the tool showed 11,725 characters were gathered, correctly processed by Gemini 3 Flash, and successfully evaluated our Montgomery dataset with a score factor of "62" with a trend of "improving"