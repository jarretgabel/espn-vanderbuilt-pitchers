function CircleIndicator(speed) {

  var _instance = document.createElement('div');

  var CLASS_NAME = 'circle-indicator';
  var TRANSITION_SPEED = 0;//300; // milliseconds

  var _leftInner;
  var _rightInner;
  var _animObj = {
    progress: 0
  };

  function init() {
    _instance.classList.add(CLASS_NAME);

    buildMasks();
  }

  function buildMasks() {
    var leftMask = document.createElement('div');
    leftMask.classList.add(CLASS_NAME + '__mask');
    leftMask.classList.add(CLASS_NAME + '__mask--left');
    _instance.appendChild(leftMask);

    _leftInner = document.createElement('div');
    _leftInner.classList.add(CLASS_NAME + '__inner');
    leftMask.appendChild(_leftInner);

    var rightMask = document.createElement('div');
    rightMask.classList.add(CLASS_NAME + '__mask');
    rightMask.classList.add(CLASS_NAME + '__mask--right');
    _instance.appendChild(rightMask);

    _rightInner = document.createElement('div');
    _rightInner.classList.add(CLASS_NAME + '__inner');
    rightMask.appendChild(_rightInner);
  }


  /*
    Event handlers
  */

  function handleAnimationComplete(e) {
    TweenLite.to([_rightInner, _leftInner], TRANSITION_SPEED / 1000, {
      opacity: 0,
      ease: Linear.easeNone,
      onComplete: _instance.start
    });
  }


  /*
    Public methods
  */

  _instance.start = function(spd) {
    TweenLite.killTweensOf(_animObj);

    if (spd) {
      speed = spd;
    }

    _animObj.progress = 0;

    TweenLite.set([_instance, _rightInner, _leftInner], {
      opacity: 1,
      rotation: 0
    });

    TweenLite.to(_animObj, (speed - TRANSITION_SPEED) / 1000, {
      progress: 1,
      ease: Linear.easeNone,
      onUpdate: function() {
        if (_animObj.progress < .5) {
          // _rightInner
          TweenLite.set(_rightInner, {
            rotation: 180 * (_animObj.progress * 2)
          });
        } else {
          // _leftInner
          TweenLite.set(_leftInner, {
            rotation: 180 * ((_animObj.progress - .5) * 2)
          });
        }
      },
      onComplete: handleAnimationComplete
    })
  };

  _instance.stop = function() {
    TweenLite.killTweensOf(_animObj);

    TweenLite.to([_instance, _rightInner, _leftInner], TRANSITION_SPEED / 1000, {
      opacity: 0,
      ease: Linear.easeNone
    });
  };

  _instance.jumpTo = function(perc) {
    _animObj.progress = perc;

    if (_animObj.progress < .5) {
      // _rightInner
      TweenLite.set(_leftInner, {
        rotation: -2
      });

      TweenLite.set(_rightInner, {
        rotation: 180 * (_animObj.progress * 2)
      });
    } else {
      // _leftInner
      TweenLite.set(_leftInner, {
        rotation: 180 * ((_animObj.progress - .5) * 2)
      });

      TweenLite.set(_rightInner, {
        rotation: 180
      });
    }
  };

  init();

  return _instance;
}

function Header(node) {

  var _instance = {};

  var _video;
  var _videoAspectRatio;

  function init() {
    _video = node.querySelector('.header__video');
    _videoAspectRatio = _video.width / _video.height;

    addListeners();
    handleResize();
  }

  function addListeners() {
    if (Modernizr.touch) {
      window.addEventListener('orientationchange', handleOrientationChange);
    } else {
      window.addEventListener('resize', handleResize);
    }
  }

  function handleResize(e) {
    node.style.height = window.innerHeight + 'px';

    var maxWidth = window.innerWidth;
    var maxHeight = window.innerHeight;
    var destinWidth = maxWidth;
    var destinHeight = destinWidth / _videoAspectRatio;

    if (destinHeight < maxHeight) {
      destinHeight = maxHeight;
      destinWidth = destinHeight * _videoAspectRatio;
    }

    _video.style.width = Math.round(destinWidth) + 'px';
    _video.style.height = Math.round(destinHeight) + 'px';
    _video.style.top = Math.round((maxHeight - destinHeight) * .5) + 'px';
    _video.style.left = Math.round((maxWidth - destinWidth) * .5) + 'px';
  }

  function handleOrientationChange(e) {
    handleResize();
    setTimeout(handleResize, 500);
    setTimeout(handleResize, 1000);
  }

  init();

  return _instance;
}

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

      // console.log('tracking --', fullStr);

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
      // _asset.style.top = Math.round((maxHeight - destinHeight) * 0.5) + 'px';
      _asset.style.top = 0;
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

