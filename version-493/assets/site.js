(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    ready(function () {
        var navToggle = document.querySelector('.nav-toggle');
        var nav = document.querySelector('.main-nav');
        if (navToggle && nav) {
            navToggle.addEventListener('click', function () {
                nav.classList.toggle('is-open');
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
        if (slides.length) {
            var current = 0;
            var showSlide = function (index) {
                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle('is-active', slideIndex === current);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle('is-active', dotIndex === current);
                });
            };
            dots.forEach(function (dot, dotIndex) {
                dot.addEventListener('click', function () {
                    showSlide(dotIndex);
                });
            });
            showSlide(0);
            window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        document.querySelectorAll('[data-filter-panel]').forEach(function (panel) {
            var input = panel.querySelector('.filter-input');
            var year = panel.querySelector('select[name="year"]');
            var type = panel.querySelector('select[name="type"]');
            var region = panel.querySelector('select[name="region"]');
            var reset = panel.querySelector('.filter-reset');
            var cards = Array.prototype.slice.call(document.querySelectorAll('[data-title]'));
            var params = new URLSearchParams(window.location.search);
            var initialQuery = params.get('q');

            if (input && initialQuery) {
                input.value = initialQuery;
            }

            var apply = function () {
                var query = normalize(input ? input.value : '');
                var yearValue = normalize(year ? year.value : '');
                var typeValue = normalize(type ? type.value : '');
                var regionValue = normalize(region ? region.value : '');
                var visible = 0;

                cards.forEach(function (card) {
                    var text = normalize([
                        card.dataset.title,
                        card.dataset.genre,
                        card.dataset.type,
                        card.dataset.region,
                        card.dataset.year
                    ].join(' '));
                    var matched = true;

                    if (query && text.indexOf(query) === -1) {
                        matched = false;
                    }
                    if (yearValue && normalize(card.dataset.year) !== yearValue) {
                        matched = false;
                    }
                    if (typeValue && normalize(card.dataset.type) !== typeValue) {
                        matched = false;
                    }
                    if (regionValue && normalize(card.dataset.region) !== regionValue) {
                        matched = false;
                    }

                    card.hidden = !matched;
                    if (matched) {
                        visible += 1;
                    }
                });

                panel.classList.toggle('is-empty', visible === 0);
            };

            [input, year, type, region].forEach(function (control) {
                if (control) {
                    control.addEventListener('input', apply);
                    control.addEventListener('change', apply);
                }
            });

            if (reset) {
                reset.addEventListener('click', function () {
                    if (input) {
                        input.value = '';
                    }
                    [year, type, region].forEach(function (control) {
                        if (control) {
                            control.value = '';
                        }
                    });
                    apply();
                });
            }

            apply();
        });

        document.querySelectorAll('.player-section[data-stream]').forEach(function (player) {
            var video = player.querySelector('video');
            var cover = player.querySelector('.play-cover');
            var stream = player.getAttribute('data-stream');
            var prepared = false;
            var playRequested = false;

            if (!video || !stream) {
                return;
            }

            var tryPlay = function () {
                var promise = video.play();
                if (promise && typeof promise.catch === 'function') {
                    promise.catch(function () {
                        video.controls = true;
                    });
                }
            };

            var prepare = function () {
                if (prepared) {
                    return;
                }
                prepared = true;

                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = stream;
                    video.load();
                } else if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls({ enableWorker: true });
                    hls.loadSource(stream);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        if (playRequested) {
                            tryPlay();
                        }
                    });
                    player._hls = hls;
                } else {
                    video.src = stream;
                    video.load();
                }
            };

            var start = function () {
                playRequested = true;
                prepare();
                if (cover) {
                    cover.classList.add('is-hidden');
                }
                tryPlay();
            };

            if (cover) {
                cover.addEventListener('click', start);
            }

            video.addEventListener('click', function () {
                if (video.paused) {
                    start();
                }
            });
        });
    });
})();
