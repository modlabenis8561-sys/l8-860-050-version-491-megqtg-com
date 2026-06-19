(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var panels = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
        panels.forEach(function (panel) {
            var video = panel.querySelector("video[data-stream]");
            var button = panel.querySelector("[data-play]");
            var source = video ? video.getAttribute("data-stream") : "";
            var hls = null;

            function attach() {
                if (!video || !source || video.getAttribute("data-ready") === "1") {
                    return;
                }
                if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                } else {
                    video.src = source;
                }
                video.setAttribute("data-ready", "1");
            }

            function play() {
                attach();
                panel.classList.add("is-playing");
                var promise = video.play();
                if (promise && typeof promise.catch === "function") {
                    promise.catch(function () {
                        panel.classList.remove("is-playing");
                    });
                }
            }

            if (button) {
                button.addEventListener("click", play);
            }

            if (video) {
                video.addEventListener("play", function () {
                    panel.classList.add("is-playing");
                });
                video.addEventListener("pause", function () {
                    if (!video.ended) {
                        panel.classList.remove("is-playing");
                    }
                });
                video.addEventListener("ended", function () {
                    panel.classList.remove("is-playing");
                });
                video.addEventListener("click", function () {
                    if (video.paused) {
                        play();
                    }
                });
                window.addEventListener("beforeunload", function () {
                    if (hls && typeof hls.destroy === "function") {
                        hls.destroy();
                    }
                });
            }
        });
    });
})();
