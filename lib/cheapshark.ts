const BASE_URL = '/api';

export async function getDeals(params: Record<string, string> = {}): Promise<Response> {
  const searchParams = new URLSearchParams({
    storeID: '1',
    pageSize: '20',
    sortBy: 'Deal Rating',
    onSale: '1',
    ...params,
  });
  return fetch(`${BASE_URL}/deals?${searchParams}`);
}

export async function searchGames(title: string, limit = 10): Promise<Response> {
  const searchParams = new URLSearchParams({ title, limit: String(limit) });
  return fetch(`${BASE_URL}/games?${searchParams}`);
}

export async function getGameDetails(gameId: string): Promise<Response> {
  const searchParams = new URLSearchParams({ id: gameId });
  return fetch(`${BASE_URL}/games?${searchParams}`);
}

export async function getGameBySteamAppId(steamAppId: string): Promise<Response> {
  const searchParams = new URLSearchParams({ steamAppID: steamAppId });
  return fetch(`${BASE_URL}/games?${searchParams}`);
}
