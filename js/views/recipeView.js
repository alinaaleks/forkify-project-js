import View from './View.js';

// for static objects like imgs, videos etc. not programming stuff
// import icons from '../img/icons.svg'; // Parcel 1
import icons from 'url:../../img/icons.svg'; // Parcel 2
// console.log(icons); // icons file in dist folder
import { Fraction } from 'fractional'; // importing from npm packages don't need to specify path

class RecipeView extends View {
  _parentEl = document.querySelector('.recipe');
  _errorMessage = 'We could not find this recipe. Please try another one.';
  _successMessage = '';

  // handler fn for rendering the recipe
  addHandlerRender(handler) {
    // usually (e) is actual event obj
    // here use ev
    ['hashchange', 'load'].forEach(ev => window.addEventListener(ev, handler));
  }

  addHandlerUpdateServings(handler) {
    this._parentEl.addEventListener('click', function(e) {
      const btn = e.target.closest('.btn--update-servings');
      const btnDown = e.target.closest('.btn--update-servings--down');
      const btnUp = e.target.closest('.btn--update-servings--up');
      const ingredientsEl = document.querySelector('.recipe__ingredient-list');

      if(!btn) return;

      // Get number of servings (> 0)
      let servings = +ingredientsEl.dataset.servings;

      if(btnDown && servings > 1) servings -=1;
      if(btnUp && servings > 0) servings +=1;
      
      ingredientsEl.dataset.servings = servings + '';
      handler(servings);
    });
  }

  // event delegation. For the time app starts recipe is not yet rendered and nothing to 'bookmark'
  addHandlerAddBookmark(handler) {
    this._parentEl.addEventListener('click', function(e) {
      const btn = e.target.closest('.btn--bookmark');
      if(!btn) return;

      handler();
    });
  }

  renderNewServings(data) {
    const numServingsEl = document.querySelector('.recipe__info-data--people');
    numServingsEl.textContent = data.newServings;
    const ingredientsEl = document.querySelector('.recipe__ingredients');
    ingredientsEl.innerHTML = '';
    const markup = `    
      <h2 class="heading--2">Recipe ingredients</h2>
      <ul class="recipe__ingredient-list" data-servings="${data.newServings}">
        ${data.newIngredients.map(this._generateMarkupIng).join('')}
      </ul>
    `;
    ingredientsEl.insertAdjacentHTML('afterbegin', markup);
  }

  _generateMarkup() {
    return `
        <figure class="recipe__fig">
          <img class="recipe__img" src="${this._data.image}" alt="${this._data.title}" crossorigin="anonymous">
          <h1 class="recipe__title">
            <span>${this._data.title}</span>
          </h1>
        </figure>
  
        <div class="recipe__details">
          <div class="recipe__info">
            <svg class="recipe__info-icon">
              <use href="${icons}#icon-clock"></use>
            </svg>
            <span class="recipe__info-data recipe__info-data--minutes">${this._data.cookingTime}</span>
            <span class="recipe__info-text">minutes</span>
          </div>
  
          <div class="recipe__info">
            <svg class="recipe__info-icon">
              <use href="${icons}#icon-users"></use>
            </svg>
            <span class="recipe__info-data recipe__info-data--people">${this._data.servings}</span>
            <span class="recipe__info-text">servings</span>
  
            <div class="recipe__info-buttons">
              <button class="btn--update-servings btn--update-servings--down">
                <svg>
                  <use href="${icons}#icon-minus-circle"></use>
                </svg>
              </button>
              <button class="btn--update-servings btn--update-servings--up">
                <svg>
                  <use href="${icons}#icon-plus-circle"></use>
                </svg>
              </button>
            </div>
          </div>
  
          <div class="recipe__user-generated ${this._data.key ? '' : 'hidden'}">
            <svg>
              <use href="${icons}#icon-user"></use>
            </svg>
          </div>
          
          <button class="btn--round btn--bookmark">
            <svg>
              <use href="${icons}#icon-bookmark${this._data.bookmarked ? '-fill' : ''}"></use>
            </svg>
          </button>
        </div>
  
        <div class="recipe__ingredients">
          <h2 class="heading--2">Recipe ingredients</h2>
          <ul class="recipe__ingredient-list" data-servings="${this._data.newServings}">
  
            ${this._data.ingredients.map(this._generateMarkupIng).join('')}
  
          </ul>
        </div>
  
        <div class="recipe__directions">
          <h2 class="heading--2">How to cook</h2>
          <p class="recipe__directions-text">This recipe was carefully designed and tested by
            <span class="recipe__publisher">${this._data.publisher}</span>. Please check out directions at their website.
          </p>
          <a class="btn--small recipe__btn" href="${this._data.sourceUrl}" target="_blank">
            <span>Directions</span>
            <svg class="search__icon">
              <use href="${icons}#icon-arrow-right"></use>
            </svg>
          </a>
        </div>
      `;
  }

  _generateMarkupIng(ing) {
    return `
    <li class="recipe__ingredient">
      <svg class="recipe__icon">
        <use href="${icons}#icon-check"></use>
      </svg>
      <div class="recipe__quantity">${ing.quantity ? new Fraction(ing.quantity).toString() : ''}</div>
      <div class="recipe__description">
        <span class="recipe__unit">${ing.unit}</span>
        ${ing.description}
      </div>
    </li>
    `;
  }
};

export default new RecipeView();