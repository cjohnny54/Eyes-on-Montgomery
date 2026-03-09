import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, GeoJSON, CircleMarker, Tooltip as LeafletTooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import * as turf from '@turf/turf';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from 'recharts';
import { PhoneCall, Users, Car, AlertCircle, RefreshCw, Loader2 } from 'lucide-react';
import { cn } from './utils';

// Define types
type IncidentType = '911' | '311' | 'Traffic';

interface Incident {
  id: string;
  coordinates: [number, number]; // [longitude, latitude]
  type: IncidentType;
  districtId: string;
}

interface DistrictStats {
  districtId: string;
  total: number;
  type911: number;
  type311: number;
  typeTraffic: number;
}

const COLORS = {
  '911': '#ef4444', // red-500
  '311': '#10b981', // emerald-500
  'Traffic': '#f59e0b', // amber-500
};

const DISTRICT_COLORS = [
  '#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', 
  '#eab308', '#84cc16', '#14b8a6', '#06b6d4', '#6366f1'
];

export function IncidentMapDashboard({ dateRange = 'Last 30 Days' }: { dateRange?: string }) {
  const [geoJsonData, setGeoJsonData] = useState<any>(null);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedType, setSelectedType] = useState<IncidentType | 'All'>('All');
  const [selectedDistrict, setSelectedDistrict] = useState<string | 'All'>('All');

  const fetchDataAndSimulate = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch GeoJSON
      let data = geoJsonData;
      if (!data) {
        const response = await fetch('https://gis.montgomeryal.gov/server/rest/services/OneView/City_Council_District/MapServer/3/query?where=1%3D1&outFields=*&f=geojson');
        if (!response.ok) {
          throw new Error('Failed to fetch district data');
        }
        data = await response.json();
        setGeoJsonData(data);
      }

      // 2. Generate Simulated Incidents based on dateRange
      // We simulate different volumes based on the selected date range
      const volumeMultiplier = dateRange === 'Last 90 Days' ? 3 : dateRange === 'Year to Date' ? 6 : 1;
      const basePoints = 500;
      const totalPoints = basePoints * volumeMultiplier;

      const bbox = turf.bbox(data);
      const randomPoints = turf.randomPoint(totalPoints, { bbox });
      
      const types: IncidentType[] = ['911', '311', 'Traffic'];
      const validIncidents: Incident[] = [];

      turf.featureEach(randomPoints, (point, index) => {
        let assignedDistrictId: string | null = null;

        // Find which district the point is in
        turf.featureEach(data, (district) => {
          if (assignedDistrictId) return; // Already found
          
          if (district.geometry.type === 'Polygon' || district.geometry.type === 'MultiPolygon') {
            if (turf.booleanPointInPolygon(point, district as any)) {
              assignedDistrictId = district.properties?.DISTRICT || district.properties?.Id || `District-${index}`;
            }
          }
        });

        if (assignedDistrictId) {
          const normalizedId = String(assignedDistrictId).replace(/\D/g, '');
          validIncidents.push({
            id: `incident-${dateRange}-${index}`,
            coordinates: point.geometry.coordinates as [number, number],
            type: types[Math.floor(Math.random() * types.length)],
            districtId: normalizedId ? parseInt(normalizedId, 10).toString() : 'Unknown'
          });
        }
      });

      setIncidents(validIncidents);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred while fetching data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDataAndSimulate();
  }, [dateRange]);

  // 3. Aggregate Data
  const uniqueDistricts = useMemo(() => {
    const districts = new Set<string>();
    incidents.forEach(i => districts.add(i.districtId));
    return Array.from(districts).sort((a, b) => {
      const numA = parseInt(String(a).replace(/\D/g, '') || '0');
      const numB = parseInt(String(b).replace(/\D/g, '') || '0');
      return numA - numB;
    });
  }, [incidents]);

  const filteredIncidents = useMemo(() => {
    return incidents.filter(incident => {
      const matchType = selectedType === 'All' || incident.type === selectedType;
      const matchDistrict = selectedDistrict === 'All' || String(incident.districtId) === String(selectedDistrict);
      return matchType && matchDistrict;
    });
  }, [incidents, selectedType, selectedDistrict]);

  const { districtStats, cityWideStats } = useMemo(() => {
    const statsMap = new Map<string, DistrictStats>();
    const cityStats = { total: 0, type911: 0, type311: 0, typeTraffic: 0 };

    filteredIncidents.forEach(incident => {
      cityStats.total++;
      if (incident.type === '911') cityStats.type911++;
      if (incident.type === '311') cityStats.type311++;
      if (incident.type === 'Traffic') cityStats.typeTraffic++;

      if (!statsMap.has(incident.districtId)) {
        statsMap.set(incident.districtId, { districtId: incident.districtId, total: 0, type911: 0, type311: 0, typeTraffic: 0 });
      }
      const dStat = statsMap.get(incident.districtId)!;
      dStat.total++;
      if (incident.type === '911') dStat.type911++;
      if (incident.type === '311') dStat.type311++;
      if (incident.type === 'Traffic') dStat.typeTraffic++;
    });

    const sortedStats = Array.from(statsMap.values()).sort((a, b) => b.total - a.total);
    return { districtStats: sortedStats, cityWideStats: cityStats };
  }, [filteredIncidents]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[500px] w-full bg-[#141415] rounded-2xl border border-white/10">
        <Loader2 className="h-10 w-10 text-emerald-500 animate-spin mb-4" />
        <h3 className="text-lg font-medium text-white">Processing Spatial Data</h3>
        <p className="text-sm text-slate-400 mt-2">Fetching districts and simulating incidents...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[500px] w-full bg-[#141415] rounded-2xl border border-rose-500/20">
        <AlertCircle className="h-10 w-10 text-rose-500 mb-4" />
        <h3 className="text-lg font-medium text-white">Failed to load map data</h3>
        <p className="text-sm text-slate-400 mt-2 mb-6">{error}</p>
        <button 
          onClick={fetchDataAndSimulate}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors text-sm font-medium"
        >
          <RefreshCw size={16} />
          Retry Connection
        </button>
      </div>
    );
  }

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

          {filteredIncidents.map((incident) => (
            <CircleMarker
              key={incident.id}
              center={[incident.coordinates[1], incident.coordinates[0]]}
              radius={4}
              pathOptions={{
                fillColor: COLORS[incident.type],
                color: '#000',
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
              }}
            >
              <LeafletTooltip>
                <div className="text-xs">
                  <span className="font-semibold">{incident.type}</span> in District {incident.districtId}
                </div>
              </LeafletTooltip>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>

      {/* Floating UI Layer */}
      <div className="absolute inset-0 z-[400] pointer-events-none p-4 flex gap-4">
        
        {/* Left Side: Filters + Bottom Cards */}
        <div className="flex-1 flex flex-col justify-between">
          {/* Top Left: Filters */}
          <div className="flex flex-wrap items-center gap-6 bg-[#0A0A0B]/90 backdrop-blur-md border border-white/10 rounded-2xl p-4 pointer-events-auto shadow-xl self-start">
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-slate-400">Incident Type:</label>
              <select 
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as any)}
                className="bg-[#141415] border border-white/10 text-white text-sm rounded-lg px-3 py-2 outline-none focus:border-blue-500 transition-colors"
              >
                <option value="All">All Types</option>
                <option value="911">911 Emergency</option>
                <option value="311">311 Request</option>
                <option value="Traffic">Traffic Issue</option>
              </select>
            </div>
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-slate-400">District:</label>
              <select 
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="bg-[#141415] border border-white/10 text-white text-sm rounded-lg px-3 py-2 outline-none focus:border-blue-500 transition-colors"
              >
                <option value="All">All Districts</option>
                {uniqueDistricts.map(d => (
                  <option key={d} value={d}>District {d}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Bottom Left: Summary Cards */}
          <div className="grid grid-cols-3 gap-4 pointer-events-auto max-w-2xl">
            <div className="rounded-2xl border border-white/10 bg-[#0A0A0B]/90 backdrop-blur-md p-4 flex flex-col justify-between shadow-xl h-24">
              <div className="flex items-center gap-2 text-red-400">
                <PhoneCall size={16} />
                <span className="text-xs font-medium uppercase tracking-wider">911 Emergencies</span>
              </div>
              <div className="text-3xl font-semibold text-white">{cityWideStats.type911}</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-[#0A0A0B]/90 backdrop-blur-md p-4 flex flex-col justify-between shadow-xl h-24">
              <div className="flex items-center gap-2 text-emerald-400">
                <Users size={16} />
                <span className="text-xs font-medium uppercase tracking-wider">311 Requests</span>
              </div>
              <div className="text-3xl font-semibold text-white">{cityWideStats.type311}</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-[#0A0A0B]/90 backdrop-blur-md p-4 flex flex-col justify-between shadow-xl h-24">
              <div className="flex items-center gap-2 text-amber-400">
                <Car size={16} />
                <span className="text-xs font-medium uppercase tracking-wider">Traffic Issues</span>
              </div>
              <div className="text-3xl font-semibold text-white">{cityWideStats.typeTraffic}</div>
            </div>
          </div>
        </div>

        {/* Right Side: Analytics Panel + Legend */}
        <div className="w-[350px] flex flex-col gap-4 h-full pointer-events-auto">
          {/* Legend */}
          <div className="bg-[#0A0A0B]/90 backdrop-blur-md border border-white/10 p-4 rounded-2xl shadow-xl shrink-0">
            <h4 className="text-xs font-semibold text-white mb-3 uppercase tracking-wider">Legend</h4>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"></div>
                <span className="text-xs font-medium text-slate-300">911 Emergency</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                <span className="text-xs font-medium text-slate-300">311 Request</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"></div>
                <span className="text-xs font-medium text-slate-300">Traffic Issue</span>
              </div>
            </div>
          </div>

          {/* Bar Chart */}
          <div className="rounded-2xl border border-white/10 bg-[#0A0A0B]/90 backdrop-blur-md p-4 h-[250px] shrink-0 flex flex-col shadow-xl">
            <h3 className="text-sm font-medium text-white mb-4">Incidents by District</h3>
            <div className="flex-1 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={districtStats} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis 
                    dataKey="districtId" 
                    stroke="#64748b" 
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => `D${val}`}
                  />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                  <RechartsTooltip 
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    contentStyle={{ backgroundColor: '#1A1A1C', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                    itemStyle={{ fontSize: '12px' }}
                  />
                  <Bar dataKey="total" name="Total Incidents" radius={[4, 4, 0, 0]}>
                    {districtStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={DISTRICT_COLORS[parseInt(entry.districtId.toString().replace(/\D/g, '') || '0') % DISTRICT_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Scrollable List */}
          <div className="rounded-2xl border border-white/10 bg-[#0A0A0B]/90 backdrop-blur-md flex-1 flex flex-col overflow-hidden shadow-xl">
            <div className="p-4 border-b border-white/10 bg-white/5">
              <h3 className="text-sm font-medium text-white">District Breakdown</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              <div className="flex flex-col gap-1">
                {districtStats.map((stat) => (
                  <div key={stat.districtId} className="p-3 rounded-xl hover:bg-white/5 transition-colors flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-white">District {stat.districtId}</span>
                      <span className="text-sm font-mono text-slate-300">{stat.total} total</span>
                    </div>
                    <div className="flex items-center gap-1 h-1.5 w-full rounded-full overflow-hidden bg-white/5">
                      <div className="h-full bg-red-500" style={{ width: `${(stat.type911 / stat.total) * 100}%` }} />
                      <div className="h-full bg-emerald-500" style={{ width: `${(stat.type311 / stat.total) * 100}%` }} />
                      <div className="h-full bg-amber-500" style={{ width: `${(stat.typeTraffic / stat.total) * 100}%` }} />
                    </div>
                    <div className="flex justify-between text-[10px] font-mono text-slate-500">
                      <span className="text-red-400">{stat.type911} (911)</span>
                      <span className="text-emerald-400">{stat.type311} (311)</span>
                      <span className="text-amber-400">{stat.typeTraffic} (Traffic)</span>
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
