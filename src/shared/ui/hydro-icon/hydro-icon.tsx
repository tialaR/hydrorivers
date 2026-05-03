import type { SVGProps } from 'react';

export type HydroIconName = 'waves' | 'ship' | 'cargo' | 'leaf' | 'coin' | 'route' | 'shield' | 'user' | 'menu' | 'close' | 'sun' | 'moon' | 'anchor' | 'chart' | 'dock' | 'document' | 'check' | 'clock' | 'map' | 'river' | 'globe' | 'chevronDown' | 'filter' | 'users' | 'message' | 'phone' | 'instagram' | 'twitter' | 'info';

const paths: Record<HydroIconName, string[]> = {
  waves: ['M3 8c3 0 3-2 6-2s3 2 6 2 3-2 6-2', 'M3 13c3 0 3-2 6-2s3 2 6 2 3-2 6-2', 'M3 18c3 0 3-2 6-2s3 2 6 2 3-2 6-2'],
  ship: ['M4 14h16l-2.4 4.2A3.5 3.5 0 0 1 14.6 20H9.4a3.5 3.5 0 0 1-3-1.8L4 14Z', 'M6 14V9l4-3h5l3 3v5', 'M9 11h2', 'M14 11h2'],
  cargo: ['M4 8l8-4 8 4-8 4-8-4Z', 'M4 8v8l8 4 8-4V8', 'M12 12v8'],
  leaf: ['M5 19c8 0 14-6 14-14-8 0-14 6-14 14Z', 'M5 19c3-5 7-8 14-14'],
  coin: ['M12 4c4.4 0 8 1.8 8 4s-3.6 4-8 4-8-1.8-8-4 3.6-4 8-4Z', 'M4 8v8c0 2.2 3.6 4 8 4s8-1.8 8-4V8', 'M8 14c1 .6 2.4 1 4 1s3-.4 4-1'],
  route: ['M6 18a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z', 'M18 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z', 'M8.5 13.5 15.5 10.5'],
  shield: ['M12 3 5 6v5c0 5 3.2 8.5 7 10 3.8-1.5 7-5 7-10V6l-7-3Z'],
  user: ['M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z', 'M4 21a8 8 0 0 1 16 0'],
  menu: ['M4 7h16', 'M4 12h16', 'M4 17h16'],
  close: ['M6 6l12 12', 'M18 6 6 18'],
  sun: ['M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z', 'M12 2v2', 'M12 20v2', 'M4.93 4.93l1.41 1.41', 'M17.66 17.66l1.41 1.41', 'M2 12h2', 'M20 12h2', 'M4.93 19.07l1.41-1.41', 'M17.66 6.34l1.41-1.41'],
  moon: ['M21 12.8A8.5 8.5 0 1 1 11.2 3 6.5 6.5 0 0 0 21 12.8Z'],
  anchor: ['M12 3v18', 'M8 7a4 4 0 1 1 8 0', 'M5 14c0 4 3 7 7 7s7-3 7-7', 'M3 14h4', 'M17 14h4'],
  chart: ['M4 19V5', 'M4 19h16', 'M8 15l3-4 3 2 5-7'],
  dock: ['M4 18h16', 'M6 18V8l6-4 6 4v10', 'M9 18v-5h6v5'],
  document: ['M7 3h7l4 4v14H7V3Z', 'M14 3v5h5', 'M9 13h6', 'M9 17h6'],
  check: ['M20 6 9 17l-5-5'],
  clock: ['M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z', 'M12 6v6l4 2'],
  map: ['M9 18 3 21V6l6-3 6 3 6-3v15l-6 3-6-3Z', 'M9 3v15', 'M15 6v15'],
  river: ['M4 4c6 4 10 4 16 0', 'M4 10c6 4 10 4 16 0', 'M4 16c6 4 10 4 16 0', 'M7 20c4-2 6-2 10 0'],
  globe: ['M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z', 'M2 12h20', 'M12 2c3 3 4 6 4 10s-1 7-4 10', 'M12 2c-3 3-4 6-4 10s1 7 4 10'],
  chevronDown: ['m6 9 6 6 6-6'],
  filter: ['M4 6h16', 'M7 12h10', 'M10 18h4'],
  users: ['M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2', 'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z', 'M22 21v-2a4 4 0 0 0-3-3.87', 'M16 3.13a4 4 0 0 1 0 7.75'],
  message: ['M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8Z'],
  phone: ['M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.08 4.18 2 2 0 0 1 4.06 2h3a2 2 0 0 1 2 1.72c.12.9.32 1.77.6 2.6a2 2 0 0 1-.45 2.11L8 9.64a16 16 0 0 0 6.36 6.36l1.21-1.21a2 2 0 0 1 2.11-.45c.83.28 1.7.48 2.6.6A2 2 0 0 1 22 16.92Z'],
  instagram: ['M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Z', 'M16 11.37a4 4 0 1 1-7.9 1.26 4 4 0 0 1 7.9-1.26Z', 'M17.5 6.5h.01'],
  twitter: ['M22 4.01c-.8.36-1.62.6-2.48.71a4.28 4.28 0 0 0 1.88-2.36 8.6 8.6 0 0 1-2.72 1.04 4.28 4.28 0 0 0-7.3 3.9A12.15 12.15 0 0 1 2.56 2.83a4.28 4.28 0 0 0 1.33 5.7 4.24 4.24 0 0 1-1.94-.54v.05a4.28 4.28 0 0 0 3.43 4.19 4.3 4.3 0 0 1-1.93.07 4.29 4.29 0 0 0 4 2.97A8.6 8.6 0 0 1 2 17.14 12.1 12.1 0 0 0 8.56 19c7.87 0 12.18-6.52 12.18-12.17v-.56A8.7 8.7 0 0 0 22 4.01Z'],
  info: ['M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z', 'M12 16v-4', 'M12 8h.01']
};


export function HydroIcon({ name, size = 22, ...props }: SVGProps<SVGSVGElement> & { name: HydroIconName | string; size?: number }) {
  const iconPaths = paths[name as HydroIconName] ?? paths.river;

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      {iconPaths.map((d) => <path key={d} d={d} />)}
    </svg>
  );
}
