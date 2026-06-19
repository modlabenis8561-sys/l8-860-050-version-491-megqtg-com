(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function getRoot() {
        return document.body.getAttribute("data-root") || "./";
    }

    function normalize(value) {
        return (value || "").toString().trim().toLowerCase();
    }

    function setupMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var panel = document.querySelector("[data-mobile-panel]");
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener("click", function () {
            panel.classList.toggle("is-open");
        });
    }

    function setupGlobalSearch() {
        var forms = document.querySelectorAll("[data-global-search]");
        forms.forEach(function (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                var input = form.querySelector("input");
                var keyword = input ? input.value.trim() : "";
                var target = getRoot() + "search.html";
                if (keyword) {
                    target += "?q=" + encodeURIComponent(keyword);
                }
                window.location.href = target;
            });
        });
    }

    function filterCards(targetSelector, keyword, type) {
        var target = document.querySelector(targetSelector);
        if (!target) {
            return;
        }
        var normalizedKeyword = normalize(keyword);
        var normalizedType = normalize(type);
        var cards = target.querySelectorAll(".movie-card");
        cards.forEach(function (card) {
            var haystack = normalize([
                card.getAttribute("data-title"),
                card.getAttribute("data-genre"),
                card.getAttribute("data-tags"),
                card.getAttribute("data-region"),
                card.getAttribute("data-year"),
                card.getAttribute("data-type")
            ].join(" "));
            var cardType = normalize(card.getAttribute("data-type"));
            var matchesKeyword = !normalizedKeyword || haystack.indexOf(normalizedKeyword) !== -1;
            var matchesType = !normalizedType || normalizedType === "all" || cardType === normalizedType;
            card.classList.toggle("hidden-by-filter", !(matchesKeyword && matchesType));
        });
    }

    function setupLocalSearch() {
        var inputs = document.querySelectorAll("[data-card-search]");
        inputs.forEach(function (input) {
            var target = input.getAttribute("data-target");
            if (!target) {
                return;
            }
            input.addEventListener("input", function () {
                var activeButton = document.querySelector('[data-filter-target="' + target + '"].is-active');
                var type = activeButton ? activeButton.getAttribute("data-filter-value") : "all";
                filterCards(target, input.value, type);
            });
        });
        var params = new URLSearchParams(window.location.search);
        var q = params.get("q") || "";
        if (q) {
            inputs.forEach(function (input) {
                input.value = q;
                var target = input.getAttribute("data-target");
                if (target) {
                    filterCards(target, q, "all");
                }
            });
        }
    }

    function setupFilterButtons() {
        var buttons = document.querySelectorAll("[data-filter-target]");
        buttons.forEach(function (button) {
            button.addEventListener("click", function () {
                var target = button.getAttribute("data-filter-target");
                var value = button.getAttribute("data-filter-value") || "all";
                document.querySelectorAll('[data-filter-target="' + target + '"]').forEach(function (item) {
                    item.classList.toggle("is-active", item === button);
                });
                var input = document.querySelector('[data-card-search][data-target="' + target + '"]');
                filterCards(target, input ? input.value : "", value);
            });
        });
    }

    function setupHero() {
        var carousel = document.querySelector("[data-hero-carousel]");
        if (!carousel) {
            return;
        }
        var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll(".hero-dot"));
        var prev = carousel.querySelector("[data-hero-prev]");
        var next = carousel.querySelector("[data-hero-next]");
        if (slides.length <= 1) {
            return;
        }
        var current = 0;
        var timer = null;
        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }
        function start() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5600);
        }
        if (prev) {
            prev.addEventListener("click", function () {
                show(current - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(current + 1);
                start();
            });
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
                start();
            });
        });
        show(0);
        start();
    }

    function setupPlayers() {
        var players = document.querySelectorAll("[data-player]");
        players.forEach(function (player) {
            var video = player.querySelector("video");
            var cover = player.querySelector(".player-cover");
            if (!video) {
                return;
            }
            var stream = video.getAttribute("data-stream") || "";
            var loaded = false;
            function load() {
                if (!stream) {
                    return;
                }
                if (!loaded) {
                    if (video.canPlayType("application/vnd.apple.mpegurl")) {
                        video.src = stream;
                    } else if (window.Hls && window.Hls.isSupported()) {
                        var hls = new window.Hls({ enableWorker: true });
                        hls.loadSource(stream);
                        hls.attachMedia(video);
                        player.hlsInstance = hls;
                    } else {
                        video.src = stream;
                    }
                    loaded = true;
                }
                player.classList.add("is-playing");
                var promise = video.play();
                if (promise && typeof promise.catch === "function") {
                    promise.catch(function () {});
                }
            }
            if (cover) {
                cover.addEventListener("click", load);
            }
            video.addEventListener("click", function () {
                if (!loaded) {
                    load();
                }
            });
        });
    }

    ready(function () {
        setupMenu();
        setupGlobalSearch();
        setupLocalSearch();
        setupFilterButtons();
        setupHero();
        setupPlayers();
    });
})();
