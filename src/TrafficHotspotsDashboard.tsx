import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, GeoJSON, Tooltip as LeafletTooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import * as turf from '@turf/turf';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from 'recharts';
import { AlertTriangle, MapPin, ShieldAlert, Zap, Loader2, RefreshCw } from 'lucide-react';
import { cn } from './utils';

// Define types for our live datasets
type DatasetType = 'Traffic Engineering' | '311 Requests' | 'Environmental Nuisance' | 'Code Violations';
type ComplaintTheme = 'Traffic Safety' | 'Nuisance' | 'Code/Blight';

interface Complaint {
  id: string;
  coordinates: [number, number];
  dataset: DatasetType;
  theme: ComplaintTheme;
  description: string;
  districtId: string;
}

interface DistrictProfile {
  districtId: string;
  total: number;
  trafficSafety: number;
  nuisance: number;
  codeBlight: number;
  dominantTheme: ComplaintTheme;
  classification: string;
}

const THEME_COLORS = {
  'Traffic Safety': '#ef4444', // red-500
  'Nuisance': '#f59e0b', // amber-500
  'Code/Blight': '#8b5cf6', // violet-500
};

const DISTRICT_COLORS = [
  '#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', 
  '#eab308', '#84cc16', '#14b8a6', '#06b6d4', '#6366f1'
];

