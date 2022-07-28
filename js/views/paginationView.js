import icons from 'url:../../img/icons.svg'; // Parcel 2
import View from './View.js';

class PaginationView extends View {
  _parentEl = document.querySelector('.pagination');

  addHandlerClick(handler) {
    this._parentEl.addEventListener('click', function(e) {
      const btn = e.target.closest('.btn--inline');
      if(!btn) return;

      const goToPage = +btn.dataset.goto;

      handler(goToPage);
    });
  }

  _generateMarkup() {
    const curPage = this._data.page;
    const numPages = Math.ceil(this._data.results.length / this._data.resultsPerPage);

    const markupBtnBack = `
      <button class="btn--inline pagination__btn--prev" data-goto="${curPage - 1}">
        <svg class="search__icon">
          <use href="${icons}#icon-arrow-left"></use>
        </svg>
        <span>Page ${curPage - 1}</span>
      </button>
    `;

    const markupBtnNext = `
      <button class="btn--inline pagination__btn--next" data-goto="${curPage + 1}">
        <span>Page ${curPage + 1}</span>
        <svg class="search__icon">
          <use href="${icons}#icon-arrow-right"></use>
        </svg>
      </button>
    `;

    // Page 1, and there are other pages
    if(curPage === 1 && numPages > 1) {
      return markupBtnNext;
    }

    // Last Page
    if(curPage === numPages && numPages > 1) {
      return markupBtnBack;
    }
    
    // Middle pages
    if(curPage < numPages) {
      return markupBtnBack + markupBtnNext;
    }

    // Page 1, and there are NO other pages
    return '';
  }
};

export default new PaginationView();