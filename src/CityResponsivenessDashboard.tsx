
import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import { Clock, CheckCircle, AlertCircle, TrendingUp, Loader2, RefreshCw, Building2 } from 'lucide-react';
import { cn } from './utils';

const DISTRICT_COLORS = [
  '#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', 
  '#eab308', '#84cc16', '#14b8a6', '#06b6d4'
];

interface ResponsivenessStats {
  districtId: string;
  avgResolutionDays: number;
  totalRequests: number;
  openCount: number;
  closedCount: number;
  efficiency: number; // percentage
}

export function CityResponsivenessDashboard({ dateRange = 'Last 30 Days' }: { dateRange?: string }) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ResponsivenessStats[]>([]);
  const [departmentData, setDepartmentData] = useState<any[]>([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Calculate Date for filtering
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

      const dateQuery = `Create_Date >= DATE '${startDateStr}'`;

      // 2. Fetch Live 311 Data from Montgomery GIS with date filtering
      const response = await fetch(`https://gis.montgomeryal.gov/server/rest/services/HostedDatasets/Received_311_Service_Request/FeatureServer/0/query?where=${encodeURIComponent(dateQuery)}&outFields=*&outSR=4326&f=geojson&resultRecordCount=3000`);
      if (!response.ok) throw new Error('Failed to fetch live 311 data');
      const data = await response.json();

      const districtMap = new Map<string, { total: number, closed: number, totalDays: number }>();
      const deptMap = new Map<string, { volume: number, totalDays: number }>();

      data.features.forEach((feature: any) => {
        const props = feature.properties;
        const districtId = props.District ? String(props.District).replace(/\D/g, '') : 'Unknown';
        const dept = props.Department || 'Other';
        const createDate = props.Create_Date;
        const closeDate = props.Close_Date;
        const status = props.Status;

        // District Stats
        if (!districtMap.has(districtId)) {
          districtMap.set(districtId, { total: 0, closed: 0, totalDays: 0 });
        }
        const dStat = districtMap.get(districtId)!;
        dStat.total++;

        // Dept Stats
        if (!deptMap.has(dept)) {
          deptMap.set(dept, { volume: 0, totalDays: 0 });
        }
        const deptStat = deptMap.get(dept)!;
        deptStat.volume++;

        if (closeDate && createDate) {
          // Parse dates properly - API returns ISO date strings, not Unix timestamps
          const createTime = new Date(createDate).getTime();
          const closeTime = new Date(closeDate).getTime();
          if (!isNaN(createTime) && !isNaN(closeTime)) {
            const days = (closeTime - createTime) / (1000 * 60 * 60 * 24);
            if (days >= 0) {
              dStat.closed++;
              dStat.totalDays += days;
              deptStat.totalDays += days;
            }
          }
        }
      });

      // Transform to ResponsivenessStats
      const processedStats: ResponsivenessStats[] = Array.from(districtMap.entries())
        .filter(([id]) => id !== 'Unknown' && id !== '')
        .map(([id, data]) => ({
          districtId: id,
          avgResolutionDays: data.closed > 0 ? parseFloat((data.totalDays / data.closed).toFixed(1)) : 0,
          totalRequests: data.total,
          openCount: data.total - data.closed,
          closedCount: data.closed,
          efficiency: parseFloat(((data.closed / data.total) * 100).toFixed(1))
        }));

      // Transform to Dept Stats
      const processedDepts = Array.from(deptMap.entries())
        .map(([name, data]) => ({
          name,
          volume: data.volume,
          resolution: data.volume > 0 ? parseFloat((data.totalDays / data.volume).toFixed(1)) : 0
        }))
        .sort((a, b) => b.volume - a.volume)
        .slice(0, 5); // Top 5 depts

      setStats(processedStats.sort((a, b) => a.avgResolutionDays - b.avgResolutionDays));
      setDepartmentData(processedDepts);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  const overallAvg = useMemo(() =>
    stats.reduce((acc, s) => acc + s.avgResolutionDays, 0) / (stats.length || 1),
  [stats]);

  const overallClosureRate = useMemo(() => {
    const totalClosed = stats.reduce((acc, s) => acc + s.closedCount, 0);
    const totalRequests = stats.reduce((acc, s) => acc + s.totalRequests, 0);
    return totalRequests > 0 ? parseFloat(((totalClosed / totalRequests) * 100).toFixed(1)) : 0;
  }, [stats]);

  const totalOpenRequests = useMemo(() => {
    return stats.reduce((acc, s) => acc + s.openCount, 0);
  }, [stats]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[500px] w-full bg-[#141415] rounded-2xl border border-white/10">
        <Loader2 className="h-10 w-10 text-emerald-500 animate-spin mb-4" />
        <h3 className="text-lg font-medium text-white">Calculating Responsiveness Metrics</h3>
        <p className="text-sm text-slate-400 mt-2">Processing 311 resolution timestamps across 9 districts...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      {/* Top Banner */}
      <div className="rounded-2xl border border-white/10 bg-[#141415] p-5">
        <div className="flex items-start gap-4">
          <div className="rounded-lg bg-blue-500/10 p-3 mt-1">
            <Clock className="h-6 w-6 text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-white mb-2">City Service Responsiveness</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              This dashboard tracks the efficiency of city departments in resolving 311 service requests. 
              <strong> Resolution Time</strong> is a primary indicator of civic trust and neighborhood maintenance.
            </p>
          </div>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-white/10 bg-[#141415] p-5 flex flex-col justify-between">
          <span className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-2">Avg Resolution Time</span>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-semibold text-white">{overallAvg.toFixed(1)}</span>
            <span className="text-sm text-slate-400">days</span>
          </div>
          <div className="mt-4 flex items-center gap-2 text-slate-500 text-xs">
            <TrendingUp size={14} />
            <span>Based on {dateRange.toLowerCase()} data</span>
          </div>
        </div>
        
        <div className="rounded-2xl border border-white/10 bg-[#141415] p-5 flex flex-col justify-between">
          <span className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-2">Citywide Closure Rate</span>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-semibold text-white">{overallClosureRate}</span>
            <span className="text-sm text-slate-400">%</span>
          </div>
          <div className="mt-4 w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500" style={{ width: `${overallClosureRate}%` }} />
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#141415] p-5 flex flex-col justify-between">
          <span className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-2">Active Service Requests</span>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-semibold text-white">{totalOpenRequests.toLocaleString()}</span>
          </div>
          <p className="mt-4 text-[10px] text-slate-500 uppercase tracking-widest">Awaiting department assignment</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Main Chart: Resolution Time per District */}
        <div className="rounded-2xl border border-white/10 bg-[#141415] p-6">
          <h4 className="text-sm font-medium text-white mb-6">Average Days to Resolve by District</h4>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats} layout="vertical" margin={{ left: -20, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                <XAxis type="number" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis 
                  dataKey="districtId" 
                  type="category" 
                  stroke="#64748b" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(val) => `D${val}`}
                />
                <RechartsTooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                  contentStyle={{ backgroundColor: '#1A1A1C', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                />
                <Bar dataKey="avgResolutionDays" radius={[0, 4, 4, 0]}>
                  {stats.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.avgResolutionDays < 4 ? '#10b981' : entry.avgResolutionDays < 7 ? '#3b82f6' : '#f43f5e'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Efficiency by Department */}
        <div className="rounded-2xl border border-white/10 bg-[#141415] p-6">
          <h4 className="text-sm font-medium text-white mb-6">Departmental Performance</h4>
          <div className="space-y-4">
            {departmentData.map((dept, i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 flex items-center gap-2">
                    <Building2 size={14} className="text-slate-500" />
                    {dept.name}
                  </span>
                  <span className="font-mono text-white">{dept.resolution} days avg</span>
                </div>
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className={cn(
                      "h-full rounded-full transition-all duration-1000",
                      dept.resolution < 3 ? "bg-emerald-500" : dept.resolution < 5 ? "bg-blue-500" : "bg-amber-500"
                    )}
                    style={{ width: `${Math.min((10 / dept.resolution) * 30, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>{dept.volume} cases</span>
                  <span>{dept.resolution < 4 ? 'Optimal' : 'Needs Resource'}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 p-4 rounded-xl bg-blue-500/5 border border-blue-500/10">
            <p className="text-[10px] text-blue-300 leading-relaxed italic">
              "Sanitation maintains the highest efficiency despite high volume, while Code Enforcement shows longer resolution cycles due to legal notice requirements."
            </p>
          </div>
        </div>
      </div>

      {/* District Detail Grid */}
      <div className="rounded-2xl border border-white/10 bg-[#141415] overflow-hidden shadow-2xl">
        <div className="px-6 py-4 border-b border-white/10 bg-white/5 flex items-center justify-between">
          <h4 className="text-sm font-medium text-white">District Efficiency Ranking</h4>
          <button onClick={fetchData} className="text-xs text-slate-400 hover:text-white flex items-center gap-2">
            <RefreshCw size={12} />
            Refresh Data
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#1A1A1C] text-slate-500 uppercase tracking-wider font-mono">
              <tr>
                <th className="px-6 py-3 font-medium">District</th>
                <th className="px-6 py-3 font-medium text-center">Closure Rate</th>
                <th className="px-6 py-3 font-medium text-center">Avg Days</th>
                <th className="px-6 py-3 font-medium text-center">Open Tasks</th>
                <th className="px-6 py-3 font-medium">Priority Support</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {stats.map((row) => (
                <tr key={row.districtId} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4 font-medium text-white">District {row.districtId}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col items-center gap-1.5">
                      <span className="font-mono text-white">{row.efficiency}%</span>
                      <div className="w-20 h-1 bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className={cn("h-full", row.efficiency > 80 ? "bg-emerald-500" : "bg-blue-500")} 
                          style={{ width: `${row.efficiency}%` }} 
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={cn(
                      "font-mono px-2 py-1 rounded",
                      row.avgResolutionDays < 4 ? "text-emerald-400 bg-emerald-400/10" : "text-amber-400 bg-amber-400/10"
                    )}>
                      {row.avgResolutionDays}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center font-mono text-slate-400">{row.openCount}</td>
                  <td className="px-6 py-4">
                    {row.avgResolutionDays > 6 ? (
                      <span className="flex items-center gap-1.5 text-rose-400">
                        <AlertCircle size={14} /> High Delay
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-slate-500">
                        <CheckCircle size={14} /> Standard
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
