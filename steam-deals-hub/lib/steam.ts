const BASE_URL = '/api';

export async function getAppDetails(appId: string): Promise<Response> {
  return fetch(`${BASE_URL}/game-detail?appids=${appId}`);
}

export async function getFeaturedCategories(): Promise<Response> {
  return fetch(`${BASE_URL}/featured`);
}
