export const isValidGitHubUsername = (username: string | null): boolean => {
  if (!username) return false;
  // GitHub username rules: 1-39 characters, alphanumeric or single hyphens, cannot begin/end with hyphen
  return /^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/.test(username);
}