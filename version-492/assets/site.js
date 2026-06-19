(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var toggle = document.querySelector("[data-nav-toggle]");
        var nav = document.querySelector("[data-nav]");
        if (toggle && nav) {
            toggle.addEventListener("click", function () {
                nav.classList.toggle("open");
            });
        }

        var hero = document.querySelector("[data-hero]");
        if (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
            var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
            var prev = hero.querySelector("[data-hero-prev]");
            var next = hero.querySelector("[data-hero-next]");
            var index = 0;
            var timer = null;

            function show(nextIndex) {
                if (!slides.length) {
                    return;
                }
                index = (nextIndex + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle("active", slideIndex === index);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle("active", dotIndex === index);
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

            dots.forEach(function (dot, dotIndex) {
                dot.addEventListener("click", function () {
                    show(dotIndex);
                    start();
                });
            });

            if (prev) {
                prev.addEventListener("click", function () {
                    show(index - 1);
                    start();
                });
            }

            if (next) {
                next.addEventListener("click", function () {
                    show(index + 1);
                    start();
                });
            }

            hero.addEventListener("mouseenter", stop);
            hero.addEventListener("mouseleave", start);
            show(0);
            start();
        }

        function normalize(value) {
            return String(value || "").trim().toLowerCase();
        }

        function filterCards(value) {
            var q = normalize(value);
            var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card-list] .movie-card, .ranking-list .ranking-item"));
            cards.forEach(function (card) {
                var haystack = normalize(card.getAttribute("data-search") || card.textContent);
                card.classList.toggle("is-hidden", q && haystack.indexOf(q) === -1);
            });
        }

        var urlParams = new URLSearchParams(window.location.search);
        var initialQuery = urlParams.get("q") || "";
        var filterInputs = Array.prototype.slice.call(document.querySelectorAll("[data-filter-input]"));
        filterInputs.forEach(function (input) {
            if (initialQuery && !input.value) {
                input.value = initialQuery;
            }
            input.addEventListener("input", function () {
                filterCards(input.value);
            });
        });
        if (initialQuery) {
            filterCards(initialQuery);
        }

        var clear = document.querySelector("[data-clear-search]");
        if (clear) {
            clear.addEventListener("click", function () {
                filterInputs.forEach(function (input) {
                    input.value = "";
                });
                filterCards("");
                window.history.replaceState({}, document.title, window.location.pathname);
            });
        }
    });
})();
