import { useState, useEffect } from 'react';

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const useAuth = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setCurrentUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    const response = await fetch(`${apiUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('token', data.access_token);
      const userResponse = await fetch(`${apiUrl}/users/me`, {
        headers: { 'Authorization': `Bearer ${data.access_token}` },
      });
      if (userResponse.ok) {
        const user = await userResponse.json();
        localStorage.setItem('user', JSON.stringify(user));
        setToken(data.access_token);
        setCurrentUser(user);
      } else {
        throw new Error('Failed to get user info');
      }
    } else {
      const errorText = await response.text();
      throw new Error(errorText || 'Login failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setCurrentUser(null);
  };

  return { login, logout, currentUser, token, isLoggedIn: !!currentUser, isLoading };
};