import React, { useEffect } from 'react';
import './App.css';
import RecipesList from './RecipesList';
import axios from 'axios';

function App() {
  // Function to fetch the first 10 recipe images for a slideshow
  const getRecipesImages = () => {
    // Sending a POST request to the backend with empty ingredients to get general recipes
    axios.post('https://dry-savannah-39543-261e658b7fd9.herokuapp.com/', { ingredients: [] })
      .then(response => {
        // Extracting the first 10 images from the API response
        const images = response.data.map(recipe => recipe.image).slice(0, 10); // Slicing to limit to 10 images
        // Since we don't need the images for now, they're just logged for debugging purposes
        console.log(images); // Logging the images to the console
      })
      .catch(error => {
        // In case something goes wrong, log the error
        console.error("Error fetching recipe images!", error);
      });
  };

  // useEffect hook to run getRecipesImages() once when the component is first rendered
  useEffect(() => {
    getRecipesImages(); // Fetch images when component mounts
  }, []); // Empty dependency array means this runs once

  return (
    <div className="App">
      <header className="App-header">
        <h1 className="app-title">LetHimCook</h1> {/* Main title of the app */}
        <h2 className="app-subtitle">Recipe-Finder</h2> {/* Added subtitle for extra clarity */}
      </header>
      
      <main>
        <RecipesList /> {/* Component that renders the list of recipes */}
      </main>
      
      {/* Scroll arrow that scrolls the page down when clicked */}
      <div className="scroll-arrow" onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}>
        ↓
      </div>
    </div>
  );
}

export default App;