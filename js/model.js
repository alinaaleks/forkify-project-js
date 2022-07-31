import { async } from 'regenerator-runtime';
import { API_URL, RES_PER_PAGE, KEY } from './config.js';
import { AJAX } from './helpers.js';

export const state = {
  recipe: {},
  search: {
    query: '',
    results: [],
    resultsPerPage: RES_PER_PAGE,
    page: 1,
  },
  bookmarks: [],
};

const createRecipeObj = function(data) {
  const { recipe } = data.data;
    
  return {
    id: recipe.id,
    title: recipe.title,
    publisher: recipe.publisher,
    sourceUrl: recipe.source_url,
    image: recipe.image_url,
    servings: recipe.servings,
    newServings: recipe.servings,
    cookingTime: recipe.cooking_time,
    ingredients: recipe.ingredients,
    newIngredients: [],
    // conditionally adding properties to obj
    // if there is a key we create obj with key property and spread it to this obj
    ...(recipe.key && { key: recipe.key }),
  };
};

// fn updates the state obj
export const loadRecipe = async function(id) {
  try {
    const data = await AJAX(`${API_URL}/${id}?key=${KEY}`); // store resolved value of Promise got from getJSON fn in a variable
    
    console.log(data);
    // reformat obj and update state obj
    state.recipe = createRecipeObj(data);

    // Right at the beginning we mark all loaded recipes as bookmarked or not
    // We take all data for rendering previews in bookmark menu
    if(state.bookmarks.some(bookmark => bookmark.id === id)) {
      state.recipe.bookmarked = true;
    } else {
      state.recipe.bookmarked = false;
    }

    console.log(state.recipe);
  } catch(err) {
    // Temp error handling
    console.error(`${err} 💨💫💨`);
    throw err; // propagate further
  }
};

// search
export const loadSearchResults = async function(query) {
  try {
    state.search.query = query;

    // With key additiion - while searching results contain created recipes
    const data = await AJAX(`${API_URL}?search=${query}&key=${KEY}`);
    console.log(data);

    state.search.results = data.data.recipes.map(rec => {
      return {
        id: rec.id,
        title: rec.title,
        publisher: rec.publisher,
        image: rec.image_url,
        ...(rec.key && { key: rec.key }),
      };
    });
    state.search.page = 1;

  } catch(err) {
    console.error(`${err} 💢💥💢`);
    throw err; // propagate further
  }
};

export const getSearchResultsPage = function(page = state.search.page) {
  state.search.page = page;

  const start = (page - 1) * state.search.resultsPerPage; // 0
  const end = page * state.search.resultsPerPage; // 9 (because slice does not include last value)

  return state.search.results.slice(start, end);
};

export const updateServings = function(newServings) {
  // Update servings quantity in state obj
  state.recipe.newServings = newServings;

  // Calculate new quantity
  state.recipe.newIngredients = state.recipe.ingredients.map(ing => {
    return {
      quantity: ing.quantity * newServings / state.recipe.servings,
      unit: ing.unit,
      description: ing.description,
    };
  });
};

const persistBookmarks = function() {
  localStorage.setItem('bookmarks', JSON.stringify(state.bookmarks));
};

// Common pattern - when we get something we take entire data and for deleting only get the id
export const addBookmark = function(recipe) {
  // Add bookmark
  state.bookmarks.push(recipe);

  // recipe.bookmarked = true;
  // Mark current recipe as bookmarked
  if(recipe.id === state.recipe.id) state.recipe.bookmarked = true;

  persistBookmarks();
};

export const deleteBookmark = function(id) {
  const index = state.bookmarks.findIndex(el => el.id === id);
  state.bookmarks.splice(index, 1); // at position 'index' delete 1 item

  // Mark recipe as not bookmarked
  if(id === state.recipe.id) state.recipe.bookmarked = false;

  persistBookmarks();
};

const init = function() {
  const storage = localStorage.getItem('bookmarks');
  if(storage) state.bookmarks = JSON.parse(storage);
};
init();

// for debugging - clearing all bookmarks on reloading (for development)
const clearBookmarks = function() {
  localStorage.clear('bookmarks');
};
clearBookmarks();

export const uploadRecipe = async function(newRecipe) {
  try {
    // Create recipeObj for uploading (from received form arr)
    const recipe = newRecipe.reduce((recipe, [name, value]) => {
      // check whether the name has a number at the end
      const [, prop, index] = name.match(/^(\w+)-(\d+)$/) ?? [];

      // if such name exists: => create (or find) ingredient obj and assign value. Rename property names if needed
      if(prop) {
        
        const ingObj = recipe.ingredients[index] ??= {};

        if(prop === 'quantity') value === '' ? ingObj[prop] = null : ingObj[prop] = +value;
        else if(prop === 'ingredient') ingObj.description = value;
        else ingObj[prop] = value;
      }
      else {
        if(name === 'title') recipe[name] = value;
        if(name === 'sourceURL') recipe.source_url = value;
        if(name === 'image') recipe.image_url = value;
        if(name === 'publisher') recipe.publisher = value;
        if(name === 'cookingTime') recipe.cooking_time = +value;
        if(name === 'servings') recipe.servings = +value;
      }
      return recipe;
    }, { ingredients: [] });

    // Filter out empty ingredients
    const ingArr = recipe.ingredients.filter(ing => ing.description !== '');

    // If all ingredient fields are empty
    if(ingArr.length === 0) throw new Error('Wrong ingredient format. Please use correct format.');

    recipe.ingredients = ingArr;

    console.log(recipe);
    const data = await AJAX(`${API_URL}?key=${KEY}`, recipe);
    
    state.recipe = createRecipeObj(data);
    addBookmark(state.recipe);

  } catch(err) {
    throw err;
  }
};