/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Activity, AlertTriangle, BarChart3, Map, 
  MessageSquareWarning, ShieldAlert, TrendingUp, Users,
  Search, Bell, Settings, Menu, MapPin, BookOpen, Clock
} from 'lucide-react';
import { 
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  ResponsiveContainer, Cell, ReferenceLine, BarChart, Bar, LineChart, Line, Legend
} from 'recharts';
import { MOCK_DISTRICTS, TIME_SERIES_DATA, DistrictData } from './data';
import { DistrictMap } from './DistrictMap';
import { IncidentMapDashboard } from './IncidentMapDashboard';
import { cn } from './utils';

import { TrafficHotspotsDashboard } from './TrafficHotspotsDashboard';
import { PublicSentimentDashboard } from './PublicSentimentDashboard';
import { DocumentationDashboard } from './DocumentationDashboard';
import { CityResponsivenessDashboard } from './CityResponsivenessDashboard';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedDistrict, setSelectedDistrict] = useState<DistrictData | null>(null);
  const [dateRange, setDateRange] = useState('Last 30 Days');

  const totalCalls = MOCK_DISTRICTS.reduce((acc, d) => acc + d.calls911, 0);
  const avgMisalignment = MOCK_DISTRICTS.reduce((acc, d) => acc + d.misalignmentIndex, 0) / MOCK_DISTRICTS.length;
  const criticalDistricts = MOCK_DISTRICTS.filter(d => d.misalignmentIndex > 15).length;

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-slate-200 font-sans selection:bg-emerald-500/30">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0A0A0B]/80 backdrop-blur-md">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
              <ShieldAlert size={20} />
            </div>
            <div>
              <h1 className="text-sm font-semibold tracking-tight text-white">Montgomery Responsiveness Lens</h1>
              <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Service Efficiency Tracker</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-2.5 top-2 h-4 w-4 text-slate-500" />
              <input 
                type="text" 
                placeholder="Search districts, issues..." 
                className="h-8 w-64 rounded-full border border-white/10 bg-white/5 pl-9 pr-4 text-xs focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all"
              />
            </div>
            <button className="relative p-2 text-slate-400 hover:text-white transition-colors">
              <Bell size={18} />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-rose-500"></span>
            </button>
            <button className="p-2 text-slate-400 hover:text-white transition-colors">
              <Settings size={18} />
            </button>
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-emerald-500 to-cyan-500 p-[1px]">
              <div className="h-full w-full rounded-full bg-[#0A0A0B] flex items-center justify-center">
                <span className="text-xs font-medium text-white">AD</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-64px)] overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 border-r border-white/10 bg-[#0A0A0B] p-4 hidden lg:flex flex-col gap-8 overflow-y-auto">
          <nav className="flex flex-col gap-1">
            <p className="px-3 text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-2">Dashboards</p>
            <NavItem icon={<Activity size={16} />} label="Overview" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
            <NavItem icon={<MapPin size={16} />} label="District Incidents" active={activeTab === 'incidents'} onClick={() => setActiveTab('incidents')} />
            <NavItem icon={<Map size={16} />} label="Live Crime Map" active={activeTab === 'map'} onClick={() => setActiveTab('map')} />
            <NavItem icon={<BarChart3 size={16} />} label="911 Analytics" active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} />
            <NavItem icon={<Users size={16} />} label="311 Service Requests" active={activeTab === '311'} onClick={() => setActiveTab('311')} />
            <NavItem icon={<Clock size={16} />} label="City Responsiveness" active={activeTab === 'responsiveness'} onClick={() => setActiveTab('responsiveness')} />
            <NavItem icon={<MapPin size={16} />} label="Traffic Hotspots" active={activeTab === 'traffic'} onClick={() => setActiveTab('traffic')} />
            <NavItem icon={<MessageSquareWarning size={16} />} label="Public Sentiment" active={activeTab === 'sentiment'} onClick={() => setActiveTab('sentiment')} />
            <NavItem icon={<BookOpen size={16} />} label="Documentation" active={activeTab === 'docs'} onClick={() => setActiveTab('docs')} />
          </nav>

          <div className="mt-auto">
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-xs font-medium text-white">Live Data Feed</span>
              </div>
              <p className="text-[10px] text-slate-400 mb-3">Bright Data MCP connected. Ingesting social sentiment & news comments.</p>
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                <span>Last sync:</span>
                <span className="text-emerald-400">Just now</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="mx-auto max-w-7xl space-y-8">
            
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-white mb-1">
                  {activeTab === 'overview' && 'Citywide Safety Intelligence'}
                  {activeTab === 'incidents' && 'Montgomery Community Safety Lens'}
                  {activeTab === 'map' && 'Live Crime Map'}
                  {activeTab === 'sentiment' && 'Public Sentiment'}
                  {activeTab === 'analytics' && '911 Analytics'}
                  {activeTab === '311' && '311 Service Requests'}
                  {activeTab === 'responsiveness' && 'City Responsiveness Metrics'}
                  {activeTab === 'traffic' && 'Traffic Hotspots'}
                  {activeTab === 'docs' && 'System Documentation'}
                </h2>
                <p className="text-sm text-slate-400">
                  {activeTab === 'overview' && 'Analyzing the gap between actual incidents and public perception.'}
                  {activeTab === 'incidents' && 'Simulated 911, 311, and Traffic incidents mapped to city council districts.'}
                  {activeTab === 'map' && 'Official Montgomery Open Data Portal Integration'}
                  {activeTab === 'sentiment' && 'Real-time social media and news comment analysis.'}
                  {activeTab === 'analytics' && 'Deep dive into emergency response metrics.'}
                  {activeTab === '311' && 'Explore community-reported issues and neighborhood services.'}
                  {activeTab === 'responsiveness' && 'Analyzing 311 resolution speeds and departmental efficiency.'}
                  {activeTab === 'traffic' && 'Identifying high-priority traffic safety and nuisance areas.'}
                  {activeTab === 'docs' && 'Architecture, data sources, and methodologies.'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <select 
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="h-9 rounded-lg border border-white/10 bg-[#141415] px-3 text-xs text-white focus:border-emerald-500/50 focus:outline-none"
                >
                  <option value="Last 30 Days">Last 30 Days</option>
                  <option value="Last 90 Days">Last 90 Days</option>
                  <option value="Year to Date">Year to Date</option>
                </select>
                <button className="h-9 rounded-lg bg-white text-black px-4 text-xs font-medium hover:bg-slate-200 transition-colors">
                  Export Report
                </button>
              </div>
            </div>

            {activeTab === 'overview' && (
              <>
                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <KpiCard 
                title="Total 911 Calls" 
                value={totalCalls.toLocaleString()} 
                trend="+4.2%" 
                trendUp={false} 
                subtitle="vs previous 30 days"
                icon={<Activity className="text-blue-400" size={20} />}
              />
              <KpiCard 
                title="Avg Misalignment Index" 
                value={`+${avgMisalignment.toFixed(1)}`} 
                trend="Worsening" 
                trendUp={false} 
                subtitle="Perception is worse than reality"
                icon={<MessageSquareWarning className="text-amber-400" size={20} />}
              />
              <KpiCard 
                title="Critical Districts" 
                value={criticalDistricts.toString()} 
                trend="Action Required" 
                trendUp={false} 
                subtitle="Misalignment > 15 points"
                icon={<AlertTriangle className="text-rose-400" size={20} />}
              />
              <KpiCard 
                title="Public Sentiment" 
                value="68/100" 
                trend="Improving" 
                trendUp={true} 
                subtitle="Bright Data MCP"
                icon={<TrendingUp className="text-emerald-400" size={20} />}
              />
            </div>

            {/* Charts Row 1: Scatter & Map */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Scatter Plot: Reality vs Perception */}
              <div className="rounded-2xl border border-white/10 bg-[#141415] p-5 flex flex-col">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-white">Reality vs Perception</h3>
                    <p className="text-xs text-slate-400">Districts above the line feel less safe than they are.</p>
                  </div>
                </div>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis 
                        type="number" 
                        dataKey="actualSafetyScore" 
                        name="Actual Safety Risk" 
                        domain={[0, 100]} 
                        stroke="#64748b" 
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis 
                        type="number" 
                        dataKey="perceptionScore" 
                        name="Perceived Risk" 
                        domain={[0, 100]} 
                        stroke="#64748b" 
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                      />
                      <RechartsTooltip 
                        cursor={{ strokeDasharray: '3 3', stroke: 'rgba(255,255,255,0.1)' }}
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload as DistrictData;
                            return (
                              <div className="rounded-lg border border-white/10 bg-[#1A1A1C] p-3 shadow-xl">
                                <p className="font-medium text-white mb-1">{data.name}</p>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                                  <span className="text-slate-400">Actual Risk:</span>
                                  <span className="text-white font-mono">{data.actualSafetyScore}</span>
                                  <span className="text-slate-400">Perceived:</span>
                                  <span className="text-white font-mono">{data.perceptionScore}</span>
                                  <span className="text-slate-400">Misalignment:</span>
                                  <span className={cn("font-mono", data.misalignmentIndex > 0 ? "text-rose-400" : "text-emerald-400")}>
                                    {data.misalignmentIndex > 0 ? '+' : ''}{data.misalignmentIndex}
                                  </span>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <ReferenceLine x={50} stroke="rgba(255,255,255,0.1)" strokeDasharray="3 3" />
                      <ReferenceLine y={50} stroke="rgba(255,255,255,0.1)" strokeDasharray="3 3" />
                      {/* Diagonal line representing perfect alignment */}
                      <ReferenceLine segment={[{ x: 0, y: 0 }, { x: 100, y: 100 }]} stroke="rgba(255,255,255,0.2)" />
                      <Scatter data={MOCK_DISTRICTS} onClick={(e) => setSelectedDistrict(e as any)}>
                        {MOCK_DISTRICTS.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.misalignmentIndex > 15 ? '#f43f5e' : entry.misalignmentIndex < -10 ? '#10b981' : '#3b82f6'} 
                            className="cursor-pointer hover:opacity-80 transition-opacity"
                          />
                        ))}
                      </Scatter>
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* District Map */}
              <div className="rounded-2xl border border-white/10 bg-[#141415] p-5 flex flex-col">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-white">Geographic Distribution</h3>
                    <p className="text-xs text-slate-400">Select a district to view details.</p>
                  </div>
                </div>
                <div className="h-[300px] w-full">
                  <DistrictMap 
                    districts={MOCK_DISTRICTS} 
                    selectedDistrict={selectedDistrict} 
                    onSelect={setSelectedDistrict} 
                  />
                </div>
              </div>
            </div>

            {/* Charts Row 2: Time Series & Selected Details */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Time Series Trend */}
              <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-[#141415] p-5">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-white">30-Day Trend: Calls vs Sentiment</h3>
                    <p className="text-xs text-slate-400">Citywide aggregate tracking.</p>
                  </div>
                </div>
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={TIME_SERIES_DATA} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis 
                        dataKey="date" 
                        stroke="#64748b" 
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(val) => val.substring(5)}
                      />
                      <YAxis yAxisId="left" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis yAxisId="right" orientation="right" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: '#1A1A1C', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                        itemStyle={{ fontSize: '12px' }}
                        labelStyle={{ color: '#94a3b8', fontSize: '12px', marginBottom: '4px' }}
                      />
                      <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                      <Line yAxisId="left" type="monotone" dataKey="actualCalls" name="911 Calls" stroke="#3b82f6" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                      <Line yAxisId="right" type="monotone" dataKey="sentimentScore" name="Negative Sentiment" stroke="#f43f5e" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Selected District Details or List */}
              <div className="rounded-2xl border border-white/10 bg-[#141415] p-5 flex flex-col">
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-white">District Focus</h3>
                  <p className="text-xs text-slate-400">Detailed metrics for selected area.</p>
                </div>
                
                {selectedDistrict ? (
                  <div className="flex-1 flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-semibold text-white">{selectedDistrict.name}</h4>
                      <button 
                        onClick={() => setSelectedDistrict(null)}
                        className="text-[10px] text-slate-400 hover:text-white uppercase tracking-wider"
                      >
                        Clear
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-lg bg-white/5 p-3">
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Actual Risk</p>
                        <p className="text-xl font-mono text-white">{selectedDistrict.actualSafetyScore}</p>
                      </div>
                      <div className="rounded-lg bg-white/5 p-3">
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Perceived Risk</p>
                        <p className="text-xl font-mono text-white">{selectedDistrict.perceptionScore}</p>
                      </div>
                    </div>

                    <div className="rounded-lg border border-white/5 bg-white/5 p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs text-slate-400">Misalignment</span>
                        <span className={cn(
                          "text-sm font-mono font-medium px-2 py-0.5 rounded-full",
                          selectedDistrict.misalignmentIndex > 15 ? "bg-rose-500/20 text-rose-400" : 
                          selectedDistrict.misalignmentIndex < -5 ? "bg-emerald-500/20 text-emerald-400" : 
                          "bg-blue-500/20 text-blue-400"
                        )}>
                          {selectedDistrict.misalignmentIndex > 0 ? '+' : ''}{selectedDistrict.misalignmentIndex}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className={cn(
                            "h-full rounded-full",
                            selectedDistrict.misalignmentIndex > 15 ? "bg-rose-500" : 
                            selectedDistrict.misalignmentIndex < -5 ? "bg-emerald-500" : 
                            "bg-blue-500"
                          )}
                          style={{ width: `${Math.min(Math.max((selectedDistrict.misalignmentIndex + 50) / 100 * 100, 0), 100)}%` }}
                        />
                      </div>
                    </div>

                    <div className="mt-auto space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400 flex items-center gap-1.5"><Activity size={14} /> 911 Calls</span>
                        <span className="text-white font-mono">{selectedDistrict.calls911.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400 flex items-center gap-1.5"><MessageSquareWarning size={14} /> Top Issue</span>
                        <span className="text-white">{selectedDistrict.topIssue}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400 flex items-center gap-1.5"><TrendingUp size={14} /> Sentiment</span>
                        <span className={cn(
                          "capitalize",
                          selectedDistrict.sentimentTrend === 'worsening' ? "text-rose-400" :
                          selectedDistrict.sentimentTrend === 'improving' ? "text-emerald-400" :
                          "text-slate-300"
                        )}>{selectedDistrict.sentimentTrend}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col">
                    <div className="flex-1 flex items-center justify-center text-center p-6 border-2 border-dashed border-white/5 rounded-xl">
                      <div>
                        <Map className="mx-auto h-8 w-8 text-slate-600 mb-2" />
                        <p className="text-xs text-slate-400">Select a district on the map or scatter plot to view detailed metrics.</p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <h4 className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-2">Highest Misalignment</h4>
                      <div className="space-y-2">
                        {[...MOCK_DISTRICTS].sort((a, b) => b.misalignmentIndex - a.misalignmentIndex).slice(0, 3).map(d => (
                          <div key={d.id} className="flex items-center justify-between text-xs p-2 rounded bg-white/5 hover:bg-white/10 cursor-pointer transition-colors" onClick={() => setSelectedDistrict(d)}>
                            <span className="text-slate-300">{d.name}</span>
                            <span className="text-rose-400 font-mono">+{d.misalignmentIndex}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Data Grid */}
            <div className="rounded-2xl border border-white/10 bg-[#141415] overflow-hidden">
              <div className="p-5 border-b border-white/10 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-white">District Data Grid</h3>
                  <p className="text-xs text-slate-400">Comprehensive view of all safety signals.</p>
                </div>
                <button className="text-xs text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
                  View Full Table &rarr;
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-white/5 text-slate-400">
                    <tr>
                      <th className="px-5 py-3 font-medium">District</th>
                      <th className="px-5 py-3 font-medium">Population</th>
                      <th className="px-5 py-3 font-medium">911 Calls</th>
                      <th className="px-5 py-3 font-medium">Actual Risk</th>
                      <th className="px-5 py-3 font-medium">Perceived Risk</th>
                      <th className="px-5 py-3 font-medium">Misalignment</th>
                      <th className="px-5 py-3 font-medium">Top Public Concern</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {MOCK_DISTRICTS.map((district) => (
                      <tr key={district.id} className="hover:bg-white/[0.02] transition-colors cursor-pointer" onClick={() => setSelectedDistrict(district)}>
                        <td className="px-5 py-3 font-medium text-white">{district.name}</td>
                        <td className="px-5 py-3 text-slate-400 font-mono">{district.population.toLocaleString()}</td>
                        <td className="px-5 py-3 text-slate-400 font-mono">{district.calls911.toLocaleString()}</td>
                        <td className="px-5 py-3 text-slate-400 font-mono">{district.actualSafetyScore}</td>
                        <td className="px-5 py-3 text-slate-400 font-mono">{district.perceptionScore}</td>
                        <td className="px-5 py-3">
                          <span className={cn(
                            "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-medium",
                            district.misalignmentIndex > 15 ? "bg-rose-500/10 text-rose-400" : 
                            district.misalignmentIndex < -5 ? "bg-emerald-500/10 text-emerald-400" : 
                            "bg-blue-500/10 text-blue-400"
                          )}>
                            {district.misalignmentIndex > 0 ? '+' : ''}{district.misalignmentIndex}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-slate-300">{district.topIssue}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
              </>
            )}

            {activeTab === 'incidents' && (
              <IncidentMapDashboard dateRange={dateRange} />
            )}

            {activeTab === 'traffic' && (
              <TrafficHotspotsDashboard dateRange={dateRange} />
            )}

            {activeTab === 'map' && (
              <div className="h-[calc(100vh-200px)] w-full rounded-2xl border border-white/10 bg-[#141415] overflow-hidden flex flex-col">
                <iframe 
                  src="https://opendata.montgomeryal.gov/apps/09d20d8ee55e4761a04a6e7f0f0193c7/explore" 
                  className="w-full flex-1 border-0 bg-white"
                  title="Montgomery Crime Map"
                />
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="flex flex-col gap-6">
                <div className="rounded-2xl border border-white/10 bg-[#141415] p-5">
                  <div className="flex items-start gap-4">
                    <div className="rounded-lg bg-blue-500/10 p-3 mt-1">
                      <Activity className="h-6 w-6 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-white mb-2">911 Calls as Crash Proxies</h3>
                      <p className="text-sm text-slate-400 leading-relaxed mb-4">
                        Because detailed, per-crash state databases are restricted, we use 911 call data as a real-time indicator of traffic incidents. By filtering for categories like <span className="text-white font-mono text-xs bg-white/10 px-1.5 py-0.5 rounded">ACCIDENT</span>, <span className="text-white font-mono text-xs bg-white/10 px-1.5 py-0.5 rounded">CRASH</span>, and <span className="text-white font-mono text-xs bg-white/10 px-1.5 py-0.5 rounded">TRAFFIC HAZARD</span>, we can map incident density to specific intersections and corridors.
                      </p>
                      <a 
                        href="https://www.montgomeryal.gov/government/city-government/city-departments/emergency-communications-911" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        Learn how Montgomery 911 classifies calls &rarr;
                      </a>
                    </div>
                  </div>
                </div>

                <div className="h-[calc(100vh-320px)] w-full rounded-2xl border border-white/10 bg-[#141415] overflow-hidden flex flex-col">
                  <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
                    <h3 className="text-sm font-medium text-white">Live 911 Calls Explorer</h3>
                  </div>
                  <iframe 
                    src="https://opendata.montgomeryal.gov/datasets/911-calls-1/explore" 
                    className="w-full flex-1 border-0 bg-white"
                    title="Montgomery 911 Calls"
                  />
                </div>
              </div>
            )}

            {activeTab === '311' && (
              <div className="flex flex-col gap-6">
                <div className="rounded-2xl border border-white/10 bg-[#141415] p-5">
                  <div className="flex items-start gap-4">
                    <div className="rounded-lg bg-emerald-500/10 p-3 mt-1">
                      <Users className="h-6 w-6 text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-white mb-2">Community Traffic Complaints</h3>
                      <p className="text-sm text-slate-400 leading-relaxed mb-4">
                        Traffic Engineering Service Requests act as our primary proxy for identifying unsafe driving conditions, poor signage, and visibility issues. Clusters of requests for <span className="text-white font-mono text-xs bg-white/10 px-1.5 py-0.5 rounded">Change Speed Limit</span>, <span className="text-white font-mono text-xs bg-white/10 px-1.5 py-0.5 rounded">Investigate signalized intersection</span>, or <span className="text-white font-mono text-xs bg-white/10 px-1.5 py-0.5 rounded">Street light out</span> highlight community-identified risk zones before crashes even occur.
                      </p>
                      <div className="flex gap-4">
                        <a 
                          href="https://www.montgomeryal.gov/residents/report-an-issue" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
                        >
                          Report a new issue to 311 &rarr;
                        </a>
                        <a 
                          href="https://www.montgomeryal.gov/city-government/departments/neighborhood-services" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
                        >
                          Neighborhood Services Info &rarr;
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="h-[calc(100vh-320px)] w-full rounded-2xl border border-white/10 bg-[#141415] overflow-hidden flex flex-col">
                  <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
                    <h3 className="text-sm font-medium text-white">311 Service Requests Map</h3>
                  </div>
                  <iframe 
                    src="https://opendata.montgomeryal.gov/datasets/received-311-service-requests-1/explore" 
                    className="w-full flex-1 border-0 bg-white"
                    title="Montgomery 311 Service Requests"
                  />
                </div>
              </div>
            )}

            {activeTab === 'sentiment' && (
              <PublicSentimentDashboard />
            )}

            {activeTab === 'responsiveness' && (
              <CityResponsivenessDashboard />
            )}

            {activeTab === 'docs' && (
              <DocumentationDashboard />
            )}

          </div>
        </main>
      </div>
    </div>
  );
}

function NavItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
        active 
          ? "bg-white/10 text-white" 
          : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
      )}
    >
      {icon}
      {label}
    </button>
  );
}

function KpiCard({ title, value, trend, trendUp, subtitle, icon }: { title: string, value: string, trend: string, trendUp: boolean, subtitle: string, icon: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#141415] p-5 relative overflow-hidden group">
      <div className="absolute right-0 top-0 h-24 w-24 -translate-y-8 translate-x-8 rounded-full bg-white/5 blur-2xl group-hover:bg-white/10 transition-colors"></div>
      <div className="flex items-start justify-between mb-4">
        <div className="rounded-lg bg-white/5 p-2">
          {icon}
        </div>
        <span className={cn(
          "text-[10px] font-medium px-2 py-1 rounded-full",
          trendUp ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
        )}>
          {trend}
        </span>
      </div>
      <div>
        <h3 className="text-3xl font-semibold text-white tracking-tight mb-1">{value}</h3>
        <p className="text-sm font-medium text-slate-300">{title}</p>
        <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
      </div>
    </div>
  );
}


