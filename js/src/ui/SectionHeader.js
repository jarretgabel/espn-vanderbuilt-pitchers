function SectionHeader(node) {
  var _instance = {};

  var CLASS_NAME = 'section-header';

  var _asset;
  var _hasLoaded = false;
  var _isVideo = false;
  var _videoAspectRatio = 0;
  var _isPlaying = false;

  function init() {
    _asset = node.querySelector('.' + CLASS_NAME + '__image');

    if (!_asset) {
      _isVideo = true;
      _asset = node.querySelector('.' + CLASS_NAME + '__video');
      _videoAspectRatio = _asset.width / _asset.height;
    } else {
      TweenLite.set(_asset, {
        scale: 1.2
      });
    }

    addListeners();
    handleScroll();
    handleResize();
  }

  function addListeners() {
    window.addEventListener('scroll', handleScroll);

    if (Modernizr.touch) {
      window.addEventListener('orientationchange', handleOrientationChange);
    } else {
      window.addEventListener('resize', handleResize);
    }
  }

  function loadImage() {
    // var sectionName = node.getAttribute('data-section');
    // _asset.classList.add(sectionName);

    if (_isVideo) {
      _asset.preload = 'auto';
      _asset.muted = true;
      _asset.loop = true;
      _asset.volume = 0;
      _asset.poster = _asset.getAttribute('data-poster');
      _asset.setAttribute('playsinline', '');
    }

    var sectionName = node.getAttribute('data-section');
    if (sectionName) {
      trackEvent('section:' + sectionName);
    }
  }

  function trackEvent(str) {
    var canESPNAndTrack = espn && espn.track;

    if (canESPNAndTrack) {
      var baseStr = document.querySelector('.staples-center').getAttribute('data-tracking-name');
      var fullStr = 'espncom:' + baseStr + ':' + str;

      console.log('tracking --', fullStr);

      espn.track.trackLink({
        linkPos: fullStr,
        linkId: null
      });
    }
  }

  /**
    Event handlers
  **/

  function handleResize(e) {
    var headerHeight = Math.round(window.innerHeight * .8);
    node.style.height = headerHeight + 'px';

    if (_isVideo) {
      // video needs to cover node width and height
      var maxWidth = window.innerWidth;
      var maxHeight = headerHeight;
      var destinWidth = maxWidth;
      var destinHeight = destinWidth / _videoAspectRatio;

      if (destinHeight < maxHeight) {
        destinHeight = maxHeight;
        destinWidth = destinHeight * _videoAspectRatio;
      }

      _asset.style.width = Math.round(destinWidth) + 'px';
      _asset.style.height = Math.round(destinHeight) + 'px';
      _asset.style.top = Math.round((maxHeight - destinHeight) * .5) + 'px';
      _asset.style.left = Math.round((maxWidth - destinWidth) * .5) + 'px';
    }
  }

  function handleOrientationChange(e) {
    handleResize();
    setTimeout(handleResize, 500);
    setTimeout(handleResize, 1000);
  }

  function handleScroll() {
    var scrollPosY = window.pageYOffset || document.documentElement.scrollTop;
    var boundaryTop = node.offsetTop;
    var boundaryBottom = boundaryTop + node.clientHeight - window.innerHeight;

    // coming into view, add selector, which loads an image
    if (scrollPosY > boundaryTop - (window.innerHeight * 1.5) && scrollPosY < boundaryBottom + (window.innerHeight * 1.2)) {
      if (!_hasLoaded) {
        _hasLoaded = true;
        loadImage();
      }
    }

    if (scrollPosY > boundaryTop - window.innerHeight && scrollPosY < boundaryBottom + window.innerHeight) {
      if (_isVideo) {
        if (!_isPlaying) {
          _isPlaying = true;

          if (_asset.currentTime) {
            _asset.currentTime = 0;
          }

          _asset.play();
        }
      } else {
        var internalScrollAmount = Math.abs(boundaryTop - window.innerHeight - scrollPosY);
        var range = window.innerHeight + node.clientHeight;
        var perc = internalScrollAmount / range;
        perc = Math.min(1, perc);
        perc = Math.max(0, perc);

        // scale from 1.2 to 1 as perc increases
        var destinScale = 1.2 - (.2 * perc);

        TweenLite.to(_asset, .3, {
          scale: destinScale,
          ease: Quad.easeOut
        });
      }
    } else if (_isPlaying) {
      _isPlaying = false;

      _asset.pause();
    }


  }

  init();

  return _instance;
};
