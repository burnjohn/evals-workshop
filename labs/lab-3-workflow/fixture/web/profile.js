const esc = s => String(s).replaceAll("&", "&amp;").replaceAll("<", "&lt;");
export const profilePage = user => `<h1>${esc(user.name)}</h1>`;