function StickySlideshow(node) {
  var _instance = {};

  var CLASS_NAME = 'sticky-slideshow';

  var _imageNodeList;
  var _captionNodeList;
  var _imageColumn;
  var _imageContainer;
  var _textColumn;
  var _currentIndex = 0;
  var _timerUI;
  var _intervalTimer;
  var _currentAsset;
  var _hasLoaded = false;

  function init() {
    var contentContainer = node.querySelector('.content-container')
    _imageNodeList = contentContainer.querySelectorAll('figure img, figure video');
    _captionNodeList = contentContainer.querySelectorAll('.subhead');

    // NOTE: innerHTML = '' is wiping out the content for IE
    // node.innerHTML = '';
    node.removeChild(contentContainer);

    buildImageColumn();
    buildImageContainer();
    buildImages();
    buildTimer();
    buildTextColumn();
    buildTextItems();
    
    addListeners();
    handleResize();
    // setTimeout(handleResize, 500);
  }

  function addListeners() {
    window.addEventListener('scroll', handleScroll);

    if (Modernizr.touch) {
      window.addEventListener('orientationchange', handleOrientationChange);
    } else {
      window.addEventListener('resize', handleResize);
    }
  }

  function buildImageColumn() {
    _imageColumn = document.createElement('div');
    _imageColumn.classList.add(CLASS_NAME + '__image-column');
    node.appendChild(_imageColumn);
  }

  function buildImageContainer() {
    _imageContainer = document.createElement('div');
    _imageContainer.classList.add(CLASS_NAME + '__image-container');
    _imageColumn.appendChild(_imageContainer);
  }

  function buildImages() {
    for (var j = 0; j < _imageNodeList.length; j++) {
      _imageContainer.appendChild(_imageNodeList[j]);

      if (j === 0) {
        _imageNodeList[j].classList.add('selected');
      }
    }
  }

  function buildTimer() {
    _timerUI = document.createElement('div');
    _timerUI.classList.add(CLASS_NAME + '__timer');
    _imageColumn.appendChild(_timerUI);

    var circle = new CircleIndicator(5000);
    _timerUI.appendChild(circle);

    _timerUI.circle = circle;
  }

  function buildTextColumn() {
    _textColumn = document.createElement('div');
    _textColumn.classList.add(CLASS_NAME + '__text-column');
    node.appendChild(_textColumn);
  }

  function buildTextItems() {
    for (var j = 0; j < _captionNodeList.length; j++) {
      var textItem = document.createElement('div');
      textItem.classList.add(CLASS_NAME + '__text-item');
      _textColumn.appendChild(textItem);

      var txt = document.createElement('div');
      txt.classList.add(CLASS_NAME + '__txt');
      txt.classList.add('subhead');
      txt.classList.add('alt');
      txt.classList.add('small');
      txt.innerHTML = '<span>' + _captionNodeList[j].innerHTML + '</span>';
      textItem.appendChild(txt);
    }
  }

  function loadAssets(initialLoadSide) {
    // loop through imgs
    // swap data-image for the src
    var len = _imageContainer.children.length;
    for (var j = 0; j < len; j++) {
      var asset = _imageContainer.children[j];

      if (asset.getAttribute('data-image')) {
        // detect image
        asset.src = asset.getAttribute('data-image');
      } else {
        // detect video
        // var video;

        asset.preload = 'auto';
        asset.muted = true;
        asset.loop = true;
        asset.volume = 0;
        asset.poster = asset.getAttribute('data-poster');
        asset.setAttribute('playsinline', '');

        if (!asset.defaultSrc) {
          asset.defaultSrc = asset.src;
        }

        asset.src = asset.defaultSrc;

        if (initialLoadSide === 'start' && j === 0) {
          startVideo(asset);
        } else if (initialLoadSide === 'end' && j === len - 1) {
          startVideo(asset);
        }
      }
    }

    if (_intervalTimer) {
      clearInterval(_intervalTimer);
      _intervalTimer = null;
    }

    _timerUI.style.display = 'none';

    _intervalTimer = setInterval(handleVideoTick, 20);

    // handleResize();
    positionTimerUI();
  }

  function handleVideoTick() {
    if (_currentAsset.duration) {
      if (_currentAsset.currentTime) {
        _timerUI.circle.jumpTo(_currentAsset.currentTime / _currentAsset.duration);

        if (_timerUI.style.display === 'none') {
          _timerUI.style.display = '';

          positionTimerUI();
        }
      }
    }
  }

  function unloadAssets() {
    if (_intervalTimer) {
      clearInterval(_intervalTimer);
      _intervalTimer = null;
    }

    for (var j = 0; j < _imageContainer.children.length; j++) {
      var asset = _imageContainer.children[j];

      if (asset.pause) {
        asset.pause();
        asset.removeAttribute('src');
        asset.load();
      }
    }
  }

  function startVideo(asset, previousAsset) {
    if (previousAsset) {
      previousAsset.pause();
    }

    if (asset.currentTime) {
      asset.currentTime = 0;
    }

    const container = asset.closest('.sticky-slideshow__image-column');

    const timer = container.querySelector('.sticky-slideshow__timer');

    if(asset.src.indexOf('.jpg') > -1) {
      timer.classList.add('disabled');
    } else {
      timer.classList.remove('disabled');
      asset.play();
    }

    _currentAsset = asset;
  }

  function positionTimerUI() {
    _timerUI.style.marginTop = Math.round(_imageContainer.children[0].clientHeight * .5) - 35 + 'px';
    _timerUI.style.marginLeft = Math.round(_imageContainer.children[0].clientWidth * .5) - 35 + 'px';
  }


  /**
    Event Handlers
  **/

  function handleResize() {
    // _imageContainer.style.top = Math.round((window.innerHeight - _imageContainer.clientHeight) * .5) + 'px';
    var offset = (window.innerWidth < 600) ? window.innerHeight * .5 : 0;
    var galleryHeight = (window.innerHeight * _captionNodeList.length);

    node.style.height = galleryHeight + (offset * 2) + 'px';

    // TODO: loop through _imageContainer.children and resize/reposition each img
    // for (var j = 0; j < _imageContainer.children.length; j++) {
    //   var img = _imageContainer.children[j];
    //   var aspectRatio = img.width / img.height;
    // }

    positionTimerUI();

    _imageColumn.style.height = window.innerHeight + 'px';
    _textColumn.style.paddingTop = (window.innerWidth < 600) ? Math.round(window.innerHeight * .5) : '';

    for (var u = 0; u < _textColumn.children.length; u++) {
      var textItem = _textColumn.children[u];
      textItem.style.height = window.innerHeight + 'px';

      var txt = textItem.children[0];
      txt.style.marginTop = (-txt.clientHeight * .5) + 'px';
    }

    handleScroll();
  }

  function handleOrientationChange(e) {
    handleResize();
    setTimeout(handleResize, 500);
    setTimeout(handleResize, 1000);
  }

  function handleScroll() {
    // handleResize();

    var viewportHeight = _textColumn.children[0].clientHeight;
    var scrollPosY = window.pageYOffset || document.documentElement.scrollTop;
    var boundaryTop = node.offsetTop;
    var boundaryBottom = boundaryTop + node.clientHeight - viewportHeight;
    var offset = (window.innerWidth < 600) ? viewportHeight * .5 : 0;
    var maxTop = boundaryTop - window.innerHeight;
    var maxBottom = boundaryBottom + window.innerHeight;

    // check within larger boundaries
    if (scrollPosY >= maxTop && scrollPosY <= maxBottom) {
      // coming into view

      if (!_hasLoaded) {
        _hasLoaded = true;

        var diff = maxBottom - maxTop;
        var halfDiff = diff * .5;
        var initialLoadSide = (scrollPosY - maxTop < halfDiff) ? 'start' : 'end';

        loadAssets(initialLoadSide);
      }
    } else {
      if (_hasLoaded) {
        _hasLoaded = false;
        unloadAssets();
      }
    }

    if (scrollPosY >= boundaryTop && scrollPosY <= boundaryBottom) {
      node.classList.add('sticky');

      // TODO: determine which text is in view
      // use that index to determine which image to show
      var internalScrollAmount = scrollPosY - boundaryTop - offset;
      var selectedIndex = Math.round(internalScrollAmount / viewportHeight);

      if (_currentIndex !== selectedIndex) {
        _imageContainer.children[_currentIndex].classList.remove('selected');
        _imageContainer.children[selectedIndex].classList.add('selected');

        startVideo(_imageContainer.children[selectedIndex], _imageContainer.children[_currentIndex]);

        // if (_imageContainer.children[_currentIndex].pause) {
        //   _imageContainer.children[_currentIndex].pause();
        // }
        //
        // if (_imageContainer.children[selectedIndex].play) {
        //   if (_imageContainer.children[selectedIndex].currentTime) {
        //     _imageContainer.children[selectedIndex].currentTime = 0;
        //   }
        //
        //   _imageContainer.children[selectedIndex].play();
        //   _timerUI.circle.start(_imageContainer.children[selectedIndex].duration * 1000);
        // }

        _currentIndex = selectedIndex;
      }

    } else {
      node.classList.remove('sticky');

      if (scrollPosY > boundaryBottom) {
        node.classList.add('sticky--bottom');
      } else {
        node.classList.remove('sticky--bottom');
      }
    }
  }

  init();

  return _instance;
}

