const apiBaseUrl = import.meta.env.VITE_API_URL || '/api';

export interface ApiHealth {
  status: string;
}

export async function getApiHealth(): Promise<ApiHealth> {
  const response = await fetch(`${apiBaseUrl}/health`);

  if (!response.ok) {
    throw new Error(`Health check failed with status ${response.status}`);
  }

  return response.json();
}
