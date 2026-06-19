(function () {
    "use strict";

    var hlsLoader = null;
    var hlsCdnUrl = "https://cdn.jsdelivr.net/npm/hls.js@1.5.17/dist/hls.min.js";

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function loadHlsLibrary() {
        if (window.Hls) {
            return Promise.resolve(window.Hls);
        }

        if (hlsLoader) {
            return hlsLoader;
        }

        hlsLoader = new Promise(function (resolve, reject) {
            var script = document.createElement("script");
            script.src = hlsCdnUrl;
            script.async = true;
            script.onload = function () {
                resolve(window.Hls);
            };
            script.onerror = function () {
                reject(new Error("HLS library failed to load"));
            };
            document.head.appendChild(script);
        });

        return hlsLoader;
    }

    function setPlayerStatus(player, message) {
        var status = player.querySelector("[data-player-status]");
        if (status) {
            status.textContent = message;
        }
    }

    function startPlayer(player) {
        var video = player.querySelector("video");
        var source = player.getAttribute("data-stream");

        if (!video || !source) {
            setPlayerStatus(player, "播放线路暂时忙，请稍后再试");
            return;
        }

        player.classList.add("is-playing");
        setPlayerStatus(player, "正在加载高清线路");

        function playAfterSourceReady() {
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(function () {
                    setPlayerStatus(player, "点击视频控件继续播放");
                });
            }
        }

        if (source.indexOf(".m3u8") > -1 && video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
            video.addEventListener("loadedmetadata", playAfterSourceReady, { once: true });
            setPlayerStatus(player, "原生 HLS 播放中");
            return;
        }

        if (source.indexOf(".m3u8") > -1) {
            loadHlsLibrary()
                .then(function (Hls) {
                    if (Hls && Hls.isSupported()) {
                        var hls = new Hls({
                            enableWorker: true,
                            lowLatencyMode: true
                        });
                        hls.loadSource(source);
                        hls.attachMedia(video);
                        hls.on(Hls.Events.MANIFEST_PARSED, function () {
                            setPlayerStatus(player, "HLS 高清播放中");
                            playAfterSourceReady();
                        });
                        hls.on(Hls.Events.ERROR, function () {
                            setPlayerStatus(player, "播放线路暂时忙，请稍后再试");
                        });
                        player._hls = hls;
                    } else {
                        video.src = source;
                        playAfterSourceReady();
                    }
                })
                .catch(function () {
                    video.src = source;
                    playAfterSourceReady();
                });
            return;
        }

        video.src = source;
        playAfterSourceReady();
        setPlayerStatus(player, "高清播放中");
    }

    function initPlayers() {
        document.querySelectorAll(".video-player").forEach(function (player) {
            var button = player.querySelector("[data-play-button]");
            var video = player.querySelector("video");

            if (button) {
                button.addEventListener("click", function () {
                    startPlayer(player);
                });
            }

            if (video) {
                video.addEventListener("play", function () {
                    player.classList.add("is-playing");
                    setPlayerStatus(player, "高清播放中");
                });
                video.addEventListener("error", function () {
                    setPlayerStatus(player, "播放线路暂时忙，请稍后再试");
                });
            }
        });
    }

    function initHero() {
        document.querySelectorAll("[data-hero]").forEach(function (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
            var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
            var prev = hero.querySelector("[data-hero-prev]");
            var next = hero.querySelector("[data-hero-next]");
            var index = 0;
            var timer = null;

            if (!slides.length) {
                return;
            }

            function show(nextIndex) {
                index = (nextIndex + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle("is-active", slideIndex === index);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle("is-active", dotIndex === index);
                });
            }

            function restart() {
                window.clearInterval(timer);
                timer = window.setInterval(function () {
                    show(index + 1);
                }, 5200);
            }

            dots.forEach(function (dot) {
                dot.addEventListener("click", function () {
                    show(Number(dot.getAttribute("data-hero-dot")) || 0);
                    restart();
                });
            });

            if (prev) {
                prev.addEventListener("click", function () {
                    show(index - 1);
                    restart();
                });
            }

            if (next) {
                next.addEventListener("click", function () {
                    show(index + 1);
                    restart();
                });
            }

            show(0);
            restart();
        });
    }

    function initFiltering() {
        var inputs = Array.prototype.slice.call(document.querySelectorAll("[data-filter-input]"));

        function applyFilter(value) {
            var keyword = normalize(value);
            document.querySelectorAll(".movie-card").forEach(function (card) {
                var haystack = normalize(card.getAttribute("data-search"));
                card.classList.toggle("is-hidden", Boolean(keyword) && haystack.indexOf(keyword) === -1);
            });
        }

        inputs.forEach(function (input) {
            input.addEventListener("input", function () {
                applyFilter(input.value);
            });
        });

        document.querySelectorAll("[data-filter-chip]").forEach(function (chip) {
            chip.addEventListener("click", function () {
                var value = chip.getAttribute("data-filter-chip") || chip.textContent;
                inputs.forEach(function (input) {
                    input.value = value;
                });
                applyFilter(value);
            });
        });

        var params = new URLSearchParams(window.location.search);
        var query = params.get("q");
        if (query && inputs.length) {
            inputs.forEach(function (input) {
                input.value = query;
            });
            applyFilter(query);
        }
    }

    function initCategoryJump() {
        document.querySelectorAll("[data-category-jump]").forEach(function (select) {
            select.addEventListener("change", function () {
                if (select.value) {
                    window.location.href = select.value + ".html";
                }
            });
        });
    }

    function initMobileMenu() {
        var button = document.querySelector("[data-menu-toggle]");
        var panel = document.querySelector("[data-mobile-panel]");

        if (!button || !panel) {
            return;
        }

        button.addEventListener("click", function () {
            panel.classList.toggle("is-open");
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        initMobileMenu();
        initHero();
        initFiltering();
        initCategoryJump();
        initPlayers();
    });
})();
