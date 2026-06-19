(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  function initMenu() {
    var button = document.querySelector('[data-menu-toggle]');
    var menu = document.querySelector('[data-mobile-menu]');
    if (!button || !menu) {
      return;
    }
    button.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    if (!slides.length) {
      return;
    }
    var current = 0;
    var timer = null;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle('is-active', itemIndex === current);
      });
      dots.forEach(function (dot, itemIndex) {
        dot.classList.toggle('is-active', itemIndex === current);
      });
    }
    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }
    dots.forEach(function (dot, itemIndex) {
      dot.addEventListener('click', function () {
        show(itemIndex);
        restart();
      });
    });
    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        restart();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        restart();
      });
    }
    restart();
  }

  function initImages() {
    document.querySelectorAll('img[data-cover]').forEach(function (image) {
      image.addEventListener('error', function () {
        image.classList.add('is-missing');
      });
    });
  }

  function textOf(card) {
    return [
      card.getAttribute('data-title') || '',
      card.getAttribute('data-region') || '',
      card.getAttribute('data-year') || '',
      card.getAttribute('data-genre') || '',
      card.getAttribute('data-tags') || '',
      card.textContent || ''
    ].join(' ').toLowerCase();
  }

  function initFilters() {
    document.querySelectorAll('[data-filter-area]').forEach(function (area) {
      var input = area.querySelector('[data-filter-input]');
      var year = area.querySelector('[data-filter-year]');
      var region = area.querySelector('[data-filter-region]');
      var genre = area.querySelector('[data-filter-genre]');
      var cards = Array.prototype.slice.call(area.querySelectorAll('.movie-card'));
      var params = new URLSearchParams(window.location.search);
      if (input && params.get('q')) {
        input.value = params.get('q');
      }
      function apply() {
        var keyword = input ? input.value.trim().toLowerCase() : '';
        var yearValue = year ? year.value : '';
        var regionValue = region ? region.value : '';
        var genreValue = genre ? genre.value : '';
        cards.forEach(function (card) {
          var text = textOf(card);
          var matched = true;
          if (keyword && text.indexOf(keyword) === -1) {
            matched = false;
          }
          if (yearValue && (card.getAttribute('data-year') || '') !== yearValue) {
            matched = false;
          }
          if (regionValue && (card.getAttribute('data-region') || '') !== regionValue) {
            matched = false;
          }
          if (genreValue && text.indexOf(genreValue.toLowerCase()) === -1) {
            matched = false;
          }
          card.classList.toggle('is-hidden', !matched);
        });
      }
      [input, year, region, genre].forEach(function (item) {
        if (item) {
          item.addEventListener('input', apply);
          item.addEventListener('change', apply);
        }
      });
      apply();
    });
  }

  function initPlayers() {
    document.querySelectorAll('[data-player]').forEach(function (shell) {
      var video = shell.querySelector('video');
      var overlay = shell.querySelector('.player-overlay');
      var stream = shell.getAttribute('data-stream');
      var hls = null;
      var prepared = false;
      function playVideo() {
        shell.classList.add('is-playing');
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {
            shell.classList.remove('is-playing');
          });
        }
      }
      function prepare() {
        if (!video || !stream) {
          return;
        }
        if (prepared) {
          playVideo();
          return;
        }
        prepared = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
          playVideo();
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({ enableWorker: true });
          hls.loadSource(stream);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, playVideo);
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal && hls) {
              hls.destroy();
              hls = null;
              video.src = stream;
            }
          });
          return;
        }
        video.src = stream;
        playVideo();
      }
      if (overlay) {
        overlay.addEventListener('click', prepare);
      }
      if (video) {
        video.addEventListener('click', function () {
          if (video.paused) {
            prepare();
          } else {
            video.pause();
          }
        });
        video.addEventListener('play', function () {
          shell.classList.add('is-playing');
        });
        video.addEventListener('pause', function () {
          if (!video.ended) {
            shell.classList.remove('is-playing');
          }
        });
      }
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initImages();
    initFilters();
    initPlayers();
  });
})();
