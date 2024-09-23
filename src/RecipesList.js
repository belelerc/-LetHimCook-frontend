import React, { useState, useEffect } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';

function RecipesList() {
  // useState to manage the list of recipes and detected ingredients
  const [recipes, setRecipes] = useState([]);
  const [detectedIngredients, setDetectedIngredients] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null); // Stores details of the currently selected recipe
  const [showModal, setShowModal] = useState(false); // Controls visibility of the modal

  // Function to handle file upload and detect ingredients from an image
  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0]; // Get the uploaded file
    const formData = new FormData(); // Prepare the file for upload
    formData.append('image', selectedFile); // Attach the image file to formData

    // Send the image to the backend for ingredient detection
    axios.post('https://dry-savannah-39543-261e658b7fd9.herokuapp.com/detect-ingredients', formData, {
      headers: { 'Content-Type': 'multipart/form-data' } // Set correct headers for file upload
    })
    .then(response => {
      // Filter out any very short ingredients (e.g., typos)
      const cleanedIngredients = response.data.detectedIngredients.filter(ingredient => ingredient.length > 2);
      setDetectedIngredients(cleanedIngredients); // Update state with the cleaned list of ingredients
    })
    .catch(error => {
      console.error("Fehler bei der Bilderkennung!", error); // Log any errors that occur
    });
  };

  // Function to fetch details of a specific recipe when clicked
  const fetchRecipeDetails = (id) => {
    axios.get(`https://dry-savannah-39543-261e658b7fd9.herokuapp.com/recipe/${id}`)
      .then(response => {
        setSelectedRecipe(response.data); // Store the fetched recipe details
        setShowModal(true); // Display the modal with recipe details
        document.body.style.overflow = 'hidden'; // Prevent background scrolling when modal is open
      })
      .catch(error => {
        console.error("Fehler beim Abrufen der Rezeptdetails!", error); // Log any errors that occur
      });
  };

  // Function to remove an ingredient from the detected ingredients list
  const removeIngredient = (index) => {
    // Create a new list excluding the ingredient at the specified index
    const updatedIngredients = detectedIngredients.filter((_, i) => i !== index);
    setDetectedIngredients(updatedIngredients); // Update the state
  };

  // useEffect hook to fetch recipes when the list of detected ingredients changes
  useEffect(() => {
    // Only fetch recipes if there are detected ingredients
    if (detectedIngredients.length > 0) {
      axios.post('https://dry-savannah-39543-261e658b7fd9.herokuapp.com/recipes', { ingredients: detectedIngredients })
        .then(response => {
          setRecipes(response.data); // Update the state with the fetched recipes
        })
        .catch(error => {
          console.error("Fehler beim Abrufen der Rezepte!", error); // Log any errors that occur
        });
    }
  }, [detectedIngredients]); // Runs this effect whenever detectedIngredients is updated

  // Function to download a recipe's details as a PDF
  const downloadRecipeAsPDF = (recipe) => {
    const doc = new jsPDF(); // Initialize jsPDF
    doc.text(recipe.title, 10, 10); // Add recipe title to the PDF
    doc.text(`Servings: ${recipe.servings}`, 10, 20); // Add the servings information
    doc.text('Ingredients:', 10, 30); // Add a section for ingredients

    // Loop through the ingredients and add them to the PDF
    recipe.extendedIngredients.forEach((ingredient, index) => {
      doc.text(`${index + 1}. ${ingredient.original}`, 10, 40 + index * 10);
    });

    doc.save(`${recipe.title}.pdf`); // Save the PDF with the recipe title as the file name
  };

  // Function to close the modal and restore scrolling
  const closeModal = () => {
    setShowModal(false); // Hide the modal
    setSelectedRecipe(null); // Clear the selected recipe
    document.body.style.overflow = 'auto'; // Re-enable background scrolling
  };

  return (
    <div>
      <h2>Simply scan your shopping list:</h2>
      {/* Input to upload an image of the shopping list */}
      <input type="file" onChange={handleFileChange} />

      <h3>Items:</h3>
      {/* Display the list of detected ingredients */}
      <ul style={{ listStyleType: 'none' }}>
        {detectedIngredients.map((ingredient, index) => (
          <li key={index}>
            {/* Input field to update the ingredient */}
            <input
              type="text"
              value={ingredient}
              onChange={(e) => {
                const updatedIngredients = [...detectedIngredients];
                updatedIngredients[index] = e.target.value; // Update the ingredient value
                setDetectedIngredients(updatedIngredients);
              }}
            />
            {/* Button to remove the ingredient */}
            <button onClick={() => removeIngredient(index)}>Remove</button>
          </li>
        ))}
      </ul>

      {/* Button to add a new empty item */}
      <button onClick={() => {
        const updatedIngredients = [...detectedIngredients, '']; // Add an empty string to the list
        setDetectedIngredients(updatedIngredients); // Update the state
      }}>Add new item</button>

      <h3>Recipes:</h3>
      {/* Display the list of recipes fetched based on ingredients */}
      <ul className="recipe-list">
        {recipes.map((recipe) => (
          <li key={recipe.id} className="recipe-card" onClick={() => fetchRecipeDetails(recipe.id)}>
            {/* Recipe image */}
            <img src={recipe.image} alt={recipe.title} width="100%" />
            {/* Recipe title */}
            <h4>{recipe.title}</h4>
          </li>
        ))}
      </ul>

      {/* Modal to display the selected recipe details */}
      {showModal && selectedRecipe && (
        <div className="modal" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}> {/* Prevents modal close on inner clicks */}
            {/* Recipe image and details */}
            <img src={selectedRecipe.image} alt={selectedRecipe.title} />
            <h2>{selectedRecipe.title}</h2>
            <p>Servings: {selectedRecipe.servings}</p>
            <ul>
              {/* List of ingredients */}
              {selectedRecipe.extendedIngredients.map((ingredient, index) => (
                <li key={index}>{ingredient.original}</li>
              ))}
            </ul>
            {/* Button to download the recipe as PDF */}
            <button onClick={() => downloadRecipeAsPDF(selectedRecipe)}>Download PDF</button>
            {/* Button to close the modal */}
            <button onClick={closeModal}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default RecipesList;