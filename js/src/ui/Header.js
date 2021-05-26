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