(function WindowScroll(window) {

	var _instance = {};

	var _obj = {};
	var _scrollElement;
	var _isAnimating = false;

	_instance.init = function() {
		_scrollElement = window;

		_instance._setPositions();

		_scrollElement.addEventListener('scroll', function(e) {
			_instance._setPositions(e);
		});
	}

	_instance.scroll = function(opts) {
		var options = {
			x: 0,
			y: 0,
			speed: .8,
			ease: Quad.easeInOut,
			animate: true,
			onComplete: function() {},
			onUpdate: function() {}
		}

		for (var o in opts) {
			options[o] = opts[o];
		}

		_obj.x = _instance.getPositionX();
		_obj.y = _instance.getPositionY();

		// window.scrollTo(options.x, options.y);
		// _instance._setPositions();

		if (options.animate === true) {
			_isAnimating = true;

			TweenLite.killTweensOf(_obj);
			TweenLite.to(_obj, options.speed, {
				onUpdate: update,
				x: options.x,
				y: options.y,
				ease: options.ease,
				onComplete: function() {
					_isAnimating = false;

					options.onComplete();
				}
			});
		} else {
			TweenLite.killTweensOf(_obj);

			window.scrollTo(options.x, options.y);
			_instance._setPositions();
		}
	};

	function update() {
		window.scrollTo(_obj.x, _obj.y);
	}

	_instance._setPositions = function(e) {
		_obj.x = window.pageXOffset;// || _scrollElement.scrollLeft;
		_obj.y = window.pageYOffset;// || _scrollElement.scrollTop;

		if (_obj.x < 0) {
			_obj.x = 0;
		}

		if (_obj.y <= 0) {
			_obj.y = 0;
		}
	};

	_instance.getPositionX = function() {
		return _obj.x;
	};

	_instance.getPositionY = function() {
		return _obj.y;
	};

	_instance.getDocumentHeight = function() {
		var body = document.body;
    var html = document.documentElement;

		var height = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);

		return height;
	};

	_instance.killScroll = function() {
		TweenLite.killTweensOf(_obj);
	};

	window.WindowScroll = _instance;

})(window);

