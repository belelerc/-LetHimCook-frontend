import React, { useState, useEffect } from 'react';
import axios from 'axios';

function RecipesList() {
  // useState hook to manage detected ingredients and fetched recipes
  const [recipes, setRecipes] = useState([]); // Stores recipes fetched from the backend
  const [detectedIngredients, setDetectedIngredients] = useState([]); // Stores the ingredients detected from the uploaded image

  // Function to handle file uploads and trigger ingredient detection
  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0]; // Gets the uploaded file
    const formData = new FormData(); // Create a new FormData object to send the file
    formData.append('image', selectedFile); // Attach the file to the formData

    // Send the file to the backend for ingredient detection
    axios.post('http://localhost:4000/detect-ingredients', formData, {
      headers: { 'Content-Type': 'multipart/form-data' } // Specify that we're sending a file
    })
    .then(response => {
      // List of keywords to filter out UI-related words that shouldn't be part of ingredients
      const uiKeywords = ["Choose File", "Zutaten erkennen", "Handgeschriebene Zutaten", "Neue Zutat hinzufügen", "Erkannte Zutaten", "Entfernen"];
      
      // Filtering out any numbers or UI-related keywords from the detected ingredients
      const cleanedIngredients = response.data.detectedIngredients
        .filter(ingredient => !/\d/.test(ingredient) && !uiKeywords.includes(ingredient.trim())); // Removing numbers and irrelevant words

      setDetectedIngredients(cleanedIngredients); // Update the state with the cleaned ingredients
    })
    .catch(error => {
      // Logs an error if something goes wrong during the ingredient detection
      console.error("Fehler bei der Bilderkennung!", error);
    });
  };

  // Function to remove an ingredient from the list
  const removeIngredient = (index) => {
    // Creates a new array by removing the ingredient at the specified index
    const updatedIngredients = detectedIngredients.filter((_, i) => i !== index);
    setDetectedIngredients(updatedIngredients); // Updates the state with the modified array
  };

  // Function to add a new ingredient to the list
  const addIngredient = (newIngredient) => {
    // Adds the new ingredient to the existing array
    const updatedIngredients = [...detectedIngredients, newIngredient];
    setDetectedIngredients(updatedIngredients); // Updates the state with the new ingredient added
  };

  // Function to update an existing ingredient in the list
  const updateIngredient = (index, newValue) => {
    // Creates a copy of the ingredients array and updates the ingredient at the specified index
    const updatedIngredients = [...detectedIngredients];
    updatedIngredients[index] = newValue;
    setDetectedIngredients(updatedIngredients); // Updates the state with the modified ingredient
  };

  // useEffect hook to fetch recipes whenever detectedIngredients changes
  useEffect(() => {
    // Only fetch recipes if there are ingredients detected
    if (detectedIngredients.length > 0) {
      axios.post('http://localhost:4000/recipes', { ingredients: detectedIngredients }) // Send the detected ingredients to the backend
        .then(response => {
          setRecipes(response.data); // Updates the state with the fetched recipes
        })
        .catch(error => {
          console.error("Fehler beim Abrufen der Rezepte!", error); // Logs an error if recipe fetching fails
        });
    }
  }, [detectedIngredients]); // Dependency on detectedIngredients, so it runs when ingredients are updated

  return (
    <div>
      <h2>Simply scan your shopping list:</h2>
      {/* File input for uploading an image of ingredients */}
      <input type="file" onChange={handleFileChange} />

      <h3>Items:</h3>
      {/* List of detected ingredients with editable input fields */}
      <ul style={{ listStyleType: 'none' }}>
        {detectedIngredients.map((ingredient, index) => (
          <li key={index}>
            <input
              type="text"
              value={ingredient} // Display the current ingredient value
              onChange={(e) => updateIngredient(index, e.target.value)} // Update ingredient on change
            />
            <button onClick={() => removeIngredient(index)}>Remove</button> {/* Button to remove ingredient */}
          </li>
        ))}
      </ul>
      {/* Button to add a new empty ingredient */}
      <button onClick={() => addIngredient('')}>Add new item</button>

      <h3>Recipes:</h3>
      {/* List of recipes fetched from the backend */}
      <ul className="recipe-list">
        {recipes.map((recipe) => (
          <li key={recipe.id} className="recipe-card">
            {/* Display the recipe image */}
            <img src={recipe.image} alt={recipe.title} width="100%" />
            {/* Display the recipe title */}
            <h4>{recipe.title}</h4>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default RecipesList;