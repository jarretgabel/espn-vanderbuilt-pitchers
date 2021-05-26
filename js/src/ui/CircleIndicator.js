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
