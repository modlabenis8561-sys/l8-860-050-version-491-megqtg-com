(function () {
  var mobileToggle = document.querySelector('[data-mobile-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (mobileToggle && mobileNav) {
    mobileToggle.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
  var emptyState = document.querySelector('[data-empty-state]');
  var searchInputs = Array.prototype.slice.call(document.querySelectorAll('[data-site-search]'));
  var filterSelects = Array.prototype.slice.call(document.querySelectorAll('[data-filter-select]'));

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function getSearchValue() {
    for (var i = 0; i < searchInputs.length; i += 1) {
      if (searchInputs[i].value) {
        return searchInputs[i].value;
      }
    }
    return '';
  }

  function getFilterValue(name) {
    var select = document.querySelector('[data-filter-select="' + name + '"]');
    return select ? select.value : '';
  }

  function cardText(card) {
    return normalize([
      card.textContent,
      card.getAttribute('data-title'),
      card.getAttribute('data-year'),
      card.getAttribute('data-region'),
      card.getAttribute('data-type'),
      card.getAttribute('data-tags'),
      card.getAttribute('data-category')
    ].join(' '));
  }

  function applyFilters() {
    var query = normalize(getSearchValue());
    var year = normalize(getFilterValue('year'));
    var type = normalize(getFilterValue('type'));
    var visibleCount = 0;

    cards.forEach(function (card) {
      var text = cardText(card);
      var yearMatch = !year || normalize(card.getAttribute('data-year')) === year;
      var typeMatch = !type || normalize(card.getAttribute('data-type')) === type;
      var queryMatch = !query || text.indexOf(query) !== -1;
      var isVisible = yearMatch && typeMatch && queryMatch;
      card.hidden = !isVisible;
      if (isVisible) {
        visibleCount += 1;
      }
    });

    if (emptyState) {
      emptyState.hidden = visibleCount !== 0;
    }
  }

  searchInputs.forEach(function (input) {
    input.addEventListener('input', function () {
      var value = input.value;
      searchInputs.forEach(function (other) {
        if (other !== input) {
          other.value = value;
        }
      });
      applyFilters();
    });
  });

  filterSelects.forEach(function (select) {
    select.addEventListener('change', applyFilters);
  });

  var params = new URLSearchParams(window.location.search);
  var presetQuery = params.get('q');
  if (presetQuery) {
    searchInputs.forEach(function (input) {
      input.value = presetQuery;
    });
    applyFilters();
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var activeIndex = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      activeIndex = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === activeIndex);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === activeIndex);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        showSlide(activeIndex + 1);
      }, 5000);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(activeIndex - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(activeIndex + 1);
        restart();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        restart();
      });
    });

    restart();
  }
}());
