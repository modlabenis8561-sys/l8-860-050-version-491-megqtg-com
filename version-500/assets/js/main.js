(function () {
  var body = document.body;
  var searchBase = (body && body.getAttribute('data-base')) || './';
  var joinPath = function (base, path) {
    if (!path || /^https?:/.test(path)) {
      return path || '';
    }
    return base + path.replace(/^\.\//, '');
  };
  var escapeHtml = function (value) {
    return String(value || '').replace(/[&<>"']/g, function (character) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[character];
    });
  };
  var mobileButton = document.querySelector('[data-mobile-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (mobileButton && mobileNav) {
    mobileButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('img[data-cover]').forEach(function (image) {
    image.addEventListener('error', function () {
      image.classList.add('is-missing');
      image.removeAttribute('src');
    });
  });

  var backTop = document.querySelector('[data-back-top]');
  if (backTop) {
    window.addEventListener('scroll', function () {
      backTop.classList.toggle('is-visible', window.scrollY > 420);
    });
    backTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  var hero = document.querySelector('[data-hero-slider]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var cards = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-card]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var activeIndex = 0;
    var showSlide = function (nextIndex) {
      if (!slides.length) {
        return;
      }
      activeIndex = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, index) {
        slide.classList.toggle('is-active', index === activeIndex);
      });
      cards.forEach(function (card, index) {
        card.style.display = index === activeIndex ? '' : 'none';
      });
      dots.forEach(function (dot, index) {
        dot.classList.toggle('is-active', index === activeIndex);
      });
    };
    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
      });
    });
    showSlide(0);
    window.setInterval(function () {
      showSlide(activeIndex + 1);
    }, 5200);
  }

  var pageFilter = document.querySelector('[data-page-filter]');
  if (pageFilter) {
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-filter-card]'));
    var rows = Array.prototype.slice.call(document.querySelectorAll('[data-filter-row]'));
    var emptyState = document.querySelector('[data-empty-state]');
    var filterItems = function () {
      var query = pageFilter.value.trim().toLowerCase();
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = (card.getAttribute('data-search') || '').toLowerCase();
        var match = !query || haystack.indexOf(query) !== -1;
        card.style.display = match ? '' : 'none';
        if (match) {
          visible += 1;
        }
      });
      rows.forEach(function (row) {
        var haystack = (row.getAttribute('data-search') || '').toLowerCase();
        var match = !query || haystack.indexOf(query) !== -1;
        row.style.display = match ? '' : 'none';
        if (match) {
          visible += 1;
        }
      });
      if (emptyState) {
        emptyState.classList.toggle('is-visible', visible === 0);
      }
    };
    pageFilter.addEventListener('input', filterItems);
  }

  var globalInput = document.querySelector('[data-global-search]');
  var searchPanel = document.querySelector('[data-search-panel]');
  if (globalInput && searchPanel && Array.isArray(window.MOVIE_SEARCH_INDEX)) {
    var renderResults = function () {
      var query = globalInput.value.trim().toLowerCase();
      if (!query) {
        searchPanel.classList.remove('is-open');
        searchPanel.innerHTML = '';
        return;
      }
      var results = window.MOVIE_SEARCH_INDEX.filter(function (item) {
        return item.search.indexOf(query) !== -1;
      }).slice(0, 12);
      searchPanel.innerHTML = results.map(function (item) {
        var href = joinPath(searchBase, item.url);
        var cover = joinPath(searchBase, item.cover);
        return '<a class="search-result" href="' + href + '">' +
          '<img data-cover src="' + cover + '" alt="' + escapeHtml(item.title) + '">' +
          '<span><span class="search-title">' + escapeHtml(item.title) + '</span>' +
          '<span class="search-meta">' + escapeHtml(item.meta) + '</span></span>' +
          '</a>';
      }).join('');
      if (!results.length) {
        searchPanel.innerHTML = '<div class="search-result"><span></span><span><span class="search-title">没有匹配内容</span><span class="search-meta">换个关键词试试</span></span></div>';
      }
      searchPanel.classList.add('is-open');
      searchPanel.querySelectorAll('img[data-cover]').forEach(function (image) {
        image.addEventListener('error', function () {
          image.classList.add('is-missing');
          image.removeAttribute('src');
        });
      });
    };
    globalInput.addEventListener('input', renderResults);
    document.addEventListener('click', function (event) {
      if (!searchPanel.contains(event.target) && event.target !== globalInput) {
        searchPanel.classList.remove('is-open');
      }
    });
  }
})();
