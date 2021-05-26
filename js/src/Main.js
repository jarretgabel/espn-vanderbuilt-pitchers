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
