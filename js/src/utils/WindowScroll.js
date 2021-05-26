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
