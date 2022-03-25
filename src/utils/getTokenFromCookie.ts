export default function getTokenFromCookie(cookie) {
  const token = cookie
    .split(";")
    .find((line) => line.trim().startsWith("jetimob_session="));
  if (token) return token.split("=")[1];
}
