'use client';

import React, { useState, FormEvent } from 'react';
import { Button } from "../../components/ui/button";

const ListPage = () => {
  const [listName, setListName] = useState('');

  const handleCreateList = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/lists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: listName })
      });
      if (response.ok) {
        // Handle success
        setListName('');
        // Optionally, refresh the list or show a success message
      } else {
        // Handle server errors
        console.error('Failed to create list');
      }
    } catch (error) {
      console.error('An error occurred:', error);
    }
  };

  return (
    <form onSubmit={handleCreateList} className="mt-4">
      <label htmlFor="listName" className="block text-sm font-medium text-gray-700">
        List Name
      </label>
      <input
        type="text"
        id="listName"
        name="listName"
        value={listName}
        onChange={(e) => setListName(e.target.value)}
        required
        className="mt-1 p-2 border border-gray-300 rounded-md w-full"
      />
      <button
        type="submit"
        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md"
      >
        Create List
      </button>
    </form>
  );
};

export default ListPage;