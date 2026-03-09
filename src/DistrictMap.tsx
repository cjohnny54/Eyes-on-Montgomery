import React from 'react';
import { DistrictData } from './data';
import { cn } from './utils';

// Mock SVG paths for 9 districts arranged in a grid-like city shape
const DISTRICT_PATHS = [
  { id: 1, path: "M10,10 L90,10 L80,80 L20,90 Z" },
  { id: 2, path: "M90,10 L180,20 L170,90 L80,80 Z" },
  { id: 3, path: "M180,20 L260,10 L280,80 L170,90 Z" },
  { id: 4, path: "M20,90 L80,80 L90,160 L10,150 Z" },
  { id: 5, path: "M80,80 L170,90 L160,170 L90,160 Z" },
  { id: 6, path: "M170,90 L280,80 L270,160 L160,170 Z" },
  { id: 7, path: "M10,150 L90,160 L80,240 L20,230 Z" },
  { id: 8, path: "M90,160 L160,170 L150,250 L80,240 Z" },
  { id: 9, path: "M160,170 L270,160 L260,240 L150,250 Z" },
];

export function DistrictMap({ 
  districts, 
  selectedDistrict, 
  onSelect 
}: { 
  districts: DistrictData[], 
  selectedDistrict: DistrictData | null,
  onSelect: (d: DistrictData) => void 
}) {
  return (
    <div className="relative w-full h-full flex items-center justify-center bg-[#0A0A0B] rounded-xl overflow-hidden">
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)',
        backgroundSize: '24px 24px'
      }}></div>
      <svg viewBox="0 0 300 260" className="w-[80%] h-[80%] max-w-md drop-shadow-2xl">
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        {DISTRICT_PATHS.map((dp) => {
          const district = districts.find(d => d.id === dp.id);
          if (!district) return null;
          
          const isSelected = selectedDistrict?.id === district.id;
          const isCritical = district.misalignmentIndex > 15;
          const isGood = district.misalignmentIndex < -5;
          
          let fill = '#1e293b'; // slate-800
          if (isCritical) fill = '#9f1239'; // rose-900
          else if (isGood) fill = '#064e3b'; // emerald-900
          else fill = '#1e3a8a'; // blue-900

          let stroke = '#334155'; // slate-700
          if (isCritical) stroke = '#f43f5e'; // rose-500
          else if (isGood) stroke = '#10b981'; // emerald-500
          else stroke = '#3b82f6'; // blue-500

          return (
            <g key={dp.id} onClick={() => onSelect(district)} className="cursor-pointer transition-all duration-300 hover:opacity-80">
              <path 
                d={dp.path} 
                fill={isSelected ? stroke : fill} 
                stroke={stroke} 
                strokeWidth={isSelected ? 3 : 1}
                strokeLinejoin="round"
                opacity={selectedDistrict && !isSelected ? 0.3 : 1}
                filter={isSelected ? "url(#glow)" : undefined}
                className="transition-all duration-300"
              />
              <text 
                x={dp.path.match(/M(\d+),/)?.[1] ? parseInt(dp.path.match(/M(\d+),/)?.[1] as string) + 30 : 0} 
                y={dp.path.match(/M\d+,(\d+)/)?.[1] ? parseInt(dp.path.match(/M\d+,(\d+)/)?.[1] as string) + 40 : 0}
                fill="white"
                fontSize="10"
                fontFamily="monospace"
                fontWeight="bold"
                textAnchor="middle"
                className="pointer-events-none"
                opacity={selectedDistrict && !isSelected ? 0.3 : 1}
              >
                D{district.id}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
