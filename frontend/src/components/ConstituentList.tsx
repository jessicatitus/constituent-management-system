import React, { useState, useMemo } from 'react';
import { Constituent } from '../types/constituent';

interface ConstituentListProps {
  constituents: Constituent[];
  token: string;
}

type SortField = 'name' | 'email' | 'location';
type SortDirection = 'asc' | 'desc';

const ConstituentList: React.FC<ConstituentListProps> = ({ constituents, token }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredAndSortedConstituents = useMemo(() => {
    let filtered = constituents;

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(c => 
        c.firstName.toLowerCase().includes(term) ||
        c.lastName.toLowerCase().includes(term) ||
        c.email.toLowerCase().includes(term) ||
        c.city.toLowerCase().includes(term) ||
        c.state.toLowerCase().includes(term)
      );
    }

    // Apply sorting
    return [...filtered].sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'name':
          comparison = `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
          break;
        case 'email':
          comparison = a.email.localeCompare(b.email);
          break;
        case 'location':
          comparison = `${a.street}, ${a.city}, ${a.state}`.localeCompare(`${b.street}, ${b.city}, ${b.state}`);
          break;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [constituents, searchTerm, sortField, sortDirection]);

  const handleExport = async () => {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('from', startDate);
      if (endDate) params.append('to', endDate);
      
      const response = await fetch(`http://localhost:3001/constituents/export?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Export failed');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'constituents.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting constituents:', error);
    }
  };

  return (
    <div className="mt-2 w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Constituents</h2>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="text-gray-500">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Export CSV
          </button>
        </div>
      </div>
      
      {/* Search Controls */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search constituents..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="bg-white shadow-md rounded-lg">
        <div className="overflow-x-auto">
          <div className="max-h-[60vh] overflow-y-auto">
            <table className="min-w-[600px] divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th
                    className="w-[33%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('name')}
                  >
                    Name {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th
                    className="w-[33%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('email')}
                  >
                    Email {sortField === 'email' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th
                    className="w-[33%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('location')}
                  >
                    Location {sortField === 'location' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAndSortedConstituents.map((constituent) => (
                  <tr key={constituent.id}>
                    <td className="w-[33%] px-4 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {constituent.firstName} {constituent.lastName}
                      </div>
                    </td>
                    <td className="w-[33%] px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {constituent.email}
                    </td>
                    <td className="w-[33%] px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {constituent.street}, {constituent.city}, {constituent.state} {constituent.zipCode}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConstituentList; 