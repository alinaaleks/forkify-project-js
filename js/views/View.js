import icons from 'url:../../img/icons.svg';

// here exporting the class itself because we will not use any instances of it. This is parent class for 'easify' use of children classes, which are used. That is why their instances are exported
export default class View {
  _data;

  // Object[] - array of objects
  // [render = true] in brackets 'cause its optional parameter
  
  /**
   * Render the received object to the DOM
   * @param {Object | Object[]} data The data to be rendered (e.g. recipe)
   * @param {boolean} [render = true] If false, create markup string instead of rendering to the DOM
   * @returns {undefined | string} A markup string is returned if render is false
   * @this {Object} View instance
   * @author Alina Aleks
   * @todo Finish implementation
   */
  render(data, render = true) {
    if(!data || (Array.isArray(data) && data.length === 0)) return this.renderError();

    // Store recieved recipe data in this obj
    this._data = data;

    // Put HTML on page
    const markup = this._generateMarkup();

    if(!render) return markup;

    this._clear();
    this._insertHTML(markup);
  }

  // For changing only data which is actually changed
  // For big application this is not good enough, not robust
  update(data) {
    this._data = data;
    const newMarkup = this._generateMarkup();

    // Create virtual DOM with all the elements
    const newDOM = document.createRange().createContextualFragment(newMarkup);
    const newElements = Array.from(newDOM.querySelectorAll('*')); // select all the elements and make an array from this (was Nodelist)

    // Select actual DOM with all the elements
    const curElements = Array.from(this._parentEl.querySelectorAll('*'));

    // Comparing the DOMs
    newElements.forEach((newEl, i) => {
      const curEl = curElements[i];

      // Update changed text
      // Replace text only in elements that changed (newE is element, firstChild is text element in it, so we check its value. And if its text and contains data that is also changed - text is replaced)
      if(!newEl.isEqualNode(curEl) && newEl.firstChild?.nodeValue.trim() !== '') {
        curEl.textContent = newEl.textContent;
      };

      // Update changed attributes
      if(!newEl.isEqualNode(curEl)) {
        // take all attributes from newEl in array, loop over this array setting new name and value fro each attribute (class, data etc)
        Array.from(newEl.attributes).forEach(attr => curEl.setAttribute(attr.name, attr.value));
      };
    });
  }

  _clear() {
    this._parentEl.innerHTML = '';
  }

  _insertHTML(markup) {
    this._parentEl.insertAdjacentHTML('afterbegin', markup);
  }

  renderSpinner() {
    const markup = `
      <div class="spinner">
        <svg>
          <use href="${icons}#icon-loader"></use>
        </svg>
      </div>
    `;
    this._clear();
    this._insertHTML(markup);
  }

  renderError(msg = this._errorMessage) {
    const markup = `
      <div class="error">
        <div>
          <svg>
            <use href="${icons}#icon-alert-triangle"></use>
          </svg>
        </div>
        <p>${msg}</p>
      </div>
    `;
    this._clear();
    this._insertHTML(markup);
  }

  renderMessage(msg = this._successMessage) {
    const markup = `
      <div class="message">
        <div>
          <svg>
            <use href="${icons}#icon-smile"></use>
          </svg>
        </div>
        <p>${msg}</p>
      </div>
    `;
    this._clear();
    this._insertHTML(markup);
  }
};