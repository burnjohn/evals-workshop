// Small UI helpers. Text is escaped.
export const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
export const button = (label, track) => `<button data-track="${track}">${esc(label)}</button>`;
