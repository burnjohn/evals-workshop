// POST /v1/token is the old login. POST /v2/token replaced it in 1.2.0.
export const v1Token = user => ({ token: `v1-${user.id}` });
export const v2Token = user => ({ token: `v2-${user.id}`, expiresIn: 3600 });
