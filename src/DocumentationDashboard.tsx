import React from 'react';
import { BookOpen, Database, Map, Link as LinkIcon, Server, Cpu, Globe } from 'lucide-react';

export function DocumentationDashboard() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="rounded-2xl border border-white/10 bg-[#141415] p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
              <BookOpen size={24} />
            </div>
            <h2 className="text-2xl font-semibold text-white">System Documentation</h2>
          </div>
          <p className="text-slate-400 max-w-3xl leading-relaxed">
            This document outlines the architecture, data sources, and methodologies used to power the Montgomery Safety Lens dashboard. It explains how disparate data streams are combined to analyze the gap between actual safety incidents and public perception.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column - Setup & Data Sources */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Setup Section */}
          <section className="rounded-2xl border border-white/10 bg-[#141415] p-6">
            <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
              <Server className="text-blue-400" size={18} />
              Setup & Architecture
            </h3>
            <div className="space-y-4 text-sm text-slate-300">
              <p>
                The application is built using a modern full-stack architecture:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-slate-400">
                <li><strong className="text-slate-200">Frontend:</strong> React 18, Vite, Tailwind CSS, Recharts for data visualization, and Lucide for iconography.</li>
                <li><strong className="text-slate-200">Backend:</strong> Node.js with Express, serving as a proxy for external APIs to prevent CORS issues and protect API keys.</li>
                <li><strong className="text-slate-200">AI Integration:</strong> Google Gemini API (@google/genai) for natural language processing and sentiment analysis.</li>
                <li><strong className="text-slate-200">Data Scraping:</strong> Bright Data API for real-time social media data collection.</li>
              </ul>
              <div className="mt-4 p-4 rounded-lg bg-white/5 border border-white/10 font-mono text-xs">
                <p className="text-emerald-400 mb-2"># Required Environment Variables</p>
                <p>GEMINI_API_KEY=your_gemini_key</p>
                <p>BRIGHT_DATA_API_KEY=your_bright_data_key</p>
                <p>BRIGHT_DATA_COLLECTOR_ID=c_m7z...</p>
              </div>
            </div>
          </section>

          {/* Data Sources Section */}
          <section className="rounded-2xl border border-white/10 bg-[#141415] p-6">
            <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
              <Database className="text-amber-400" size={18} />
              Data Sources & Acquisition
            </h3>
            
            <div className="space-y-6">
              <div className="border-l-2 border-amber-500/30 pl-4">
                <h4 className="text-white font-medium mb-1">1. Montgomery Open Data Portal</h4>
                <p className="text-sm text-slate-400 mb-2">Source: <a href="https://opendata.montgomeryal.gov/" className="text-blue-400 hover:underline" target="_blank" rel="noreferrer">opendata.montgomeryal.gov</a></p>
                <p className="text-sm text-slate-300">
                  <strong>How it was obtained:</strong> Accessed via public ArcGIS REST APIs and embedded iframes provided by the city.
                </p>
                <p className="text-sm text-slate-300 mt-1">
                  <strong>Usage:</strong> Provides the foundational layers for the Live Crime Map, 911 Calls, and 311 Service Requests.
                </p>
              </div>

              <div className="border-l-2 border-emerald-500/30 pl-4">
                <h4 className="text-white font-medium mb-1">2. Social Media Sentiment (X/Twitter)</h4>
                <p className="text-sm text-slate-400 mb-2">Source: Bright Data Web Scraper API</p>
                <p className="text-sm text-slate-300">
                  <strong>How it was obtained:</strong> A custom Express backend route triggers a Bright Data collector job. The job scrapes recent posts related to Montgomery, AL traffic and safety. The raw JSON output is then polled and retrieved.
                </p>
                <p className="text-sm text-slate-300 mt-1">
                  <strong>Usage:</strong> The raw text is fed into the Gemini AI model to extract a normalized "Perception Score" (0-100) and identify trending keywords.
                </p>
              </div>

              <div className="border-l-2 border-blue-500/30 pl-4">
                <h4 className="text-white font-medium mb-1">3. Simulated District Metrics</h4>
                <p className="text-sm text-slate-400 mb-2">Source: Internal Mock Data Generator</p>
                <p className="text-sm text-slate-300">
                  <strong>How it was obtained:</strong> Generated algorithmically to represent the 9 city council districts.
                </p>
                <p className="text-sm text-slate-300 mt-1">
                  <strong>Usage:</strong> Used to calculate the "Misalignment Index" (Perceived Risk minus Actual Risk) to demonstrate the core value proposition of the dashboard.
                </p>
              </div>
            </div>
          </section>

          {/* Map Creation Section */}
          <section className="rounded-2xl border border-white/10 bg-[#141415] p-6">
            <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
              <Map className="text-rose-400" size={18} />
              Map Creation & Integration
            </h3>
            <div className="space-y-4 text-sm text-slate-300">
              <p>
                The maps in this application utilize a hybrid approach, combining embedded official city maps with custom data visualizations.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <h4 className="text-white font-medium mb-2">Official City Maps</h4>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    The <strong>Live Crime Map</strong>, <strong>911 Calls</strong>, and <strong>311 Requests</strong> tabs embed official ArcGIS dashboards from the Montgomery Open Data Portal via iframes. This ensures the data is authoritative, real-time, and requires zero maintenance of spatial databases on our end.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <h4 className="text-white font-medium mb-2">Custom District Map</h4>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    The <strong>District Map</strong> (SVG-based) was created by mapping the 9 City Council districts. It combines the simulated <em>Actual Risk</em> (derived from 911/311 density) with the <em>Perceived Risk</em> (derived from Bright Data/Gemini sentiment analysis) to color-code areas based on their Misalignment Index.
                  </p>
                </div>
              </div>
            </div>
          </section>

        </div>

        {/* Right Column - Diagram & Extra Info */}
        <div className="space-y-6">
          
          {/* Architecture Diagram */}
          <section className="rounded-2xl border border-white/10 bg-[#141415] p-6">
            <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
              <LinkIcon className="text-purple-400" size={18} />
              System Architecture
            </h3>
            
            <div className="relative py-4">
              {/* Diagram Container */}
              <div className="flex flex-col items-center space-y-4">
                
                {/* External Sources */}
                <div className="flex justify-center gap-4 w-full">
                  <div className="flex flex-col items-center text-center w-1/2 p-3 rounded-lg border border-white/10 bg-white/5">
                    <Globe size={20} className="text-blue-400 mb-2" />
                    <span className="text-[10px] font-mono text-slate-400">Montgomery Open Data</span>
                  </div>
                  <div className="flex flex-col items-center text-center w-1/2 p-3 rounded-lg border border-white/10 bg-white/5">
                    <Globe size={20} className="text-amber-400 mb-2" />
                    <span className="text-[10px] font-mono text-slate-400">Social Media (X)</span>
                  </div>
                </div>

                {/* Down Arrows */}
                <div className="flex justify-center gap-16 w-full text-slate-600">
                  <span>↓</span>
                  <span>↓</span>
                </div>

                {/* Processing Layer */}
                <div className="flex justify-center gap-4 w-full">
                  <div className="flex flex-col items-center text-center w-1/2 p-3 rounded-lg border border-white/10 bg-white/5">
                    <span className="text-[10px] font-mono text-slate-400">Direct iFrame Embed</span>
                  </div>
                  <div className="flex flex-col items-center text-center w-1/2 p-3 rounded-lg border border-emerald-500/30 bg-emerald-500/5">
                    <Database size={20} className="text-emerald-400 mb-2" />
                    <span className="text-[10px] font-mono text-slate-400">Bright Data Scraper</span>
                  </div>
                </div>

                {/* Down Arrow for AI */}
                <div className="flex justify-end w-full pr-12 text-slate-600">
                  <span>↓</span>
                </div>

                {/* AI Layer */}
                <div className="flex justify-end w-full">
                  <div className="flex flex-col items-center text-center w-1/2 p-3 rounded-lg border border-purple-500/30 bg-purple-500/5">
                    <Cpu size={20} className="text-purple-400 mb-2" />
                    <span className="text-[10px] font-mono text-slate-400">Gemini AI (Sentiment)</span>
                  </div>
                </div>

                {/* Down Arrows to Frontend */}
                <div className="flex justify-center gap-16 w-full text-slate-600">
                  <span>↓</span>
                  <span>↓</span>
                </div>

                {/* Frontend */}
                <div className="w-full p-4 rounded-lg border border-white/20 bg-white/10 text-center">
                  <h4 className="text-sm font-medium text-white">React Frontend Dashboard</h4>
                  <p className="text-[10px] text-slate-400 mt-1">Combines actual data with AI sentiment to calculate Misalignment Index</p>
                </div>

              </div>
            </div>
          </section>

          {/* Useful Information */}
          <section className="rounded-2xl border border-white/10 bg-[#141415] p-6">
            <h3 className="text-lg font-medium text-white mb-4">Useful Information</h3>
            <ul className="space-y-3 text-sm text-slate-300">
              <li className="flex gap-2">
                <span className="text-emerald-400 mt-0.5">•</span>
                <span><strong>Misalignment Index:</strong> Calculated as <code className="bg-white/10 px-1 py-0.5 rounded text-xs">Perceived Risk - Actual Risk</code>. A positive number means citizens feel less safe than the data suggests.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-emerald-400 mt-0.5">•</span>
                <span><strong>Fallback Mechanism:</strong> If the Bright Data scraper times out or fails (e.g., due to rate limits), the backend automatically asks Gemini to generate a realistic, context-aware fallback sentiment report based on the requested keywords.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-emerald-400 mt-0.5">•</span>
                <span><strong>Proxy Metrics:</strong> Due to restricted access to detailed crash databases, 911 calls (filtered by specific categories) and 311 traffic engineering requests are used as proxies for traffic safety issues.</span>
              </li>
            </ul>
          </section>

        </div>
      </div>
    </div>
  );
}
