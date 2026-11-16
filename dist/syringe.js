const stockedSizes = [1, 3, 5, 10, 20];
const syringeIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m16 3 5 5m-3-3-4 4m-2-3 6 6m-2-2-8 8H6v-2l8-8m-8 10-3 3m8-8 2 2m1-5 2 2"/></svg>';

export function syringeSize(volume) {
  if (!Number.isFinite(volume) || volume <= 0) return null;
  return stockedSizes.find(size => volume <= size + 1e-10) ?? null;
}

export function pediatricSyringe(volume, {route = '', mode = ''} = {}) {
  if (!Number.isFinite(volume) || volume <= 0) return '';
  const size = syringeSize(volume);
  let label = size ? `${size} mL syringe` : 'Volume exceeds stocked syringe sizes';
  if (mode === 'transfusion') return '';
  if (mode === 'bolus' && volume > 10) label = '10 mL syringe + bag + stopcock';
  if (mode === 'txa' && volume > 10) label = '10 mL syringe + bag + stopcock for prep';
  if (!mode && /^PO$/.test(route) && size) label = `${size} mL oral syringe`;
  if (!mode && /^IN$/.test(route) && size) label += ' + atomizer';
  return `<small class="syringe-size">${syringeIcon}${label}</small>`;
}
