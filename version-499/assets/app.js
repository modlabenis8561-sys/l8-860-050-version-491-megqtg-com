(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  function setupMobileNav() {
    var toggle = document.querySelector("[data-mobile-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("open");
    });
  }

  function setupHero() {
    var root = document.querySelector("[data-hero]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
      });
    }
    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }
    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });
    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function setupFilters() {
    var controls = document.querySelector("[data-filter-controls]");
    var scope = document.querySelector("[data-filter-scope]");
    if (!scope) {
      return;
    }
    var input = controls ? controls.querySelector("[data-filter-input]") : document.querySelector("[data-filter-input]");
    var selects = controls ? Array.prototype.slice.call(controls.querySelectorAll("[data-filter-select]")) : [];
    var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
    var empty = document.querySelector("[data-empty-state]");
    function text(card) {
      return [
        card.getAttribute("data-title"),
        card.getAttribute("data-region"),
        card.getAttribute("data-year"),
        card.getAttribute("data-type"),
        card.getAttribute("data-genre"),
        card.getAttribute("data-tags"),
        card.textContent
      ].join(" ").toLowerCase();
    }
    function apply() {
      var term = input ? input.value.trim().toLowerCase() : "";
      var filters = {};
      selects.forEach(function (select) {
        var key = select.getAttribute("data-filter-select");
        filters[key] = select.value;
      });
      var shown = 0;
      cards.forEach(function (card) {
        var ok = true;
        if (term && text(card).indexOf(term) === -1) {
          ok = false;
        }
        Object.keys(filters).forEach(function (key) {
          if (filters[key] && card.getAttribute("data-" + key) !== filters[key]) {
            ok = false;
          }
        });
        card.style.display = ok ? "" : "none";
        if (ok) {
          shown += 1;
        }
      });
      if (empty) {
        empty.classList.toggle("show", shown === 0);
      }
    }
    if (input) {
      input.addEventListener("input", apply);
    }
    selects.forEach(function (select) {
      select.addEventListener("change", apply);
    });
    var params = new URLSearchParams(window.location.search);
    var q = params.get("q");
    if (q && input) {
      input.value = q;
      apply();
    }
  }

  function setupBackTop() {
    var button = document.querySelector("[data-back-top]");
    if (!button) {
      return;
    }
    function sync() {
      button.classList.toggle("show", window.scrollY > 500);
    }
    window.addEventListener("scroll", sync, { passive: true });
    button.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    sync();
  }

  function setupPlayer() {
    var box = document.querySelector("[data-player]");
    if (!box) {
      return;
    }
    var video = box.querySelector("video");
    var playButton = box.querySelector("[data-play]");
    var cover = box.querySelector("[data-cover]");
    var videoUrl = box.getAttribute("data-video-url");
    var started = false;
    var hlsInstance = null;
    function start() {
      if (!video || !videoUrl) {
        return;
      }
      if (!started) {
        started = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = videoUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({ enableWorker: true });
          hlsInstance.loadSource(videoUrl);
          hlsInstance.attachMedia(video);
        } else {
          video.src = videoUrl;
        }
        video.setAttribute("controls", "controls");
        box.classList.add("is-playing");
      }
      var action = video.play();
      if (action && typeof action.catch === "function") {
        action.catch(function () {});
      }
    }
    if (playButton) {
      playButton.addEventListener("click", start);
    }
    if (cover) {
      cover.addEventListener("click", start);
    }
    video.addEventListener("click", function () {
      if (!started) {
        start();
      }
    });
    window.addEventListener("beforeunload", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  ready(function () {
    setupMobileNav();
    setupHero();
    setupFilters();
    setupBackTop();
    setupPlayer();
  });
})();
