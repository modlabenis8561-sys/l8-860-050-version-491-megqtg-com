(() => {
  const qs = (selector, scope = document) => scope.querySelector(selector);
  const qsa = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

  const menuButton = qs('.menu-toggle');
  const mobilePanel = qs('.mobile-panel');
  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', () => {
      mobilePanel.classList.toggle('is-open');
    });
  }

  const slides = qsa('.hero-slide');
  const dots = qsa('.hero-dot');
  let activeSlide = 0;
  const showSlide = (index) => {
    if (!slides.length) return;
    activeSlide = (index + slides.length) % slides.length;
    slides.forEach((slide, current) => {
      slide.classList.toggle('active', current === activeSlide);
    });
    dots.forEach((dot, current) => {
      dot.classList.toggle('active', current === activeSlide);
    });
  };
  qsa('[data-hero-next]').forEach((button) => {
    button.addEventListener('click', () => showSlide(activeSlide + 1));
  });
  qsa('[data-hero-prev]').forEach((button) => {
    button.addEventListener('click', () => showSlide(activeSlide - 1));
  });
  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => showSlide(index));
  });
  if (slides.length) {
    showSlide(0);
    window.setInterval(() => showSlide(activeSlide + 1), 5200);
  }

  const applyFilters = () => {
    const cards = qsa('.movie-card, .rank-card');
    if (!cards.length) return;
    const keyword = (qs('.filter-input')?.value || '').trim().toLowerCase();
    const region = qs('.filter-region')?.value || '';
    const type = qs('.filter-type')?.value || '';
    const year = qs('.filter-year')?.value || '';
    let visible = 0;
    cards.forEach((card) => {
      const text = card.textContent.toLowerCase();
      const okKeyword = !keyword || text.includes(keyword);
      const okRegion = !region || card.dataset.region === region;
      const okType = !type || card.dataset.type === type;
      const okYear = !year || card.dataset.year === year;
      const matched = okKeyword && okRegion && okType && okYear;
      card.style.display = matched ? '' : 'none';
      if (matched) visible += 1;
    });
    const empty = qs('.search-empty');
    if (empty) {
      empty.style.display = visible ? 'none' : 'block';
    }
  };

  qsa('.filter-input, .filter-region, .filter-type, .filter-year').forEach((control) => {
    control.addEventListener('input', applyFilters);
    control.addEventListener('change', applyFilters);
  });

  const params = new URLSearchParams(window.location.search);
  const query = params.get('q');
  const filterInput = qs('.filter-input');
  if (query && filterInput) {
    filterInput.value = query;
    applyFilters();
  }

  qsa('.player-box').forEach((box) => {
    const video = qs('video', box);
    const button = qs('.play-button', box);
    if (!video || !button) return;
    let attached = false;
    const attach = () => {
      if (attached) return;
      attached = true;
      const url = video.getAttribute('data-hls');
      if (!url) return;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
      } else if (window.Hls && window.Hls.isSupported()) {
        const hls = new window.Hls({ enableWorker: true });
        hls.loadSource(url);
        hls.attachMedia(video);
      } else {
        video.src = url;
      }
    };
    const start = () => {
      attach();
      box.classList.add('is-playing');
      video.setAttribute('controls', 'controls');
      const playRequest = video.play();
      if (playRequest && typeof playRequest.catch === 'function') {
        playRequest.catch(() => {});
      }
    };
    button.addEventListener('click', start);
    video.addEventListener('click', () => {
      if (!box.classList.contains('is-playing')) start();
    });
  });
})();
