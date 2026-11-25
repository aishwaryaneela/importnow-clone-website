const paths = {
  search: '<circle cx="10.5" cy="10.5" r="7"/><path d="m16 16 5 5M7 10.5h7m-3.5-3.5v7"/>',
  factory: '<path d="M3 21V10l6 3V8l6 4V4h6v17ZM7 17h2m3 0h2m3 0h1"/>',
  shield: '<path d="m12 3 8 3v6c0 4-3 8-8 10-5-2-8-6-8-10V6ZM8 12l3 3 5-6"/>',
  ship: '<path d="m3 16 3 5h12l3-5-9-3ZM6 15V8h12v7M9 8V4h6v4M2 23q2-2 5 0t5 0t5 0t5 0"/>',
  doc: '<path d="M6 3h8l5 5v13H6ZM14 3v5h5M9 12h7m-7 4h7"/>',
  truck: '<path d="M2 5h12v12H2ZM14 9h4l4 5v3h-8"/><circle cx="6" cy="18" r="2"/><circle cx="18" cy="18" r="2"/>',
  sofa: '<path d="M5 11V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v4M3 11h18v6H3ZM5 17v3m14-3v3"/>',
  phone: '<rect x="6" y="2" width="12" height="20" rx="2"/><path d="M11 18h2"/>',
  scooter: '<circle cx="5" cy="17" r="4"/><circle cx="19" cy="17" r="4"/><path d="m5 17 4-8h6l4 8M9 6h3"/>',
  bulb: '<path d="M9 18h6m-5 3h4M12 3a6 6 0 0 0-3.5 11v2h7v-2A6 6 0 0 0 12 3Z"/>',
  market: '<path d="M2 4h3l3 11h10l3-9H6"/><circle cx="9" cy="20" r="1"/><circle cx="18" cy="20" r="1"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2v4m0 12v4M2 12h4m12 0h4M5 5l3 3m8 8 3 3M5 19l3-3m8-8 3-3"/>',
  home: '<path d="m3 8 9-5 9 5v13H3ZM9 21v-7h6v7M6 10h2m8 0h2"/>',
  food: '<path d="M3 11h18a9 9 0 0 1-18 0ZM8 4v3m4-5v5m4-3v3"/>',
  language: '<path d="M3 5h11M8 2v3m-3 0c1 5 4 8 8 9M12 5c-1 5-4 8-9 10m11 6 4-10 4 10m-6.5-4h5"/>',
  pin: '<path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z"/><circle cx="12" cy="10" r="2.5"/>',
  desk: '<path d="M3 8h18v3H3ZM5 11v10m14-10v10M10 8V5h4v3"/>',
  instagram: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17.5 6.5h.01"/>',
  call: '<path d="M5 3h4l2 5-3 2a15 15 0 0 0 6 6l2-3 5 2v4a2 2 0 0 1-2 2A18 18 0 0 1 3 5a2 2 0 0 1 2-2Z"/>',
  whatsapp: '<path d="M20.5 11.5a9 9 0 0 1-13.3 8L2 21l1.5-5.2a9 9 0 1 1 17-4.3Z"/><path d="m8 7-1 2c1 4 3 6 7 7l2-1-2-3-2 1-2-2 1-2Z"/>',
  route: '<circle cx="5" cy="18" r="3"/><circle cx="19" cy="5" r="3"/><path d="M8 18h7a4 4 0 0 0 0-8H9a3 3 0 0 1 0-6h7"/>',
  plane: '<path d="m22 2-20 8 7 3 3 8 4-6 4 3ZM9 13 22 2"/>',
  container: '<rect x="2" y="7" width="20" height="14"/><path d="m8 7 4-5 4 5M6 10v8m4-8v8m4-8v8m4-8v8"/>',
};

export const icon = (name, cls = '') => `<svg class="icon-svg ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.doc}</svg>`;
export const flag = (country) => country === 'cn'
  ? '<svg class="flag" viewBox="0 0 30 20" aria-label="China"><rect width="30" height="20" fill="#de2910"/><path d="m6 3 1.2 3.5H11L8 8.7l1.1 3.5L6 10l-3.1 2.2L4 8.7 1 6.5h3.8Z" fill="#ffde00"/><g fill="#ffde00"><circle cx="12" cy="3" r=".8"/><circle cx="14" cy="6" r=".8"/><circle cx="14" cy="9" r=".8"/><circle cx="12" cy="12" r=".8"/></g></svg>'
  : '<svg class="flag" viewBox="0 0 30 20" aria-label="India"><rect width="30" height="20" fill="white"/><path d="M0 0h30v6.67H0Z" fill="#ff9933"/><path d="M0 13.33h30V20H0Z" fill="#138808"/><circle cx="15" cy="10" r="2.5" fill="none" stroke="#000080" stroke-width=".7"/><path d="M12.5 10h5M15 7.5v5m-1.8-4.3 3.6 3.6m0-3.6-3.6 3.6" stroke="#000080" stroke-width=".4"/></svg>';
export const logo = '<span>IMP</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 3a9 9 0 1 0 8 0M12 1v11M8 8l4 4 4-4" fill="none" stroke="currentColor" stroke-width="3.3"/></svg><span>RTNOW</span>';
