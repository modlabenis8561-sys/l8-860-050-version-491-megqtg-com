(function () {
  var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
  if (!players.length) {
    return;
  }

  players.forEach(function (player) {
    var video = player.querySelector('video');
    var button = player.querySelector('[data-play-button]');
    if (!video || !button) {
      return;
    }

    var source = video.getAttribute('data-src');
    var ready = false;

    var attach = function () {
      if (ready || !source) {
        return;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
      ready = true;
    };

    var start = function () {
      attach();
      player.classList.add('is-playing');
      video.setAttribute('controls', 'controls');
      var playPromise = video.play();
      if (playPromise && playPromise.catch) {
        playPromise.catch(function () {
          player.classList.remove('is-playing');
        });
      }
    };

    button.addEventListener('click', start);
    video.addEventListener('click', function () {
      if (!ready || video.paused) {
        start();
      }
    });
    video.addEventListener('play', function () {
      player.classList.add('is-playing');
    });
    video.addEventListener('ended', function () {
      player.classList.remove('is-playing');
    });
  });
})();