export function TrafficHotspotsDashboard({ dateRange = 'Last 30 Days' }: { dateRange?: string }) {
  const [geoJsonData, setGeoJsonData] = useState<any>(null);
  const [hexGrid, setHexGrid] = useState<any>(null);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDataAndProcess = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch District Polygons
      let data = geoJsonData;
      if (!data) {
        const response = await fetch('https://gis.montgomeryal.gov/server/rest/services/SDE_City_Council/MapServer/0/query?where=1%3D1&outFields=*&f=geojson');
        if (!response.ok) throw new Error('Failed to fetch district data');
        data = await response.json();
        setGeoJsonData(data);
      }

      // 2. Calculate Date for filtering
      const now = new Date();
      let startDateStr = '2023-01-01'; // Default

      if (dateRange === 'Last 30 Days') {
        const d = new Date();
        d.setDate(d.getDate() - 30);
        startDateStr = d.toISOString().split('T')[0];
      } else if (dateRange === 'Last 90 Days') {
        const d = new Date();
        d.setDate(d.getDate() - 90);
        startDateStr = d.toISOString().split('T')[0];
      } else if (dateRange === 'Year to Date') {
        startDateStr = `${now.getFullYear()}-01-01`;
      } else if (dateRange === '3 Years') {
        startDateStr = '2023-01-01';
      }

      console.log('Fetching hotspots since:', startDateStr, 'for range:', dateRange);

      // 3. Fetch Live Datasets with Date Filtering
      const [res311, resCode] = await Promise.all([
        fetch(`https://gis.montgomeryal.gov/server/rest/services/HostedDatasets/Received_311_Service_Request/FeatureServer/0/query?where=Create_Date+>=+DATE+'${startDateStr}'&outFields=*&outSR=4326&f=geojson&resultRecordCount=3000`).then(r => r.ok ? r.json() : null),
        fetch(`https://gis.montgomeryal.gov/server/rest/services/HostedDatasets/Code_Violations/FeatureServer/0/query?where=created_date+>=+DATE+'${startDateStr}'&outFields=*&outSR=4326&f=geojson&resultRecordCount=3000`).then(r => r.ok ? r.json() : null)
      ]);

      const liveComplaints: Complaint[] = [];

      // Process 311 Requests
      if (res311 && res311.features) {
        res311.features.forEach((feature: any, index: number) => {
          if (!feature.geometry || !feature.geometry.coordinates) return;
          
          const coords = feature.geometry.coordinates as [number, number];
          if (!Array.isArray(coords) || coords.length < 2 || typeof coords[0] !== 'number' || typeof coords[1] !== 'number') return;

          const dept = feature.properties?.Department || '';
          const reqType = feature.properties?.Request_Type || '';
          
          let dataset: DatasetType = '311 Requests';
          let theme: ComplaintTheme = 'Nuisance';
          
          if (dept === 'Traffic Engineering' || dept === 'Street Maintenance' || reqType.toLowerCase().includes('traffic') || reqType.toLowerCase().includes('street') || reqType.toLowerCase().includes('sign') || reqType.toLowerCase().includes('light') || reqType.toLowerCase().includes('speed')) {
            dataset = 'Traffic Engineering';
            theme = 'Traffic Safety';
          } else if (dept === 'Code Enforcement' || reqType.toLowerCase().includes('nuisance') || reqType.toLowerCase().includes('weed') || reqType.toLowerCase().includes('trash')) {
            dataset = 'Code Violations';
            theme = 'Code/Blight';
          } else if (dept === 'Sanitation Department' || reqType.toLowerCase().includes('dumping') || reqType.toLowerCase().includes('noise')) {
            dataset = 'Environmental Nuisance';
            theme = 'Nuisance';
          }

          // Spatial Join: Assign District ID
          let assignedDistrictId: string | null = feature.properties?.District ? String(feature.properties.District) : null;
          
          if (!assignedDistrictId) {
            turf.featureEach(data, (district) => {
              if (assignedDistrictId) return;
              if (district.geometry.type === 'Polygon' || district.geometry.type === 'MultiPolygon') {
                if (turf.booleanPointInPolygon(turf.point(coords), district as any)) {
                  assignedDistrictId = district.properties?.DISTRICT || district.properties?.Id || `Unknown`;
                }
              }
            });
          }

          if (assignedDistrictId) {
            const normalizedId = String(assignedDistrictId).replace(/\D/g, '');
            liveComplaints.push({
              id: `311-${feature.properties?.OBJECTID || index}`,
              coordinates: coords,
              dataset,
              theme,
              description: `${dept} - ${reqType}`,
              districtId: normalizedId ? parseInt(normalizedId, 10).toString() : 'Unknown'
            });
          }
        });
      }

      // Process Code Violations
      if (resCode && resCode.features) {
        resCode.features.forEach((feature: any, index: number) => {
          if (!feature.geometry || !feature.geometry.coordinates) return;
          
          const coords = feature.geometry.coordinates as [number, number];
          if (!Array.isArray(coords) || coords.length < 2 || typeof coords[0] !== 'number' || typeof coords[1] !== 'number') return;

          const caseType = feature.properties?.CaseType || 'Code Violation';
          
          // Spatial Join: Assign District ID
          let assignedDistrictId: string | null = feature.properties?.CouncilDistrict ? String(feature.properties.CouncilDistrict) : null;
          
          if (!assignedDistrictId) {
            turf.featureEach(data, (district) => {
              if (assignedDistrictId) return;
              if (district.geometry.type === 'Polygon' || district.geometry.type === 'MultiPolygon') {
                if (turf.booleanPointInPolygon(turf.point(coords), district as any)) {
                  assignedDistrictId = district.properties?.DISTRICT || district.properties?.Id || `Unknown`;
                }
              }
            });
          }

          if (assignedDistrictId) {
            const normalizedId = String(assignedDistrictId).replace(/\D/g, '');
            liveComplaints.push({
              id: `code-${feature.properties?.OBJECTID || index}`,
              coordinates: coords,
              dataset: 'Code Violations',
              theme: 'Code/Blight',
              description: caseType,
              districtId: normalizedId ? parseInt(normalizedId, 10).toString() : 'Unknown'
            });
          }
        });
      }

      setComplaints(liveComplaints);

      // 3. Create Hex Grid for Hotspots (Traffic Safety only)
      const trafficPoints = liveComplaints.filter(c => c.theme === 'Traffic Safety');
      const pointsFeatureCollection = turf.featureCollection(
        trafficPoints.map(p => turf.point(p.coordinates))
      );

      // Create a hex grid over the bounding box
      const bbox = turf.bbox(data);
      // Cell size in kilometers (e.g., 0.5km = 500m)
      const hexGridFeatures = turf.hexGrid(bbox, 0.5, { units: 'kilometers' });

      // Count points in each hex
      const hexGridWithCounts = turf.collect(hexGridFeatures, pointsFeatureCollection, 'dataset', 'values');
      
      // Calculate max count for color scaling
      let maxCount = 0;
      turf.featureEach(hexGridWithCounts, (hex) => {
        const count = hex.properties?.values?.length || 0;
        hex.properties = { ...hex.properties, count };
        if (count > maxCount) maxCount = count;
      });

      // Filter out empty hexes to clean up the map
      const activeHexes = {
        type: 'FeatureCollection',
        features: hexGridWithCounts.features.filter(f => (f.properties?.count || 0) > 0)
      };

      // Store maxCount in the collection properties for the renderer
      (activeHexes as any).properties = { maxCount };

      setHexGrid(activeHexes);

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred while processing data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDataAndProcess();
  }, [dateRange]);

  // 4. Aggregate by District (Complaint Profiles)
  const districtProfiles = useMemo(() => {
    const profilesMap = new Map<string, DistrictProfile>();

    complaints.forEach(c => {
      if (!profilesMap.has(c.districtId)) {
        profilesMap.set(c.districtId, {
          districtId: c.districtId,
          total: 0,
          trafficSafety: 0,
          nuisance: 0,
          codeBlight: 0,
          dominantTheme: 'Traffic Safety',
          classification: ''
        });
      }
      const profile = profilesMap.get(c.districtId)!;
      profile.total++;
      if (c.theme === 'Traffic Safety') profile.trafficSafety++;
      if (c.theme === 'Nuisance') profile.nuisance++;
      if (c.theme === 'Code/Blight') profile.codeBlight++;
    });

    const profiles = Array.from(profilesMap.values()).map(p => {
      // Determine dominant theme
      let dominant: ComplaintTheme = 'Traffic Safety';
      let max = p.trafficSafety;
      if (p.nuisance > max) { dominant = 'Nuisance'; max = p.nuisance; }
      if (p.codeBlight > max) { dominant = 'Code/Blight'; max = p.codeBlight; }
      
      p.dominantTheme = dominant;

      // Classify
      if (dominant === 'Traffic Safety') {
        p.classification = 'Speeding / Sight-Distance / Signage Hotspot';
      } else if (dominant === 'Nuisance') {
        p.classification = 'Noise / Dumping / Nuisance Hotspot';
      } else {
        p.classification = 'Blight / Property Maintenance Hotspot';
      }

      return p;
    });

    return profiles.sort((a, b) => {
      const numA = parseInt(String(a.districtId).replace(/\D/g, '') || '0');
      const numB = parseInt(String(b.districtId).replace(/\D/g, '') || '0');
      return numA - numB;
    });
  }, [complaints]);


  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] min-h-[600px] w-full bg-[#141415] rounded-2xl border border-rose-500/20">
        <AlertTriangle className="h-10 w-10 text-rose-500 mb-4" />
        <h3 className="text-lg font-medium text-white">Analysis Failed</h3>
        <p className="text-sm text-slate-400 mt-2 mb-6">{error}</p>
        <button 
          onClick={fetchDataAndProcess}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors text-sm font-medium"
        >
          <RefreshCw size={16} />
          Retry Analysis
        </button>
      </div>
    );
  }

  const totalTraffic = complaints.filter(c => c.theme === 'Traffic Safety').length;
  const totalNuisance = complaints.filter(c => c.theme === 'Nuisance').length;
  const totalCode = complaints.filter(c => c.theme === 'Code/Blight').length;

  return (
    <div className="relative w-full h-[calc(100vh-200px)] min-h-[600px] rounded-2xl overflow-hidden border border-white/10 bg-[#141415]">
      {/* Map Background */}
      <div className="absolute inset-0 z-0">
        <MapContainer 
          center={[32.3500, -86.2700]} 
          zoom={11} 
          style={{ height: '100%', width: '100%', backgroundColor: '#f3f4f6' }}
          zoomControl={true}
        >
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}"
            attribution='Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012'
          />
          
          {/* District Outlines */}
          {geoJsonData && (
            <GeoJSON 
              data={geoJsonData} 
              style={(feature) => {
                const id = feature?.properties?.DISTRICT || feature?.properties?.Id || '0';
                const colorIndex = parseInt(id.toString().replace(/\D/g, '') || '0') % DISTRICT_COLORS.length;
                return {
                  fillColor: DISTRICT_COLORS[colorIndex],
                  weight: 2,
                  opacity: 0.8,
                  color: '#1e293b',
                  dashArray: '3',
                  fillOpacity: 0.2
                };
              }}
              onEachFeature={(feature, layer) => {
                const districtId = feature.properties?.DISTRICT || feature.properties?.Id || 'Unknown';
                layer.bindTooltip(`District ${districtId}`, {
                  permanent: false,
                  direction: 'center',
                  className: 'bg-[#141415] text-white border-white/10 text-xs font-medium px-2 py-1 rounded shadow-xl'
                });
              }}
            />
          )}

          {/* Hex Grid Heat Layer */}
          {hexGrid && (
            <GeoJSON 
              data={hexGrid} 
              style={(feature) => {
                const count = feature?.properties?.count || 0;
                const maxCount = hexGrid.properties.maxCount || 1;
                const intensity = count / maxCount;
                
                let fillColor = '#facc15'; // Yellow
                if (intensity > 0.75) fillColor = '#7f1d1d'; // Dark Red
                else if (intensity > 0.5) fillColor = '#dc2626'; // Red
                else if (intensity > 0.25) fillColor = '#ea580c'; // Orange
                
                return {
                  fillColor,
                  weight: 2,
                  opacity: 1,
                  color: '#450a0a', // Very dark red/brown border
                  fillOpacity: intensity * 0.5 + 0.3
                };
              }}
              onEachFeature={(feature, layer) => {
                const count = feature.properties?.count || 0;
                layer.bindTooltip(`${count} Traffic/Safety Complaints in this area`, {
                  permanent: false,
                  direction: 'center',
                  className: 'bg-[#141415] text-white border-white/10 text-xs font-medium px-2 py-1 rounded shadow-xl'
                });
              }}
            />
          )}
        </MapContainer>
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 z-[500] flex flex-col items-center justify-center bg-[#141415]/60 backdrop-blur-sm">
          <Loader2 className="h-8 w-8 text-emerald-500 animate-spin mb-3" />
          <h3 className="text-sm font-medium text-white">Updating Hotspot Data...</h3>
          <p className="text-[10px] text-slate-300 mt-1 uppercase tracking-widest">{dateRange}</p>
        </div>
      )}

      {/* Floating UI Layer */}
      <div className="absolute inset-0 z-[400] pointer-events-none p-4 flex gap-4">
        
        {/* Left Side: Summary Cards */}
        <div className="flex-1 flex flex-col justify-end">
          <div className="grid grid-cols-3 gap-4 max-w-2xl pointer-events-auto">
            <div className="rounded-2xl border border-white/10 bg-[#0A0A0B]/90 backdrop-blur-md p-4 flex flex-col justify-between shadow-xl h-24">
              <div className="flex items-center gap-2 text-red-400">
                <ShieldAlert size={16} />
                <span className="text-xs font-medium uppercase tracking-wider">Traffic Safety</span>
              </div>
              <div className="text-3xl font-semibold text-white">{totalTraffic}</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-[#0A0A0B]/90 backdrop-blur-md p-4 flex flex-col justify-between shadow-xl h-24">
              <div className="flex items-center gap-2 text-amber-400">
                <Zap size={16} />
                <span className="text-xs font-medium uppercase tracking-wider">Nuisance</span>
              </div>
              <div className="text-3xl font-semibold text-white">{totalNuisance}</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-[#0A0A0B]/90 backdrop-blur-md p-4 flex flex-col justify-between shadow-xl h-24">
              <div className="flex items-center gap-2 text-violet-400">
                <AlertTriangle size={16} />
                <span className="text-xs font-medium uppercase tracking-wider">Code / Blight</span>
              </div>
              <div className="text-3xl font-semibold text-white">{totalCode}</div>
            </div>
          </div>
        </div>

        {/* Right Side: District Profiles */}
        <div className="w-[400px] flex flex-col gap-4 h-full pointer-events-auto">
          
          <div className="bg-[#0A0A0B]/90 backdrop-blur-md border border-white/10 p-5 rounded-2xl shadow-xl shrink-0">
            <h3 className="text-sm font-medium text-white mb-2">Traffic Hotspot Analysis</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Hex grid shows concentration of traffic safety complaints (speeding, sight distance, signs, lights) from Traffic Engineering and 311 datasets.
            </p>
          </div>

          {/* Scrollable District Profiles */}
          <div className="rounded-2xl border border-white/10 bg-[#0A0A0B]/90 backdrop-blur-md flex-1 flex flex-col overflow-hidden shadow-xl">
            <div className="p-4 border-b border-white/10 bg-white/5">
              <h3 className="text-sm font-medium text-white">District Complaint Profiles</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              <div className="flex flex-col gap-2">
                {districtProfiles.map((profile) => (
                  <div key={profile.districtId} className="p-4 rounded-xl bg-white/5 border border-white/5 flex flex-col gap-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-sm font-medium text-white block">District {profile.districtId}</span>
                        <span className="text-[10px] font-mono text-slate-400 mt-1 block">
                          {profile.classification}
                        </span>
                      </div>
                      <span className="text-xs font-mono text-slate-300 bg-white/10 px-2 py-1 rounded">
                        {profile.total} total
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-1 h-2 w-full rounded-full overflow-hidden bg-[#141415]">
                      <div className="h-full bg-red-500" style={{ width: `${(profile.trafficSafety / profile.total) * 100}%` }} title="Traffic Safety" />
                      <div className="h-full bg-amber-500" style={{ width: `${(profile.nuisance / profile.total) * 100}%` }} title="Nuisance" />
                      <div className="h-full bg-violet-500" style={{ width: `${(profile.codeBlight / profile.total) * 100}%` }} title="Code/Blight" />
                    </div>
                    
                    <div className="flex justify-between text-[10px] font-mono text-slate-500">
                      <span className="text-red-400">{profile.trafficSafety} Traffic</span>
                      <span className="text-amber-400">{profile.nuisance} Nuisance</span>
                      <span className="text-violet-400">{profile.codeBlight} Code</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
