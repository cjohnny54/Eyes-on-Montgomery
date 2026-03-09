
const fetch = require('node-fetch');

async function testQuery() {
    const threeYearsAgo = new Date('2023-01-01').getTime();
    const url = `https://gis.montgomeryal.gov/server/rest/services/HostedDatasets/Received_311_Service_Request/FeatureServer/0/query?where=Create_Date+>=+${threeYearsAgo}&outFields=OBJECTID,Create_Date,District&outSR=4326&f=geojson&resultRecordCount=10`;
    
    console.log('Testing URL:', url);
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        console.log('Feature Count:', data.features?.length);
        if (data.features?.length > 0) {
            console.log('First Feature Properties:', JSON.stringify(data.features[0].properties, null, 2));
            console.log('First Feature Geometry:', JSON.stringify(data.features[0].geometry, null, 2));
        } else {
            console.log('No features found for this date range.');
        }
    } catch (err) {
        console.error('Fetch error:', err);
    }
}

testQuery();
