class SearchView {
  _parentEl = document.querySelector('.search');

  getQuery() {
    const query = this._parentEl.querySelector('.search__field').value;
    this._clearInput();
    return query;
  }

  _clearInput() {
    this._parentEl.querySelector('.search__field').value = '';
  }

  addHandlerSearch(handler) {
    // 'submit' is when btn clicked or enter hit
    this._parentEl.addEventListener('submit', function(e) {
      e.preventDefault(); // so that page will not reload
      handler();
    });
  }
};

export default new SearchView();