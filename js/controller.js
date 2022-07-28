import * as model from './model.js';
import { MODAL_CLOSE_SEC } from './config.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';

// polyfilling
import 'core-js/stable'; // everything else
import 'regenerator-runtime/runtime'; // async/await
import { async } from 'regenerator-runtime';

// parcel thing to not reloading page (only clears console when changes in code made)
/*
if(module.hot) {
  module.hot.accept();
}
*/

const controlRecipes = async function() {
  try {
    const id = window.location.hash.slice(1); // location = web address

    if(!id) return; // if no id
    recipeView.renderSpinner();

    // Update results view to mark selected search result
    resultsView.update(model.getSearchResultsPage());

    // Updating bookmarks view (adding handler for bookmarks at the load page solves the bug with this update => so that when bookmarks are updated they are already there and can be updated)
    bookmarksView.update(model.state.bookmarks); // so that active recipe will also be highlighted in bookmarks if exists there
    
    // ==> Load recipe (update recipe obj)
    await model.loadRecipe(id); // we are not storing the result anywhere because fn does not return anything, only updates state obj
    
    // ==> Render recipe
    recipeView.render(model.state.recipe);
    
  } catch(err) {
    recipeView.renderError();
    console.error(err);
  }
};

const controlSearchResults = async function() {
  try {
    resultsView.renderSpinner();
    // Get search query
    const query = searchView.getQuery();
    if(!query) return;

    // Load search results
    await model.loadSearchResults(query); // fn does not return anything, only manipulates the state obj

    // Render results
    resultsView.render(model.getSearchResultsPage());

    // Render initial pagination buttons
    paginationView.render(model.state.search);

  } catch(err) {
    console.log(err);
  }
};

const controlPagination = function(goToPage) {
  // Render NEW results
  resultsView.render(model.getSearchResultsPage(goToPage));

  // Render NEW pagination buttons
  paginationView.render(model.state.search);
};

const controlServings = function(newServings) {
  // Update servings (in state)
  model.updateServings(newServings);

  // Update Recipe view (ingredients only)
  recipeView.renderNewServings(model.state.recipe);
  // recipeView.update(model.state.recipe);
};

// When bookmark button clicked
const controlAddBookmark = function() {
  // Add or remove bookmark
  if(!model.state.recipe.bookmarked) {
    model.addBookmark(model.state.recipe);
  } else {
    model.deleteBookmark(model.state.recipe.id);
  }

  // Update recipe view
  recipeView.update(model.state.recipe);

  // Render bookmarks
  bookmarksView.render(model.state.bookmarks);
};

const controlBookmarks = function() {
  bookmarksView.render(model.state.bookmarks);
};

const controlAddRecipe = async function(newRecipe) {
  try {
    // Show loading spinner
    addRecipeView.renderSpinner();

    // Upload new Recipe Data
    await model.uploadRecipe(newRecipe);
    console.log(model.state.recipe);
  
    //Render recipe
    recipeView.render(model.state.recipe);

    // Success message
    addRecipeView.renderMessage();

    // Render bookmarks view
    bookmarksView.render(model.state.bookmarks);

    // Change ID in the URL
    // Allow to change url without reloading the page
    // pushState takes in 3 arguments: state, title, url
    // window.history.back() => automatically go back to the last page
    window.history.pushState(null, '', `#${model.state.recipe.id}`);

    // Close form window
    setTimeout(function() {
      addRecipeView._toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);

  } catch(err) {
    console.error('💥', err);
    addRecipeView.renderError(err.message);
  }
};

// publisher-subscriber pattern
// handler is publisher (code when knows when to react)
// controlFn is a subscriber (code that wants to react)
// In init() we subscribe to publisher by passing in the subscriber fn
const init = function() {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
};
init();