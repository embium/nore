export interface ServerSearchParams {
  page?: number;
  searchQuery?: string;
  pageSize?: number;
}

export class Client {
  url: string;
  apiKey: string;

  constructor() {
    this.url = 'https://registry.smithery.ai';
    this.apiKey = 'db939eab-42bf-4e6e-af14-f216e95b9bee';
  }

  async getServers(params: ServerSearchParams = {}) {
    const { page = 1, searchQuery = '', pageSize = 24 } = params;

    // Build the query string
    let query = 'is:local';
    if (searchQuery) {
      // Add the search query to the existing query
      query += ` ${searchQuery}`;
    }

    const response = await fetch(
      `${this.url}/servers?q=${encodeURIComponent(query)}&pageSize=${pageSize}&page=${page}`,
      {
        headers: {
          Authorization: 'Bearer ' + this.apiKey,
        },
      }
    );
    const data = await response.json();
    return data;
  }

  async getServer(name: string) {
    const response = await fetch(`${this.url}/servers/${name}`);
    const data = await response.json();
    return data;
  }
}
