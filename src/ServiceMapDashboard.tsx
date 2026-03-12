
import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, GeoJSON, Tooltip as LeafletTooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import * as turf from '@turf/turf';
import { ShieldAlert, Zap, Loader2, RefreshCw, Layers, Calendar, Map as MapIcon } from 'lucide-react';
import { cn } from './utils';

// Types for 311 Mapping
type ServiceCategory = 'Public Works' | 'Sanitation' | 'Traffic/Safety' | 'Blight/Nuisance' | 'Other';

interface ServiceRequest {
  id: string;
  coordinates: [number, number];
  category: ServiceCategory;
  department: string;
  type: string;
  districtId: string;
  createDate: number;
}

const CATEGORY_COLORS = {
  'Public Works': '#3b82f6',     // blue-500
  'Sanitation': '#10b981',       // emerald-500
  'Traffic/Safety': '#f43f5e',   // rose-500
  'Blight/Nuisance': '#f59e0b',  // amber-500
  'Other': '#94a3b8'             // slate-400
};

const DISTRICT_COLORS = [
  '#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', 
  '#eab308', '#84cc16', '#14b8a6', '#06b6d4', '#6366f1'
];

export function ServiceMapDashboard({ dateRange = 'Last 30 Days' }: { dateRange?: string }) {
  const [geoJsonData, setGeoJsonData] = useState<any>(null);
  const [hexGrid, setHexGrid] = useState<any>(null);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<ServiceCategory | 'All'>('All');

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch District Polygons (if not loaded)
      let districtGeo = geoJsonData;
      if (!districtGeo) {
        const distResponse = await fetch('https://gis.montgomeryal.gov/server/rest/services/OneView/City_Council_District/MapServer/3/query?where=1%3D1&outFields=*&f=geojson');
        districtGeo = await distResponse.json();
        setGeoJsonData(districtGeo);
      }

      // 2. Calculate Date for filtering
      const now = new Date();
      let startDateStr = '2023-01-01'; // Default backup

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

      console.log('Fetching data since:', startDateStr, 'for range:', dateRange);
      
      const url = `https://gis.montgomeryal.gov/server/rest/services/HostedDatasets/Received_311_Service_Request/FeatureServer/0/query?where=Create_Date+>=+DATE+'${startDateStr}'&outFields=*&outSR=4326&f=geojson&resultRecordCount=8000`;
      console.log('Fetching URL:', url);
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch historical 311 data');
      const data = await response.json();
      console.log('Received features:', data.features?.length);

      const processedRequests: ServiceRequest[] = [];

      data.features.forEach((feature: any, index: number) => {
        if (!feature.geometry || !feature.geometry.coordinates) return;
        
        const coords = feature.geometry.coordinates;
        // Strict coordinate validation
        if (!Array.isArray(coords) || coords.length < 2 || 
            typeof coords[0] !== 'number' || typeof coords[1] !== 'number' ||
            isNaN(coords[0]) || isNaN(coords[1])) {
          return;
        }

        const props = feature.properties;
        
        const dept = props.Department || 'Other';
        const type = props.Request_Type || 'Other';
        
        let category: ServiceCategory = 'Other';
        
        // Categorization Logic
        if (dept.includes('Sanitation')) category = 'Sanitation';
        else if (dept.includes('Traffic') || type.toLowerCase().includes('speed') || type.toLowerCase().includes('sign')) category = 'Traffic/Safety';
        else if (dept.includes('Street') || dept.includes('Works')) category = 'Public Works';
        else if (dept.includes('Code') || type.toLowerCase().includes('nuisance') || type.toLowerCase().includes('weed')) category = 'Blight/Nuisance';

        // Spatial Join: get district from data or point-in-polygon fallback
        let assignedDistrictId: string | null = props.District ? String(props.District) : null;
        if (!assignedDistrictId) {
          turf.featureEach(districtGeo, (district) => {
            if (assignedDistrictId) return;
            if (district.geometry.type === 'Polygon' || district.geometry.type === 'MultiPolygon') {
              if (turf.booleanPointInPolygon(turf.point(coords), district as any)) {
                assignedDistrictId = district.properties?.DISTRICT || district.properties?.Id || 'Unknown';
              }
            }
          });
        }

        const normalizedId = assignedDistrictId ? String(assignedDistrictId).replace(/\D/g, '') : 'Unknown';
        processedRequests.push({
          id: `311-${props.OBJECTID || index}`,
          coordinates: coords as [number, number],
          category,
          department: dept,
          type: type,
          districtId: normalizedId ? parseInt(normalizedId, 10).toString() : 'Unknown',
          createDate: props.Create_Date
        });
      });

      setRequests(processedRequests);
      generateHexGrid(processedRequests, districtGeo);

    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const generateHexGrid = (data: ServiceRequest[], bdry: any) => {
    if (!bdry || data.length === 0) return;

    // Filter to double-ensure valid points before Turf FC creation
    const validPoints = data.filter(p => 
      Array.isArray(p.coordinates) && 
      p.coordinates.length >= 2 && 
      typeof p.coordinates[0] === 'number' && 
      typeof p.coordinates[1] === 'number'
    );

    if (validPoints.length === 0) {
      console.warn('No valid coordinates found in the dataset for hex grid generation');
      return;
    }

    const pointsFC = turf.featureCollection(validPoints.map(p => turf.point(p.coordinates, { id: p.id })));
    const bbox = turf.bbox(bdry);
    console.log('Map BBox:', bbox);
    
    // Create grid - 0.7km cells for city-wide overview
    const grid = turf.hexGrid(bbox, 0.7, { units: 'kilometers' });
    console.log('Hex Grid Cells created:', grid.features.length);
    
    // Count points in hexes
    const collected = turf.collect(grid, pointsFC, 'id', 'values');
    
    let maxCount = 0;
    const finalFeatures = collected.features.filter((f: any) => {
      const count = f.properties.values?.length || 0;
      f.properties.count = count;
      if (count > maxCount) maxCount = count;
      return count > 0;
    });

    console.log('Active Hexes (with data):', finalFeatures.length, 'Max Count:', maxCount);

    setHexGrid({
      type: 'FeatureCollection',
      features: finalFeatures,
      properties: { maxCount }
    });
  };

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  const filteredHexGrid = useMemo(() => {
    if (!geoJsonData || requests.length === 0 || !hexGrid) return hexGrid;
    if (activeCategory === 'All') return hexGrid;

    const filteredPoints = requests.filter(r => r.category === activeCategory);
    const validPoints = filteredPoints.filter(p => 
      Array.isArray(p.coordinates) && 
      p.coordinates.length >= 2 && 
      typeof p.coordinates[0] === 'number' && 
      typeof p.coordinates[1] === 'number'
    );
    
    if (validPoints.length === 0) return null;

    const pointsFC = turf.featureCollection(validPoints.map(p => turf.point(p.coordinates, { id: p.id })));
    const bbox = turf.bbox(geoJsonData);
    const grid = turf.hexGrid(bbox, 0.7, { units: 'kilometers' });
    const collected = turf.collect(grid, pointsFC, 'id', 'values');
    
    let max = 0;
    const features = collected.features.filter((f: any) => {
      const count = f.properties.values?.length || 0;
      f.properties.count = count;
      if (count > max) max = count;
      return count > 0;
    });

    return { type: 'FeatureCollection', features, properties: { maxCount: max } };
  }, [activeCategory, requests, geoJsonData]);


  return (
    <div className="relative w-full h-[calc(100vh-200px)] min-h-[600px] rounded-2xl overflow-hidden border border-white/10 bg-[#141415]">
      {/* Map Background */}
      <div className="absolute inset-0 z-0">
        <MapContainer 
          center={[32.3500, -86.2700]} 
          zoom={11} 
          style={{ height: '100%', width: '100%', backgroundColor: '#f3f4f6' }}
          zoomControl={false}
        >
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}"
            attribution='Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012'
          />
          
          {/* District Outlines - Synced with Traffic Hotspots Style */}
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
                  fillOpacity: 0.15
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
          {filteredHexGrid && (
            <GeoJSON 
              key={`hex-${activeCategory}`}
              data={filteredHexGrid} 
              style={(feature) => {
                const count = feature?.properties?.count || 0;
                const maxCount = filteredHexGrid.properties.maxCount || 1;
                const intensity = count / maxCount;
                
                // Use category color or a heat scale
                let color = activeCategory === 'All' ? '#10b981' : CATEGORY_COLORS[activeCategory];
                
                return {
                  fillColor: color,
                  weight: 0.5,
                  opacity: 0.8,
                  color: '#000',
                  fillOpacity: intensity * 0.6 + 0.2
                };
              }}
              onEachFeature={(feature, layer) => {
                const count = feature.properties?.count || 0;
                layer.bindTooltip(`${count} Service Requests in this cluster`, {
                  className: 'bg-[#141415] text-white border-white/10 text-xs px-2 py-1 rounded'
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
          <h3 className="text-sm font-medium text-white">Updating Map Data...</h3>
          <p className="text-[10px] text-slate-300 mt-1 uppercase tracking-widest">{dateRange}</p>
        </div>
      )}

      {/* Floating Controls */}
      <div className="absolute top-4 left-4 z-[400] flex flex-col gap-2 pointer-events-none">
        <div className="bg-[#0A0A0B]/90 backdrop-blur-md border border-white/10 p-4 rounded-xl shadow-2xl pointer-events-auto">
          <div className="flex items-center gap-2 mb-3">
            <Layers size={16} className="text-emerald-400" />
            <h3 className="text-sm font-semibold text-white">Service Intensity Explorer</h3>
          </div>
          <p className="text-[10px] text-slate-400 max-w-[200px] leading-relaxed mb-4">
            Aggregating 311 request coordinates for the <strong>{dateRange}</strong> period. Darker hexes indicate recurring neighborhood issues.
          </p>
          
          <div className="space-y-1.5">
            {['All', ...Object.keys(CATEGORY_COLORS)].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat as any)}
                className={cn(
                  "w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-[10px] transition-all border",
                  activeCategory === cat 
                    ? "bg-white/10 border-white/20 text-white" 
                    : "border-transparent text-slate-500 hover:text-slate-300 hover:bg-white/5"
                )}
              >
                <div className="flex items-center gap-2">
                  <div 
                    className="w-2 h-2 rounded-full" 
                    style={{ backgroundColor: cat === 'All' ? '#10b981' : (CATEGORY_COLORS as any)[cat] }} 
                  />
                  {cat}
                </div>
                {activeCategory === cat && <ShieldAlert size={10} />}
              </button>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
