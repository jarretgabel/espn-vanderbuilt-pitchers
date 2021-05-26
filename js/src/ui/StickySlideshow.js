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

    asset.play();

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
