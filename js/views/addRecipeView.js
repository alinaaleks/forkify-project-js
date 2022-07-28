import View from './View.js';

class AddRecipeView extends View {
  _parentEl = document.querySelector('.upload');
  _successMessage = 'Recipe was successfully uploaded :)';

  _window = document.querySelector('.add-recipe-window');
  _overlay = document.querySelector('.overlay');
  _btnOpen = document.querySelector('.nav__btn--add-recipe');
  _btnClose = document.querySelector('.btn--close-modal');

  constructor() {
    super();
    this._addHandlerShowWindow();
    this._addHandlerHideWindow();
  }

  _toggleWindow() {
    this._overlay.classList.toggle('hidden');
    this._window.classList.toggle('hidden');
  }

  // controller does not need to interfere with this fn. What it does is only popup window. That's why we need a constructor here
  // But we still need to import it to controller, because otherwise our main script will never execute this file and this obj will never be created and eventlistener will never be added
  _addHandlerShowWindow() {
    // again - with event handlers this keyword points to element where the event is handled. We need this keyword for overlay and window, so we create another helper fn for toggling and pass it here as a callback binding manually this keyword to this obj. Otherwise it would be the btn
    this._btnOpen.addEventListener('click', this._toggleWindow.bind(this));
  }

  _addHandlerHideWindow() {
    this._btnClose.addEventListener('click', this._toggleWindow.bind(this));
    this._overlay.addEventListener('click', this._toggleWindow.bind(this));
  }

  addHandlerUpload(handler) {
    this._parentEl.addEventListener('submit', function(e) {
      e.preventDefault();

      // in FormData constructor we pass in an element that is a form. Here it is this keyword
      const dataArr = [...new FormData(this)];
      console.log(dataArr);
      // take an array of entries and convert it to an obj
      // const data = Object.fromEntries(dataArr);
      // console.log(data);
      handler(dataArr);
    });
  }

  _generateMarkup() {
    
  }
};

export default new AddRecipeView();