'use strict';

var rfp = {};

rfp.fromTarget = function fromTarget(css, type) {

    var target = document.querySelector (css);
	return function (fn) { 
		target.addEventListener(type, function (e) {
			fn(e);
		});
	};

};

rfp.fromTargetAll = function fromTargetAll(css, type) {

	var targets = document.querySelectorAll (css);
	return function (fn) { 
		[].forEach.call(targets, function (target) {
			target.addEventListener(type, function (e) {
                fn(e);
            });
		});
	};

};

rfp.fromValues = function fromValues (values, ms) {

	return function (fn) {
		var idx = 0;
		var hn  = fn || function () {};
		setInterval (function () {
			fn(values[idx]);
			idx = (idx + 1) % values.length;
		}, ms || 1000);
	};

};

rfp.serie = function serie (fn, base) {

	var value = base;
	return function () {
		value = fn(value);
		return value;
	};

};

rfp.fromSerie = function fromSerie (serie, ms) {

	return function (fn) {
		var hn = fn || function () {};
		setInterval (function () {
			var value = serie();
			fn(value);
		}, ms || 1000);
	};

};

rfp.Stream = function Stream (source) {

	function map (fn) { 
		return function () {
            return fn.apply(this, arguments);
		};
	}

	function filter (fn) {
		return function () { 
			var out = fn.apply (this, arguments);
			if (out) return arguments[0];
		};
	}

	function scan (fn, b) {
		var ac = b;
		return function () {
			var args = [].slice.call (arguments);
			ac = fn.apply (this, [ac].concat(args));
			return ac;
		};
	}

	function fluent (hn) {
		var cb = hn || function () {};
		return function (fn) {
			return function () {
				cb(fn.apply(this, arguments));
				return this;
			};
		};
	}

	function sequence (fns) {
		return function (x) {
			return fns.reduce (function (ac, fn) {
				return (ac !== void 0) ? 
					fn(ac) : 
					void 0; 
			}, x);
		};
	}

    var fns = [];
    var lns = [];
    var define = fluent (function (fn) {
         fns.push (fn);
    });

    return {

		map   : define (map),
		filter: define (filter),
		scan  : define (scan),

        end: function () {
			var seq = sequence(fns);
			source(function (data) {
				var result = seq(data);
				lns.forEach(function (ln) {
					if (result) ln (result); 
				});
			});
			return {
				listen: function (ln) {
					lns.push(ln);
				}
			}; 
		} 
    };
};


