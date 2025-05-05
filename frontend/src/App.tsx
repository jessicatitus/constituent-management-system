import React, { useState, useEffect } from 'react';
import ConstituentForm from './components/ConstituentForm';
import ConstituentList from './components/ConstituentList';
import ConstituentImport from './components/ConstituentImport';
import LoginForm from './components/LoginForm';
import { Constituent } from './types/constituent';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

const App: React.FC = () => {
  const [constituents, setConstituents] = useState<Constituent[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Check for saved auth state
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
  }, []);

  useEffect(() => {
    if (token) {
      fetchConstituents();
    }
  }, [token]);

  const fetchConstituents = async () => {
    try {
      const response = await fetch('http://localhost:3001/constituents', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setConstituents(data);
    } catch (error) {
      console.error('Error fetching constituents:', error);
    }
  };

  const handleAddConstituent = async (constituent: Omit<Constituent, 'id'>) => {
    try {
      const response = await fetch('http://localhost:3001/constituents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(constituent),
      });
      const updatedConstituent = await response.json();
      
      setConstituents(prev => {
        const index = prev.findIndex(c => c.email === updatedConstituent.email);
        if (index !== -1) {
          const newConstituents = [...prev];
          newConstituents[index] = updatedConstituent;
          return newConstituents;
        } else {
          return [...prev, updatedConstituent];
        }
      });
    } catch (error) {
      console.error('Error adding constituent:', error);
    }
  };

  const handleLogin = (newToken: string, userData: User) => {
    setToken(newToken);
    setUser(userData);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    setConstituents([]);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  if (!token) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-3xl font-bold text-gray-800">Constituent Management System</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-600">
              Welcome, {user?.firstName} {user?.lastName}
            </span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Logout
            </button>
          </div>
        </div>
        
        {/* Add New Constituent Section */}
        <section className="mb-12">
          <div className="bg-white rounded-lg shadow-md p-8">
            <ConstituentForm onSubmit={handleAddConstituent} />
          </div>
        </section>

        {/* Import Constituents Section */}
        <section className="mb-12">
          <ConstituentImport onImportComplete={fetchConstituents} token={token!} />
        </section>

        {/* Constituents List Section */}
        <section>
          <div className="bg-white rounded-lg shadow-md p-8">
            <ConstituentList constituents={constituents} />
          </div>
        </section>
      </div>
    </div>
  );
};

export default App;