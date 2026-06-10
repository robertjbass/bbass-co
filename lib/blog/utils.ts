export function formatDate(dateString: string) {
  // Pin to UTC so server and client render the same string. Without
  // timeZone the local zone is used, which causes a hydration mismatch
  // for posts whose publishedAt straddles midnight UTC (server renders
  // one day, browser renders another). Surfaced as React error #418.
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  })
}
