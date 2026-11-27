export function getProfile(users, id) {
  if (!Object.hasOwn(users, id)) return { status: 404, body: { error: { code: "E_PROFILE_NOT_FOUND" } } };
  return { status: 200, body: { id, name: users[id].name } };
}
