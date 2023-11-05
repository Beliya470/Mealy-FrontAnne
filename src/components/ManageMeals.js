import React, { useState, useEffect } from 'react';
import axiosInstance from '../helpers/axiosConfig';


const api = axios.create({
  baseURL: 'http://localhost:5000',
  headers: {
    Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
  },
});

const ManageMeals = () => {
  const [meals, setMeals] = useState([]);
  const [newMealName, setNewMealName] = useState('');
  const [newMealDescription, setNewMealDescription] = useState('');
  const [newMealPrice, setNewMealPrice] = useState('');
  const [newMealImageUrl, setNewMealImageUrl] = useState('');
  const [editingMeal, setEditingMeal] = useState(null);
  const [setSelectedMeals] = useState([]);
  const [error, setError] = useState('');

  const fetchMeals = async () => {
    const userId = localStorage.getItem('user_id');
    console.log("Fetching meals for user:", userId);

    if (!userId) {
      setError("User ID missing");
      return;
    }
    try {
      const response = await api.get(`/meals?user_id=${userId}`);
      console.log("Fetched meals:", response.data.meals);
      setMeals(response.data.meals);
      setError('');
    } catch (err) {
      console.error("Error while fetching meals:", err);
      setError(err.response && err.response.data.error ? err.response.data.error : 'An error occurred');
    }
  };

  const handleAddMeal = async () => {
    console.log("Attempting to add a new meal...");
    try {
      if (!newMealName || !newMealPrice) {
        setError("Name and Price are required");
        return;
      }

      const requestData = {
        name: newMealName,
        description: newMealDescription || '',
        price: parseFloat(newMealPrice),
        image_url: newMealImageUrl || ''
      };

      console.log("Sending add meal request with data:", requestData);
      const response = await api.post('/meals', requestData);
        
      console.log("Meal added successfully:", response.data);
      setMeals([...meals, response.data]);
      setNewMealName('');
      setNewMealDescription('');
      setNewMealPrice('');
      setNewMealImageUrl('');
      setError('');
    } catch (err) {
      console.error("Error while adding meal:", err);
      setError(err.response && err.response.data.error ? err.response.data.error : 'Failed to add meal');
    }
  };



  const handleEditMeal = (id) => {
    const mealToEdit = meals.find(meal => meal.id === id);
    setEditingMeal(mealToEdit);
  };

  const handleUpdateMeal = async () => {
    try {
      await api.put(`/meals/${editingMeal.id}`, editingMeal);
      fetchMeals();
      setEditingMeal(null);
    } catch (err) {
      console.log(err);
      setError(err.response && err.response.data.error ? err.response.data.error : 'Failed to add meal');

    }
  };

  const handleDeleteMeal = async (id) => {
    try {
      await api.delete(`/meals/${id}`);
      fetchMeals();
    } catch (err) {
      console.log(err);
      setError(err.response && err.response.data.error ? err.response.data.error : 'Failed to add meal');

    }
  };

  const handleSelectMeal = (id) => {
    setSelectedMeals(prevState => [...prevState, id]);
  };

  useEffect(() => {
    fetchMeals();
  }, []);

  return (
    <div>
      <h1>Manage Meals</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div>
        <input 
          type="text" 
          value={newMealName} 
          onChange={(e) => setNewMealName(e.target.value)} 
          placeholder="New Meal Name" 
        />
        <input 
          type="text"
          value={newMealDescription}
          onChange={(e) => setNewMealDescription(e.target.value)}
          placeholder="Meal Description"
        />
        <input 
          type="number" 
          value={newMealPrice} 
          onChange={(e) => setNewMealPrice(e.target.value)} 
          placeholder="Price" 
        />
        <input 
          type="text" 
          value={newMealImageUrl}
          onChange={(e) => setNewMealImageUrl(e.target.value)}
          placeholder="Image URL"
        />
        <button onClick={handleAddMeal}>Add Meal</button>
      </div>
      <ul>
        {meals.map((meal) => (
          <li key={meal.id}>
            {editingMeal && editingMeal.id === meal.id ? (
              <>
                <input 
                  type="text" 
                  value={editingMeal.name} 
                  onChange={(e) => setEditingMeal({ ...editingMeal, name: e.target.value })}
                />
                <button onClick={handleUpdateMeal}>Update</button>
                <button onClick={() => setEditingMeal(null)}>Cancel</button>
              </>
            ) : (
              <>
                {meal.name}
                <button onClick={() => handleEditMeal(meal.id)}>Edit</button>
                <button onClick={() => handleDeleteMeal(meal.id)}>Delete</button>
                <button onClick={() => handleSelectMeal(meal.id)}>Select for Menu</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ManageMeals;
