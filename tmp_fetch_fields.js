
const fetchFields = async () => {
  try {
    const response = await fetch('https://gis.montgomeryal.gov/server/rest/services/HostedDatasets/Received_311_Service_Request/FeatureServer/0?f=json');
    const data = await response.json();
    console.log(JSON.stringify(data.fields.map(f => ({ name: f.name, alias: f.alias })), null, 2));
  } catch (e) {
    console.error(e);
  }
};
fetchFields();