(function() {

  var _instance = {};

  _instance.init = function() {
    WindowScroll.init();

    buildHeader();
    buildStickySlideshows();
    buildScrollButton();
    buildSectionHeaders();

    addListeners();
    handleResize();

    var canESPNAndTrack = espn && espn.track;
    if (canESPNAndTrack) {
      var baseStr = document.querySelector('.staples-center').getAttribute('data-tracking-name');
      var fullStr = 'espncom:' + baseStr + ':load';

      espn.track.trackLink({
        linkPos: fullStr,
        linkId: null
      });
    }
  };

  function addListeners() {
    if (Modernizr.touch) {
      window.addEventListener('orientationchange', handleOrientationChange);
    } else {
      window.addEventListener('resize', handleResize);
    }
  }

  function buildHeader() {
    var h = new Header(document.querySelector('.header'));
  }

  function buildStickySlideshows() {
    var nodeList = document.querySelectorAll('.sticky-slideshow');

    for (var j = 0; j < nodeList.length; j++) {
      var stickySlideshow = new StickySlideshow(nodeList[j]);
    }
  }

  function buildScrollButton() {
    var btn = document.querySelector('.header__button');
    if (btn) {
      btn.addEventListener('click', function(e) {
        // window.scrollTo(0, window.innerHeight);
        WindowScroll.scroll({
          y: window.innerHeight,
          speed: .7,
          ease: Quart.easeInOut
        });
      });
    }
  }

  function buildSectionHeaders() {
    // section-header
    var headers = document.querySelectorAll('.section-header');

    for (var j = 0; j < headers.length; j++) {
      var headerNode = headers[j];
      var sectionHeader = new SectionHeader(headerNode);
    }
  }


  /**
    Event Handlers
  **/

  function handleResize(e) {

  }

  function handleOrientationChange(e) {
    handleResize();
    setTimeout(handleResize, 500);
    setTimeout(handleResize, 1000);
  }

  window.Main = _instance;
})();

window.onload = Main.init;

window.onunload = function() {
  window.scrollTo(0, 0);
}
