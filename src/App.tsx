/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Activity, AlertTriangle, Map,
  MessageSquareWarning, ShieldAlert, TrendingUp, Users,
  Search, Bell, Settings, Menu, MapPin, Clock
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
import { CityResponsivenessDashboard } from './CityResponsivenessDashboard';
import { ServiceMapDashboard } from './ServiceMapDashboard';

export default function App() {
  const [activeTab, setActiveTab] = useState('incidents');
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
              <h1 className="text-sm font-semibold tracking-tight text-white">Montgomery how we doing?</h1>
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
            <NavItem icon={<MapPin size={16} />} label="District Incidents" active={activeTab === 'incidents'} onClick={() => setActiveTab('incidents')} />
            <NavItem icon={<Users size={16} />} label="311 Service Requests" active={activeTab === '311'} onClick={() => setActiveTab('311')} />
            <NavItem icon={<Clock size={16} />} label="City Responsiveness" active={activeTab === 'responsiveness'} onClick={() => setActiveTab('responsiveness')} />
            <NavItem icon={<MapPin size={16} />} label="Traffic Hotspots" active={activeTab === 'traffic'} onClick={() => setActiveTab('traffic')} />
            <NavItem icon={<MessageSquareWarning size={16} />} label="Public Sentiment" active={activeTab === 'sentiment'} onClick={() => setActiveTab('sentiment')} />
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
                  {activeTab === 'incidents' && 'Montgomery Eyes on our Community'}
                  {activeTab === 'sentiment' && 'Public Sentiment'}
                  {activeTab === '311' && '311 Service Requests'}
                  {activeTab === 'responsiveness' && 'City Responsiveness Metrics'}
                  {activeTab === 'traffic' && 'Traffic Hotspots'}
                </h2>
                <p className="text-sm text-slate-400">
                  {activeTab === 'incidents' && 'Live 311 and code violation incidents mapped to city council districts.'}
                  {activeTab === 'sentiment' && 'Real-time social media and news comment analysis.'}
                  {activeTab === '311' && `A ${dateRange.toLowerCase()} historical analysis of neighborhood service demand.`}
                  {activeTab === 'responsiveness' && `Analyzing 311 resolution speeds for the ${dateRange.toLowerCase()} period.`}
                  {activeTab === 'traffic' && 'Identifying high-priority traffic safety and nuisance areas.'}
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
                  <option value="3 Years">3 Years</option>
                </select>
              </div>
            </div>


            {activeTab === 'incidents' && (
              <IncidentMapDashboard dateRange={dateRange} />
            )}

            {activeTab === 'traffic' && (
              <TrafficHotspotsDashboard dateRange={dateRange} />
            )}

            {activeTab === '311' && (
              <ServiceMapDashboard dateRange={dateRange} />
            )}

            {activeTab === 'sentiment' && (
              <PublicSentimentDashboard />
            )}

            {activeTab === 'responsiveness' && (
              <CityResponsivenessDashboard dateRange={dateRange} />
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


