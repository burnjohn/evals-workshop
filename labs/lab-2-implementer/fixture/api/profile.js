export function getProfile(users, id) {
  return { status: 200, body: users[id] };
}
