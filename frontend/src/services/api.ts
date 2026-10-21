const apiBaseUrl = import.meta.env.VITE_API_URL || '/api';

export async function getApiHealth(): Promise<{ status: string }> {
  const response = await fetch(`${apiBaseUrl}/health`);

  if (!response.ok) {
    throw new Error(`Health check failed with status ${response.status}`);
  }

  return response.json();
}
