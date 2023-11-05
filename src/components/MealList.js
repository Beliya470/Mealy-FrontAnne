import React, { useEffect, useState } from 'react';
import axiosInstance from '../helpers/axiosConfig.js';

import { jwtDecode } from 'jwt-decode';


const MealList = () => {
  const [meals, setMeals] = useState([]);
  const [formData, setFormData] = useState({ name: '', description: '', price: '', image_url: '', admin_id: '' });
  const [error, setError] = useState(null);

  const fetchMeals = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if(token) {
        const decodedToken = jwtDecode(token); // Decode the token to get the payload
        setFormData(formData => ({ ...formData, admin_id: decodedToken.admin_id })); // Set the admin_id in the formData
      }
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axiosInstance.get('http://localhost:5000/meals', config);
      setMeals(response.data.meals);
    } catch (error) {
      setError("Error fetching meals");
    }
  };

  const addMeal = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axiosInstance.post('/meals', formData, config);
      alert(response.data.message);
      fetchMeals();
    } catch (error) {
      setError("Error adding meal");
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    addMeal();
  };

  useEffect(() => {
    fetchMeals();
    // This will run once upon component mounting
  }, []);

  return (
    <div>
      <h1>Manage Meals</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Name: </label>
          <input type="text" name="name" onChange={handleChange} />
        </div>
        <div>
          <label>Description: </label>
          <input type="text" name="description" onChange={handleChange} />
        </div>
        <div>
          <label>Price: </label>
          <input type="number" name="price" onChange={handleChange} />
        </div>
        <div>
          <label>Image URL: </label>
          <input type="text" name="image_url" onChange={handleChange} />
        </div>
        <div>
          <label>Admin ID: </label>
          <input type="text" name="admin_id" onChange={handleChange} />
        </div>
        <button type="submit">Add Meal</button>
      </form>
      {error && <p>{error}</p>}
      <h2>Meals</h2>
      <ul>
        {meals.map(meal => (
          <li key={meal.id}>
            <p>Name: {meal.name}</p>
            <p>Description: {meal.description}</p>
            <p>Price: ${meal.price}</p>
            <img src={meal.image_url} alt={meal.name} />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MealList;
