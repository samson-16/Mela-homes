import { useAuth } from "./auth-context";

export const useAuthenticatedFetch = () => {
  const { token, refreshToken, logout } = useAuth();

  const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
    let currentToken = token;

    const makeRequest = async (authToken: string) => {
      return fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${authToken}`,
        },
      });
    };

    if (!currentToken) {
      throw new Error("No authentication token available");
    }

    let response = await makeRequest(currentToken);

    // If we get a 401, try to refresh the token
    if (response.status === 401) {
      const newToken = await refreshToken();
      if (newToken) {
        currentToken = newToken;
        response = await makeRequest(currentToken);
      } else {
        logout();
        throw new Error("Authentication failed");
      }
    }

    return response;
  };

  return authenticatedFetch;
};
