(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

function deepClone (a) {
  if (typeof(a) !== 'object' || a == null) return a;
  if (Array.isArray(a)) return a.slice(0).map(deepClone);
  if (a.constructor === Date) return new Date(a);
  var r = a.constructor();
  for (var i in a) r[i] = deepClone(a[i]);
  return r;
}

module.exports = deepClone;

},{}],2:[function(require,module,exports){
"use strict";

/**
 * @param {Object} target
 * @param {Array.<string>} path
 */
function get_at_path (target, path) {
  var cur = target;
  for (var i = 0; i !== path.length; ++i) {
    if (cur !== null && typeof cur === 'object') cur = cur[path[i]];
    else {
      cur = undefined;
      break;
    }
  }
  return cur;
}

module.exports = get_at_path;

},{}],3:[function(require,module,exports){
"use strict";

function identity_deduplicate_array (items, identity_comparison_function) {
  var identity_filtered_items = [];
  for (var i = 0; i < items.length; ++i) {
    var duplicate_identity_exists = false;
    var item = items[i];

    // TODO: Consider removing this special casing
    if (item == null) {
      identity_filtered_items.push(item);
      continue;
    }

    for (var j = i - 1; j !== -1; --j) {
      if (identity_comparison_function(item, items[j])) {
        duplicate_identity_exists = true;
        break;
      }
    }

    if (duplicate_identity_exists) {
      continue;
    }

    identity_filtered_items.push(item);
  }

  return identity_filtered_items;
}
module.exports = identity_deduplicate_array;

},{}],4:[function(require,module,exports){
"use strict";

var acceptable_content_editable_keys = ['Enter', 'Escape', 'Backspace'];
var acceptable_line_input = acceptable_content_editable_keys.concat(['ArrowUp', 'ArrowDown', 'Control', 'Alt']);
var acceptable_special_keys = acceptable_line_input.concat(['ArrowRight', 'ArrowLeft']);

var metakeys_not_shift = ['Control', 'Alt'];

var transform_keys = {
  up: 'ArrowUp',
  down: 'ArrowDown',
  left: 'ArrowLeft',
  right: 'ArrowRight',
  enter: 'Enter',
  esc: 'Escape',
  ctrl: 'Control',
  alt: 'Alt',
  backspace: 'Backspace'
};

var disallowed_key_codes = {
  43: 'Plus',
  62: 'Greater than'
};

function validate_key_generator(key_range) {
  var key_map = key_range.reduce(function (rv, item) {
    rv[item] = true;
    return rv;
  }, {});

  return function (key) {
    return key_map[key];
  };
}

var shared_commands = {
  validate_content_editable_key: validate_key_generator(acceptable_content_editable_keys),
  validate_line_input_key: validate_key_generator(acceptable_line_input),
  validate_special_key: validate_key_generator(acceptable_special_keys),
  validate_general_key: function (key) {
    if (key && (typeof key === 'string')) {
      if (shared_commands.validate_special_key(key)) return true;

      var key_code = key.charCodeAt(0);
      if (key.length === 1 && !disallowed_key_codes[key_code] && key_code >= 32 && key_code < 127) return true;
    }
    return false;
  },
  transform_key: function (key) {
    return transform_keys[key];
  },
  has_metakeys_not_shift: function (obj) {
    return metakeys_not_shift.some(function (a) { return obj[a]; });
  }
};

module.exports = shared_commands;

},{}],5:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var objectCreate = Object.create || objectCreatePolyfill
var objectKeys = Object.keys || objectKeysPolyfill
var bind = Function.prototype.bind || functionBindPolyfill

function EventEmitter() {
  if (!this._events || !Object.prototype.hasOwnProperty.call(this, '_events')) {
    this._events = objectCreate(null);
    this._eventsCount = 0;
  }

  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
var defaultMaxListeners = 10;

var hasDefineProperty;
try {
  var o = {};
  if (Object.defineProperty) Object.defineProperty(o, 'x', { value: 0 });
  hasDefineProperty = o.x === 0;
} catch (err) { hasDefineProperty = false }
if (hasDefineProperty) {
  Object.defineProperty(EventEmitter, 'defaultMaxListeners', {
    enumerable: true,
    get: function() {
      return defaultMaxListeners;
    },
    set: function(arg) {
      // check whether the input is a positive number (whose value is zero or
      // greater and not a NaN).
      if (typeof arg !== 'number' || arg < 0 || arg !== arg)
        throw new TypeError('"defaultMaxListeners" must be a positive number');
      defaultMaxListeners = arg;
    }
  });
} else {
  EventEmitter.defaultMaxListeners = defaultMaxListeners;
}

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function setMaxListeners(n) {
  if (typeof n !== 'number' || n < 0 || isNaN(n))
    throw new TypeError('"n" argument must be a positive number');
  this._maxListeners = n;
  return this;
};

function $getMaxListeners(that) {
  if (that._maxListeners === undefined)
    return EventEmitter.defaultMaxListeners;
  return that._maxListeners;
}

EventEmitter.prototype.getMaxListeners = function getMaxListeners() {
  return $getMaxListeners(this);
};

// These standalone emit* functions are used to optimize calling of event
// handlers for fast cases because emit() itself often has a variable number of
// arguments and can be deoptimized because of that. These functions always have
// the same number of arguments and thus do not get deoptimized, so the code
// inside them can execute faster.
function emitNone(handler, isFn, self) {
  if (isFn)
    handler.call(self);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].call(self);
  }
}
function emitOne(handler, isFn, self, arg1) {
  if (isFn)
    handler.call(self, arg1);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].call(self, arg1);
  }
}
function emitTwo(handler, isFn, self, arg1, arg2) {
  if (isFn)
    handler.call(self, arg1, arg2);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].call(self, arg1, arg2);
  }
}
function emitThree(handler, isFn, self, arg1, arg2, arg3) {
  if (isFn)
    handler.call(self, arg1, arg2, arg3);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].call(self, arg1, arg2, arg3);
  }
}

function emitMany(handler, isFn, self, args) {
  if (isFn)
    handler.apply(self, args);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].apply(self, args);
  }
}

EventEmitter.prototype.emit = function emit(type) {
  var er, handler, len, args, i, events;
  var doError = (type === 'error');

  events = this._events;
  if (events)
    doError = (doError && events.error == null);
  else if (!doError)
    return false;

  // If there is no 'error' event listener then throw.
  if (doError) {
    if (arguments.length > 1)
      er = arguments[1];
    if (er instanceof Error) {
      throw er; // Unhandled 'error' event
    } else {
      // At least give some kind of context to the user
      var err = new Error('Unhandled "error" event. (' + er + ')');
      err.context = er;
      throw err;
    }
    return false;
  }

  handler = events[type];

  if (!handler)
    return false;

  var isFn = typeof handler === 'function';
  len = arguments.length;
  switch (len) {
      // fast cases
    case 1:
      emitNone(handler, isFn, this);
      break;
    case 2:
      emitOne(handler, isFn, this, arguments[1]);
      break;
    case 3:
      emitTwo(handler, isFn, this, arguments[1], arguments[2]);
      break;
    case 4:
      emitThree(handler, isFn, this, arguments[1], arguments[2], arguments[3]);
      break;
      // slower
    default:
      args = new Array(len - 1);
      for (i = 1; i < len; i++)
        args[i - 1] = arguments[i];
      emitMany(handler, isFn, this, args);
  }

  return true;
};

function _addListener(target, type, listener, prepend) {
  var m;
  var events;
  var existing;

  if (typeof listener !== 'function')
    throw new TypeError('"listener" argument must be a function');

  events = target._events;
  if (!events) {
    events = target._events = objectCreate(null);
    target._eventsCount = 0;
  } else {
    // To avoid recursion in the case that type === "newListener"! Before
    // adding it to the listeners, first emit "newListener".
    if (events.newListener) {
      target.emit('newListener', type,
          listener.listener ? listener.listener : listener);

      // Re-assign `events` because a newListener handler could have caused the
      // this._events to be assigned to a new object
      events = target._events;
    }
    existing = events[type];
  }

  if (!existing) {
    // Optimize the case of one listener. Don't need the extra array object.
    existing = events[type] = listener;
    ++target._eventsCount;
  } else {
    if (typeof existing === 'function') {
      // Adding the second element, need to change to array.
      existing = events[type] =
          prepend ? [listener, existing] : [existing, listener];
    } else {
      // If we've already got an array, just append.
      if (prepend) {
        existing.unshift(listener);
      } else {
        existing.push(listener);
      }
    }

    // Check for listener leak
    if (!existing.warned) {
      m = $getMaxListeners(target);
      if (m && m > 0 && existing.length > m) {
        existing.warned = true;
        var w = new Error('Possible EventEmitter memory leak detected. ' +
            existing.length + ' "' + String(type) + '" listeners ' +
            'added. Use emitter.setMaxListeners() to ' +
            'increase limit.');
        w.name = 'MaxListenersExceededWarning';
        w.emitter = target;
        w.type = type;
        w.count = existing.length;
        if (typeof console === 'object' && console.warn) {
          console.warn('%s: %s', w.name, w.message);
        }
      }
    }
  }

  return target;
}

EventEmitter.prototype.addListener = function addListener(type, listener) {
  return _addListener(this, type, listener, false);
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.prependListener =
    function prependListener(type, listener) {
      return _addListener(this, type, listener, true);
    };

function onceWrapper() {
  if (!this.fired) {
    this.target.removeListener(this.type, this.wrapFn);
    this.fired = true;
    switch (arguments.length) {
      case 0:
        return this.listener.call(this.target);
      case 1:
        return this.listener.call(this.target, arguments[0]);
      case 2:
        return this.listener.call(this.target, arguments[0], arguments[1]);
      case 3:
        return this.listener.call(this.target, arguments[0], arguments[1],
            arguments[2]);
      default:
        var args = new Array(arguments.length);
        for (var i = 0; i < args.length; ++i)
          args[i] = arguments[i];
        this.listener.apply(this.target, args);
    }
  }
}

function _onceWrap(target, type, listener) {
  var state = { fired: false, wrapFn: undefined, target: target, type: type, listener: listener };
  var wrapped = bind.call(onceWrapper, state);
  wrapped.listener = listener;
  state.wrapFn = wrapped;
  return wrapped;
}

EventEmitter.prototype.once = function once(type, listener) {
  if (typeof listener !== 'function')
    throw new TypeError('"listener" argument must be a function');
  this.on(type, _onceWrap(this, type, listener));
  return this;
};

EventEmitter.prototype.prependOnceListener =
    function prependOnceListener(type, listener) {
      if (typeof listener !== 'function')
        throw new TypeError('"listener" argument must be a function');
      this.prependListener(type, _onceWrap(this, type, listener));
      return this;
    };

// Emits a 'removeListener' event if and only if the listener was removed.
EventEmitter.prototype.removeListener =
    function removeListener(type, listener) {
      var list, events, position, i, originalListener;

      if (typeof listener !== 'function')
        throw new TypeError('"listener" argument must be a function');

      events = this._events;
      if (!events)
        return this;

      list = events[type];
      if (!list)
        return this;

      if (list === listener || list.listener === listener) {
        if (--this._eventsCount === 0)
          this._events = objectCreate(null);
        else {
          delete events[type];
          if (events.removeListener)
            this.emit('removeListener', type, list.listener || listener);
        }
      } else if (typeof list !== 'function') {
        position = -1;

        for (i = list.length - 1; i >= 0; i--) {
          if (list[i] === listener || list[i].listener === listener) {
            originalListener = list[i].listener;
            position = i;
            break;
          }
        }

        if (position < 0)
          return this;

        if (position === 0)
          list.shift();
        else
          spliceOne(list, position);

        if (list.length === 1)
          events[type] = list[0];

        if (events.removeListener)
          this.emit('removeListener', type, originalListener || listener);
      }

      return this;
    };

EventEmitter.prototype.removeAllListeners =
    function removeAllListeners(type) {
      var listeners, events, i;

      events = this._events;
      if (!events)
        return this;

      // not listening for removeListener, no need to emit
      if (!events.removeListener) {
        if (arguments.length === 0) {
          this._events = objectCreate(null);
          this._eventsCount = 0;
        } else if (events[type]) {
          if (--this._eventsCount === 0)
            this._events = objectCreate(null);
          else
            delete events[type];
        }
        return this;
      }

      // emit removeListener for all listeners on all events
      if (arguments.length === 0) {
        var keys = objectKeys(events);
        var key;
        for (i = 0; i < keys.length; ++i) {
          key = keys[i];
          if (key === 'removeListener') continue;
          this.removeAllListeners(key);
        }
        this.removeAllListeners('removeListener');
        this._events = objectCreate(null);
        this._eventsCount = 0;
        return this;
      }

      listeners = events[type];

      if (typeof listeners === 'function') {
        this.removeListener(type, listeners);
      } else if (listeners) {
        // LIFO order
        for (i = listeners.length - 1; i >= 0; i--) {
          this.removeListener(type, listeners[i]);
        }
      }

      return this;
    };

function _listeners(target, type, unwrap) {
  var events = target._events;

  if (!events)
    return [];

  var evlistener = events[type];
  if (!evlistener)
    return [];

  if (typeof evlistener === 'function')
    return unwrap ? [evlistener.listener || evlistener] : [evlistener];

  return unwrap ? unwrapListeners(evlistener) : arrayClone(evlistener, evlistener.length);
}

EventEmitter.prototype.listeners = function listeners(type) {
  return _listeners(this, type, true);
};

EventEmitter.prototype.rawListeners = function rawListeners(type) {
  return _listeners(this, type, false);
};

EventEmitter.listenerCount = function(emitter, type) {
  if (typeof emitter.listenerCount === 'function') {
    return emitter.listenerCount(type);
  } else {
    return listenerCount.call(emitter, type);
  }
};

EventEmitter.prototype.listenerCount = listenerCount;
function listenerCount(type) {
  var events = this._events;

  if (events) {
    var evlistener = events[type];

    if (typeof evlistener === 'function') {
      return 1;
    } else if (evlistener) {
      return evlistener.length;
    }
  }

  return 0;
}

EventEmitter.prototype.eventNames = function eventNames() {
  return this._eventsCount > 0 ? Reflect.ownKeys(this._events) : [];
};

// About 1.5x faster than the two-arg version of Array#splice().
function spliceOne(list, index) {
  for (var i = index, k = i + 1, n = list.length; k < n; i += 1, k += 1)
    list[i] = list[k];
  list.pop();
}

function arrayClone(arr, n) {
  var copy = new Array(n);
  for (var i = 0; i < n; ++i)
    copy[i] = arr[i];
  return copy;
}

function unwrapListeners(arr) {
  var ret = new Array(arr.length);
  for (var i = 0; i < ret.length; ++i) {
    ret[i] = arr[i].listener || arr[i];
  }
  return ret;
}

function objectCreatePolyfill(proto) {
  var F = function() {};
  F.prototype = proto;
  return new F;
}
function objectKeysPolyfill(obj) {
  var keys = [];
  for (var k in obj) if (Object.prototype.hasOwnProperty.call(obj, k)) {
    keys.push(k);
  }
  return k;
}
function functionBindPolyfill(context) {
  var fn = this;
  return function () {
    return fn.apply(context, arguments);
  };
}

},{}],6:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],7:[function(require,module,exports){
// This file can be required in Browserify and Node.js for automatic polyfill
// To use it:  require('es6-promise/auto');
'use strict';
module.exports = require('./').polyfill();

},{"./":8}],8:[function(require,module,exports){
(function (process,global){
/*!
 * @overview es6-promise - a tiny implementation of Promises/A+.
 * @copyright Copyright (c) 2014 Yehuda Katz, Tom Dale, Stefan Penner and contributors (Conversion to ES6 API by Jake Archibald)
 * @license   Licensed under MIT license
 *            See https://raw.githubusercontent.com/stefanpenner/es6-promise/master/LICENSE
 * @version   v4.2.5+7f2b526d
 */

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.ES6Promise = factory());
}(this, (function () { 'use strict';

function objectOrFunction(x) {
  var type = typeof x;
  return x !== null && (type === 'object' || type === 'function');
}

function isFunction(x) {
  return typeof x === 'function';
}



var _isArray = void 0;
if (Array.isArray) {
  _isArray = Array.isArray;
} else {
  _isArray = function (x) {
    return Object.prototype.toString.call(x) === '[object Array]';
  };
}

var isArray = _isArray;

var len = 0;
var vertxNext = void 0;
var customSchedulerFn = void 0;

var asap = function asap(callback, arg) {
  queue[len] = callback;
  queue[len + 1] = arg;
  len += 2;
  if (len === 2) {
    // If len is 2, that means that we need to schedule an async flush.
    // If additional callbacks are queued before the queue is flushed, they
    // will be processed by this flush that we are scheduling.
    if (customSchedulerFn) {
      customSchedulerFn(flush);
    } else {
      scheduleFlush();
    }
  }
};

function setScheduler(scheduleFn) {
  customSchedulerFn = scheduleFn;
}

function setAsap(asapFn) {
  asap = asapFn;
}

var browserWindow = typeof window !== 'undefined' ? window : undefined;
var browserGlobal = browserWindow || {};
var BrowserMutationObserver = browserGlobal.MutationObserver || browserGlobal.WebKitMutationObserver;
var isNode = typeof self === 'undefined' && typeof process !== 'undefined' && {}.toString.call(process) === '[object process]';

// test for web worker but not in IE10
var isWorker = typeof Uint8ClampedArray !== 'undefined' && typeof importScripts !== 'undefined' && typeof MessageChannel !== 'undefined';

// node
function useNextTick() {
  // node version 0.10.x displays a deprecation warning when nextTick is used recursively
  // see https://github.com/cujojs/when/issues/410 for details
  return function () {
    return process.nextTick(flush);
  };
}

// vertx
function useVertxTimer() {
  if (typeof vertxNext !== 'undefined') {
    return function () {
      vertxNext(flush);
    };
  }

  return useSetTimeout();
}

function useMutationObserver() {
  var iterations = 0;
  var observer = new BrowserMutationObserver(flush);
  var node = document.createTextNode('');
  observer.observe(node, { characterData: true });

  return function () {
    node.data = iterations = ++iterations % 2;
  };
}

// web worker
function useMessageChannel() {
  var channel = new MessageChannel();
  channel.port1.onmessage = flush;
  return function () {
    return channel.port2.postMessage(0);
  };
}

function useSetTimeout() {
  // Store setTimeout reference so es6-promise will be unaffected by
  // other code modifying setTimeout (like sinon.useFakeTimers())
  var globalSetTimeout = setTimeout;
  return function () {
    return globalSetTimeout(flush, 1);
  };
}

var queue = new Array(1000);
function flush() {
  for (var i = 0; i < len; i += 2) {
    var callback = queue[i];
    var arg = queue[i + 1];

    callback(arg);

    queue[i] = undefined;
    queue[i + 1] = undefined;
  }

  len = 0;
}

function attemptVertx() {
  try {
    var vertx = Function('return this')().require('vertx');
    vertxNext = vertx.runOnLoop || vertx.runOnContext;
    return useVertxTimer();
  } catch (e) {
    return useSetTimeout();
  }
}

var scheduleFlush = void 0;
// Decide what async method to use to triggering processing of queued callbacks:
if (isNode) {
  scheduleFlush = useNextTick();
} else if (BrowserMutationObserver) {
  scheduleFlush = useMutationObserver();
} else if (isWorker) {
  scheduleFlush = useMessageChannel();
} else if (browserWindow === undefined && typeof require === 'function') {
  scheduleFlush = attemptVertx();
} else {
  scheduleFlush = useSetTimeout();
}

function then(onFulfillment, onRejection) {
  var parent = this;

  var child = new this.constructor(noop);

  if (child[PROMISE_ID] === undefined) {
    makePromise(child);
  }

  var _state = parent._state;


  if (_state) {
    var callback = arguments[_state - 1];
    asap(function () {
      return invokeCallback(_state, child, callback, parent._result);
    });
  } else {
    subscribe(parent, child, onFulfillment, onRejection);
  }

  return child;
}

/**
  `Promise.resolve` returns a promise that will become resolved with the
  passed `value`. It is shorthand for the following:

  ```javascript
  let promise = new Promise(function(resolve, reject){
    resolve(1);
  });

  promise.then(function(value){
    // value === 1
  });
  ```

  Instead of writing the above, your code now simply becomes the following:

  ```javascript
  let promise = Promise.resolve(1);

  promise.then(function(value){
    // value === 1
  });
  ```

  @method resolve
  @static
  @param {Any} value value that the returned promise will be resolved with
  Useful for tooling.
  @return {Promise} a promise that will become fulfilled with the given
  `value`
*/
function resolve$1(object) {
  /*jshint validthis:true */
  var Constructor = this;

  if (object && typeof object === 'object' && object.constructor === Constructor) {
    return object;
  }

  var promise = new Constructor(noop);
  resolve(promise, object);
  return promise;
}

var PROMISE_ID = Math.random().toString(36).substring(2);

function noop() {}

var PENDING = void 0;
var FULFILLED = 1;
var REJECTED = 2;

var TRY_CATCH_ERROR = { error: null };

function selfFulfillment() {
  return new TypeError("You cannot resolve a promise with itself");
}

function cannotReturnOwn() {
  return new TypeError('A promises callback cannot return that same promise.');
}

function getThen(promise) {
  try {
    return promise.then;
  } catch (error) {
    TRY_CATCH_ERROR.error = error;
    return TRY_CATCH_ERROR;
  }
}

function tryThen(then$$1, value, fulfillmentHandler, rejectionHandler) {
  try {
    then$$1.call(value, fulfillmentHandler, rejectionHandler);
  } catch (e) {
    return e;
  }
}

function handleForeignThenable(promise, thenable, then$$1) {
  asap(function (promise) {
    var sealed = false;
    var error = tryThen(then$$1, thenable, function (value) {
      if (sealed) {
        return;
      }
      sealed = true;
      if (thenable !== value) {
        resolve(promise, value);
      } else {
        fulfill(promise, value);
      }
    }, function (reason) {
      if (sealed) {
        return;
      }
      sealed = true;

      reject(promise, reason);
    }, 'Settle: ' + (promise._label || ' unknown promise'));

    if (!sealed && error) {
      sealed = true;
      reject(promise, error);
    }
  }, promise);
}

function handleOwnThenable(promise, thenable) {
  if (thenable._state === FULFILLED) {
    fulfill(promise, thenable._result);
  } else if (thenable._state === REJECTED) {
    reject(promise, thenable._result);
  } else {
    subscribe(thenable, undefined, function (value) {
      return resolve(promise, value);
    }, function (reason) {
      return reject(promise, reason);
    });
  }
}

function handleMaybeThenable(promise, maybeThenable, then$$1) {
  if (maybeThenable.constructor === promise.constructor && then$$1 === then && maybeThenable.constructor.resolve === resolve$1) {
    handleOwnThenable(promise, maybeThenable);
  } else {
    if (then$$1 === TRY_CATCH_ERROR) {
      reject(promise, TRY_CATCH_ERROR.error);
      TRY_CATCH_ERROR.error = null;
    } else if (then$$1 === undefined) {
      fulfill(promise, maybeThenable);
    } else if (isFunction(then$$1)) {
      handleForeignThenable(promise, maybeThenable, then$$1);
    } else {
      fulfill(promise, maybeThenable);
    }
  }
}

function resolve(promise, value) {
  if (promise === value) {
    reject(promise, selfFulfillment());
  } else if (objectOrFunction(value)) {
    handleMaybeThenable(promise, value, getThen(value));
  } else {
    fulfill(promise, value);
  }
}

function publishRejection(promise) {
  if (promise._onerror) {
    promise._onerror(promise._result);
  }

  publish(promise);
}

function fulfill(promise, value) {
  if (promise._state !== PENDING) {
    return;
  }

  promise._result = value;
  promise._state = FULFILLED;

  if (promise._subscribers.length !== 0) {
    asap(publish, promise);
  }
}

function reject(promise, reason) {
  if (promise._state !== PENDING) {
    return;
  }
  promise._state = REJECTED;
  promise._result = reason;

  asap(publishRejection, promise);
}

function subscribe(parent, child, onFulfillment, onRejection) {
  var _subscribers = parent._subscribers;
  var length = _subscribers.length;


  parent._onerror = null;

  _subscribers[length] = child;
  _subscribers[length + FULFILLED] = onFulfillment;
  _subscribers[length + REJECTED] = onRejection;

  if (length === 0 && parent._state) {
    asap(publish, parent);
  }
}

function publish(promise) {
  var subscribers = promise._subscribers;
  var settled = promise._state;

  if (subscribers.length === 0) {
    return;
  }

  var child = void 0,
      callback = void 0,
      detail = promise._result;

  for (var i = 0; i < subscribers.length; i += 3) {
    child = subscribers[i];
    callback = subscribers[i + settled];

    if (child) {
      invokeCallback(settled, child, callback, detail);
    } else {
      callback(detail);
    }
  }

  promise._subscribers.length = 0;
}

function tryCatch(callback, detail) {
  try {
    return callback(detail);
  } catch (e) {
    TRY_CATCH_ERROR.error = e;
    return TRY_CATCH_ERROR;
  }
}

function invokeCallback(settled, promise, callback, detail) {
  var hasCallback = isFunction(callback),
      value = void 0,
      error = void 0,
      succeeded = void 0,
      failed = void 0;

  if (hasCallback) {
    value = tryCatch(callback, detail);

    if (value === TRY_CATCH_ERROR) {
      failed = true;
      error = value.error;
      value.error = null;
    } else {
      succeeded = true;
    }

    if (promise === value) {
      reject(promise, cannotReturnOwn());
      return;
    }
  } else {
    value = detail;
    succeeded = true;
  }

  if (promise._state !== PENDING) {
    // noop
  } else if (hasCallback && succeeded) {
    resolve(promise, value);
  } else if (failed) {
    reject(promise, error);
  } else if (settled === FULFILLED) {
    fulfill(promise, value);
  } else if (settled === REJECTED) {
    reject(promise, value);
  }
}

function initializePromise(promise, resolver) {
  try {
    resolver(function resolvePromise(value) {
      resolve(promise, value);
    }, function rejectPromise(reason) {
      reject(promise, reason);
    });
  } catch (e) {
    reject(promise, e);
  }
}

var id = 0;
function nextId() {
  return id++;
}

function makePromise(promise) {
  promise[PROMISE_ID] = id++;
  promise._state = undefined;
  promise._result = undefined;
  promise._subscribers = [];
}

function validationError() {
  return new Error('Array Methods must be provided an Array');
}

var Enumerator = function () {
  function Enumerator(Constructor, input) {
    this._instanceConstructor = Constructor;
    this.promise = new Constructor(noop);

    if (!this.promise[PROMISE_ID]) {
      makePromise(this.promise);
    }

    if (isArray(input)) {
      this.length = input.length;
      this._remaining = input.length;

      this._result = new Array(this.length);

      if (this.length === 0) {
        fulfill(this.promise, this._result);
      } else {
        this.length = this.length || 0;
        this._enumerate(input);
        if (this._remaining === 0) {
          fulfill(this.promise, this._result);
        }
      }
    } else {
      reject(this.promise, validationError());
    }
  }

  Enumerator.prototype._enumerate = function _enumerate(input) {
    for (var i = 0; this._state === PENDING && i < input.length; i++) {
      this._eachEntry(input[i], i);
    }
  };

  Enumerator.prototype._eachEntry = function _eachEntry(entry, i) {
    var c = this._instanceConstructor;
    var resolve$$1 = c.resolve;


    if (resolve$$1 === resolve$1) {
      var _then = getThen(entry);

      if (_then === then && entry._state !== PENDING) {
        this._settledAt(entry._state, i, entry._result);
      } else if (typeof _then !== 'function') {
        this._remaining--;
        this._result[i] = entry;
      } else if (c === Promise$1) {
        var promise = new c(noop);
        handleMaybeThenable(promise, entry, _then);
        this._willSettleAt(promise, i);
      } else {
        this._willSettleAt(new c(function (resolve$$1) {
          return resolve$$1(entry);
        }), i);
      }
    } else {
      this._willSettleAt(resolve$$1(entry), i);
    }
  };

  Enumerator.prototype._settledAt = function _settledAt(state, i, value) {
    var promise = this.promise;


    if (promise._state === PENDING) {
      this._remaining--;

      if (state === REJECTED) {
        reject(promise, value);
      } else {
        this._result[i] = value;
      }
    }

    if (this._remaining === 0) {
      fulfill(promise, this._result);
    }
  };

  Enumerator.prototype._willSettleAt = function _willSettleAt(promise, i) {
    var enumerator = this;

    subscribe(promise, undefined, function (value) {
      return enumerator._settledAt(FULFILLED, i, value);
    }, function (reason) {
      return enumerator._settledAt(REJECTED, i, reason);
    });
  };

  return Enumerator;
}();

/**
  `Promise.all` accepts an array of promises, and returns a new promise which
  is fulfilled with an array of fulfillment values for the passed promises, or
  rejected with the reason of the first passed promise to be rejected. It casts all
  elements of the passed iterable to promises as it runs this algorithm.

  Example:

  ```javascript
  let promise1 = resolve(1);
  let promise2 = resolve(2);
  let promise3 = resolve(3);
  let promises = [ promise1, promise2, promise3 ];

  Promise.all(promises).then(function(array){
    // The array here would be [ 1, 2, 3 ];
  });
  ```

  If any of the `promises` given to `all` are rejected, the first promise
  that is rejected will be given as an argument to the returned promises's
  rejection handler. For example:

  Example:

  ```javascript
  let promise1 = resolve(1);
  let promise2 = reject(new Error("2"));
  let promise3 = reject(new Error("3"));
  let promises = [ promise1, promise2, promise3 ];

  Promise.all(promises).then(function(array){
    // Code here never runs because there are rejected promises!
  }, function(error) {
    // error.message === "2"
  });
  ```

  @method all
  @static
  @param {Array} entries array of promises
  @param {String} label optional string for labeling the promise.
  Useful for tooling.
  @return {Promise} promise that is fulfilled when all `promises` have been
  fulfilled, or rejected if any of them become rejected.
  @static
*/
function all(entries) {
  return new Enumerator(this, entries).promise;
}

/**
  `Promise.race` returns a new promise which is settled in the same way as the
  first passed promise to settle.

  Example:

  ```javascript
  let promise1 = new Promise(function(resolve, reject){
    setTimeout(function(){
      resolve('promise 1');
    }, 200);
  });

  let promise2 = new Promise(function(resolve, reject){
    setTimeout(function(){
      resolve('promise 2');
    }, 100);
  });

  Promise.race([promise1, promise2]).then(function(result){
    // result === 'promise 2' because it was resolved before promise1
    // was resolved.
  });
  ```

  `Promise.race` is deterministic in that only the state of the first
  settled promise matters. For example, even if other promises given to the
  `promises` array argument are resolved, but the first settled promise has
  become rejected before the other promises became fulfilled, the returned
  promise will become rejected:

  ```javascript
  let promise1 = new Promise(function(resolve, reject){
    setTimeout(function(){
      resolve('promise 1');
    }, 200);
  });

  let promise2 = new Promise(function(resolve, reject){
    setTimeout(function(){
      reject(new Error('promise 2'));
    }, 100);
  });

  Promise.race([promise1, promise2]).then(function(result){
    // Code here never runs
  }, function(reason){
    // reason.message === 'promise 2' because promise 2 became rejected before
    // promise 1 became fulfilled
  });
  ```

  An example real-world use case is implementing timeouts:

  ```javascript
  Promise.race([ajax('foo.json'), timeout(5000)])
  ```

  @method race
  @static
  @param {Array} promises array of promises to observe
  Useful for tooling.
  @return {Promise} a promise which settles in the same way as the first passed
  promise to settle.
*/
function race(entries) {
  /*jshint validthis:true */
  var Constructor = this;

  if (!isArray(entries)) {
    return new Constructor(function (_, reject) {
      return reject(new TypeError('You must pass an array to race.'));
    });
  } else {
    return new Constructor(function (resolve, reject) {
      var length = entries.length;
      for (var i = 0; i < length; i++) {
        Constructor.resolve(entries[i]).then(resolve, reject);
      }
    });
  }
}

/**
  `Promise.reject` returns a promise rejected with the passed `reason`.
  It is shorthand for the following:

  ```javascript
  let promise = new Promise(function(resolve, reject){
    reject(new Error('WHOOPS'));
  });

  promise.then(function(value){
    // Code here doesn't run because the promise is rejected!
  }, function(reason){
    // reason.message === 'WHOOPS'
  });
  ```

  Instead of writing the above, your code now simply becomes the following:

  ```javascript
  let promise = Promise.reject(new Error('WHOOPS'));

  promise.then(function(value){
    // Code here doesn't run because the promise is rejected!
  }, function(reason){
    // reason.message === 'WHOOPS'
  });
  ```

  @method reject
  @static
  @param {Any} reason value that the returned promise will be rejected with.
  Useful for tooling.
  @return {Promise} a promise rejected with the given `reason`.
*/
function reject$1(reason) {
  /*jshint validthis:true */
  var Constructor = this;
  var promise = new Constructor(noop);
  reject(promise, reason);
  return promise;
}

function needsResolver() {
  throw new TypeError('You must pass a resolver function as the first argument to the promise constructor');
}

function needsNew() {
  throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");
}

/**
  Promise objects represent the eventual result of an asynchronous operation. The
  primary way of interacting with a promise is through its `then` method, which
  registers callbacks to receive either a promise's eventual value or the reason
  why the promise cannot be fulfilled.

  Terminology
  -----------

  - `promise` is an object or function with a `then` method whose behavior conforms to this specification.
  - `thenable` is an object or function that defines a `then` method.
  - `value` is any legal JavaScript value (including undefined, a thenable, or a promise).
  - `exception` is a value that is thrown using the throw statement.
  - `reason` is a value that indicates why a promise was rejected.
  - `settled` the final resting state of a promise, fulfilled or rejected.

  A promise can be in one of three states: pending, fulfilled, or rejected.

  Promises that are fulfilled have a fulfillment value and are in the fulfilled
  state.  Promises that are rejected have a rejection reason and are in the
  rejected state.  A fulfillment value is never a thenable.

  Promises can also be said to *resolve* a value.  If this value is also a
  promise, then the original promise's settled state will match the value's
  settled state.  So a promise that *resolves* a promise that rejects will
  itself reject, and a promise that *resolves* a promise that fulfills will
  itself fulfill.


  Basic Usage:
  ------------

  ```js
  let promise = new Promise(function(resolve, reject) {
    // on success
    resolve(value);

    // on failure
    reject(reason);
  });

  promise.then(function(value) {
    // on fulfillment
  }, function(reason) {
    // on rejection
  });
  ```

  Advanced Usage:
  ---------------

  Promises shine when abstracting away asynchronous interactions such as
  `XMLHttpRequest`s.

  ```js
  function getJSON(url) {
    return new Promise(function(resolve, reject){
      let xhr = new XMLHttpRequest();

      xhr.open('GET', url);
      xhr.onreadystatechange = handler;
      xhr.responseType = 'json';
      xhr.setRequestHeader('Accept', 'application/json');
      xhr.send();

      function handler() {
        if (this.readyState === this.DONE) {
          if (this.status === 200) {
            resolve(this.response);
          } else {
            reject(new Error('getJSON: `' + url + '` failed with status: [' + this.status + ']'));
          }
        }
      };
    });
  }

  getJSON('/posts.json').then(function(json) {
    // on fulfillment
  }, function(reason) {
    // on rejection
  });
  ```

  Unlike callbacks, promises are great composable primitives.

  ```js
  Promise.all([
    getJSON('/posts'),
    getJSON('/comments')
  ]).then(function(values){
    values[0] // => postsJSON
    values[1] // => commentsJSON

    return values;
  });
  ```

  @class Promise
  @param {Function} resolver
  Useful for tooling.
  @constructor
*/

var Promise$1 = function () {
  function Promise(resolver) {
    this[PROMISE_ID] = nextId();
    this._result = this._state = undefined;
    this._subscribers = [];

    if (noop !== resolver) {
      typeof resolver !== 'function' && needsResolver();
      this instanceof Promise ? initializePromise(this, resolver) : needsNew();
    }
  }

  /**
  The primary way of interacting with a promise is through its `then` method,
  which registers callbacks to receive either a promise's eventual value or the
  reason why the promise cannot be fulfilled.
   ```js
  findUser().then(function(user){
    // user is available
  }, function(reason){
    // user is unavailable, and you are given the reason why
  });
  ```
   Chaining
  --------
   The return value of `then` is itself a promise.  This second, 'downstream'
  promise is resolved with the return value of the first promise's fulfillment
  or rejection handler, or rejected if the handler throws an exception.
   ```js
  findUser().then(function (user) {
    return user.name;
  }, function (reason) {
    return 'default name';
  }).then(function (userName) {
    // If `findUser` fulfilled, `userName` will be the user's name, otherwise it
    // will be `'default name'`
  });
   findUser().then(function (user) {
    throw new Error('Found user, but still unhappy');
  }, function (reason) {
    throw new Error('`findUser` rejected and we're unhappy');
  }).then(function (value) {
    // never reached
  }, function (reason) {
    // if `findUser` fulfilled, `reason` will be 'Found user, but still unhappy'.
    // If `findUser` rejected, `reason` will be '`findUser` rejected and we're unhappy'.
  });
  ```
  If the downstream promise does not specify a rejection handler, rejection reasons will be propagated further downstream.
   ```js
  findUser().then(function (user) {
    throw new PedagogicalException('Upstream error');
  }).then(function (value) {
    // never reached
  }).then(function (value) {
    // never reached
  }, function (reason) {
    // The `PedgagocialException` is propagated all the way down to here
  });
  ```
   Assimilation
  ------------
   Sometimes the value you want to propagate to a downstream promise can only be
  retrieved asynchronously. This can be achieved by returning a promise in the
  fulfillment or rejection handler. The downstream promise will then be pending
  until the returned promise is settled. This is called *assimilation*.
   ```js
  findUser().then(function (user) {
    return findCommentsByAuthor(user);
  }).then(function (comments) {
    // The user's comments are now available
  });
  ```
   If the assimliated promise rejects, then the downstream promise will also reject.
   ```js
  findUser().then(function (user) {
    return findCommentsByAuthor(user);
  }).then(function (comments) {
    // If `findCommentsByAuthor` fulfills, we'll have the value here
  }, function (reason) {
    // If `findCommentsByAuthor` rejects, we'll have the reason here
  });
  ```
   Simple Example
  --------------
   Synchronous Example
   ```javascript
  let result;
   try {
    result = findResult();
    // success
  } catch(reason) {
    // failure
  }
  ```
   Errback Example
   ```js
  findResult(function(result, err){
    if (err) {
      // failure
    } else {
      // success
    }
  });
  ```
   Promise Example;
   ```javascript
  findResult().then(function(result){
    // success
  }, function(reason){
    // failure
  });
  ```
   Advanced Example
  --------------
   Synchronous Example
   ```javascript
  let author, books;
   try {
    author = findAuthor();
    books  = findBooksByAuthor(author);
    // success
  } catch(reason) {
    // failure
  }
  ```
   Errback Example
   ```js
   function foundBooks(books) {
   }
   function failure(reason) {
   }
   findAuthor(function(author, err){
    if (err) {
      failure(err);
      // failure
    } else {
      try {
        findBoooksByAuthor(author, function(books, err) {
          if (err) {
            failure(err);
          } else {
            try {
              foundBooks(books);
            } catch(reason) {
              failure(reason);
            }
          }
        });
      } catch(error) {
        failure(err);
      }
      // success
    }
  });
  ```
   Promise Example;
   ```javascript
  findAuthor().
    then(findBooksByAuthor).
    then(function(books){
      // found books
  }).catch(function(reason){
    // something went wrong
  });
  ```
   @method then
  @param {Function} onFulfilled
  @param {Function} onRejected
  Useful for tooling.
  @return {Promise}
  */

  /**
  `catch` is simply sugar for `then(undefined, onRejection)` which makes it the same
  as the catch block of a try/catch statement.
  ```js
  function findAuthor(){
  throw new Error('couldn't find that author');
  }
  // synchronous
  try {
  findAuthor();
  } catch(reason) {
  // something went wrong
  }
  // async with promises
  findAuthor().catch(function(reason){
  // something went wrong
  });
  ```
  @method catch
  @param {Function} onRejection
  Useful for tooling.
  @return {Promise}
  */


  Promise.prototype.catch = function _catch(onRejection) {
    return this.then(null, onRejection);
  };

  /**
    `finally` will be invoked regardless of the promise's fate just as native
    try/catch/finally behaves
  
    Synchronous example:
  
    ```js
    findAuthor() {
      if (Math.random() > 0.5) {
        throw new Error();
      }
      return new Author();
    }
  
    try {
      return findAuthor(); // succeed or fail
    } catch(error) {
      return findOtherAuther();
    } finally {
      // always runs
      // doesn't affect the return value
    }
    ```
  
    Asynchronous example:
  
    ```js
    findAuthor().catch(function(reason){
      return findOtherAuther();
    }).finally(function(){
      // author was either found, or not
    });
    ```
  
    @method finally
    @param {Function} callback
    @return {Promise}
  */


  Promise.prototype.finally = function _finally(callback) {
    var promise = this;
    var constructor = promise.constructor;

    if (isFunction(callback)) {
      return promise.then(function (value) {
        return constructor.resolve(callback()).then(function () {
          return value;
        });
      }, function (reason) {
        return constructor.resolve(callback()).then(function () {
          throw reason;
        });
      });
    }

    return promise.then(callback, callback);
  };

  return Promise;
}();

Promise$1.prototype.then = then;
Promise$1.all = all;
Promise$1.race = race;
Promise$1.resolve = resolve$1;
Promise$1.reject = reject$1;
Promise$1._setScheduler = setScheduler;
Promise$1._setAsap = setAsap;
Promise$1._asap = asap;

/*global self*/
function polyfill() {
  var local = void 0;

  if (typeof global !== 'undefined') {
    local = global;
  } else if (typeof self !== 'undefined') {
    local = self;
  } else {
    try {
      local = Function('return this')();
    } catch (e) {
      throw new Error('polyfill failed because global object is unavailable in this environment');
    }
  }

  var P = local.Promise;

  if (P) {
    var promiseToString = null;
    try {
      promiseToString = Object.prototype.toString.call(P.resolve());
    } catch (e) {
      // silently ignored
    }

    if (promiseToString === '[object Promise]' && !P.cast) {
      return;
    }
  }

  local.Promise = Promise$1;
}

// Strange compat..
Promise$1.polyfill = polyfill;
Promise$1.Promise = Promise$1;

return Promise$1;

})));





}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"_process":6}],9:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],10:[function(require,module,exports){
'use strict';
var Observable = require('./observables/observable.js');

function stringifySelectVal (val) {
  return val === null ? ""
    : val+'';
}

function stringifyVal (val) {
  return val === null || val === undefined ? ''
    : val+'';
}

Observable._bindElement = function bindElement(elem, obs, triggers) {
  if (!Observable.is(obs)) return;
  if (obs.get() != null) elem.value = obs.get();
  triggers = triggers || 'change';
  if (!Array.isArray(triggers)) {
    triggers = [triggers];
  }

  // TODO: Next pass, use framework events
  triggers.forEach(function(trigger) {
    elem.addEventListener(trigger, updateObs);
  });

  obs.on('afterChange', elem.nodeName === "SELECT" ? updateSelect : updateElem);

  var oldVal = obs.get();
  function updateElem(val) {
    var elemVal = elem.value;
    var prevVal = oldVal;
    oldVal = val;
    if (elemVal === stringifyVal(val)) return;
    else if (elemVal === stringifyVal(prevVal)) elem.value = stringifyVal(val);
    else obs.set(elemVal);
  }

  function updateSelect(val) {
    var elemVal = elem.value;

    var options = {};
    // Handle case where old option was removed from DOM and select auto-updated.
    var allOptions = elem.querySelectorAll("option[value]");
    for (var i = 0; i < allOptions.length; ++i) {
      var optionElement = allOptions[i];
      if (!optionElement.disabled) {
        options[optionElement.value] = true;
      }
    }

    var prevVal = stringifySelectVal(oldVal) !== "" && !options[oldVal] ? elemVal : oldVal;

    oldVal = val;
    if (elemVal === stringifySelectVal(val)) {
      if (elemVal === "") { // No viable options left
        unselectSelect();
      }
      return;
    }
    else if (elemVal === stringifySelectVal(prevVal)) {
      if (stringifySelectVal(val) === "") {
        unselectSelect();
      } else {
        if (options[val]) {
          elem.value = val;
        } else {
          unselectSelect();
        }
      }
    }
    else obs.set(elemVal === "" ? null : elemVal);
  }
  function unselectSelect () {
    oldVal = null;
    var disabledOption = elem.querySelector("option[disabled]");
    if (disabledOption) {
      elem.selectedIndex = disabledOption.index;
    } else {
      elem.selectedIndex = 0;
    }
  }
  function updateObs() {
    obs.set(elem.value);
    Observable.scheduler.run();
  }
};

},{"./observables/observable.js":19}],11:[function(require,module,exports){
"use strict";

/* globals $$HELPERS */

var Observable = require('./observables/observable.js');
var inherits = require('inherits');
var DomeElement = require('./dome_element');

function DomeConditionalElement (scope_context, scope_symbol) {
  Object.defineProperty(this, 'value', {
    set: function (v) {
      if (v) {
        this._value = new DomeElement(v);
      } else {
        this._value = null;
      }
    },
    get: function () {
      return this._value;
    }
  });

  Observable.call(this, scope_context.state[scope_symbol]);

  this._scope_context = scope_context;
  this._scope_symbol = scope_symbol;
}

inherits(DomeConditionalElement, Observable);

DomeConditionalElement.prototype.send = function (message_type) {
  var scope_instance = this._scope_context.state[this._scope_symbol];

  if (!scope_instance) return;

  var args = [];
  for (var i = 1; i < arguments.length; ++i) {
    args.push(arguments[i]);
  }

  var message_symbol = scope_instance.state[''][message_type];
  scope_instance.state[message_symbol].apply(null, args);
};

DomeConditionalElement.prototype.toNodes = function () {
  var scope_instance = this._scope_context.state[this._scope_symbol];

  if (!scope_instance) {
    return [];
  }

  var begin_placement = scope_instance.state[scope_instance.state.begin_placement_symbol];
  var end_placement = scope_instance.state[scope_instance.state.end_placement_symbol];

  return Coral.sponges["Բ"](Coral.sponges["Ե"](begin_placement, end_placement));
};

module.exports = DomeConditionalElement;

},{"./dome_element":12,"./observables/observable.js":19,"inherits":9}],12:[function(require,module,exports){
"use strict";

/* globals $$HELPERS */

// NOTE: This is not an observable because normal scope instance elements don't ever change.  It would be useless to do all the wrapping to support them having change events.
// * TODO: Not true, for example with a dynamic element list it is possible to do a .get() on it while children of it are async initializing.

function DomeElement (scope_instance) {
  this._scope_instance = scope_instance;
}

DomeElement.prototype.send = function (message_type) {
  var scope_instance = this._scope_instance;

  var args = [];
  for (var i = 1; i < arguments.length; ++i) {
    args.push(arguments[i]);
  }

  var message_symbol = scope_instance.state[''][message_type];
  scope_instance.state[message_symbol].apply(null, args);
};

DomeElement.prototype.toNodes = function () {
  var scope_instance = this._scope_instance;

  var begin_placement = scope_instance.state[scope_instance.state.begin_placement_symbol];
  var end_placement = scope_instance.state[scope_instance.state.end_placement_symbol];

  return Coral.sponges["Բ"](Coral.sponges["Ե"](begin_placement, end_placement));
};

module.exports = DomeElement;

},{}],13:[function(require,module,exports){
"use strict";

/* globals $HELPERS */

var Observable = require('./observables/observable.js');
var inherits = require('inherits');
var Unresolved = require('./unresolved');

var DomeElement = require('./dome_element');

function DomeElementCollection (scope_context, scope_array_symbol) {
  Object.defineProperty(this, 'value', {
    set: function (scope_array) {
      var elements = [];
      for (var i = 0; i !== scope_array.length; ++i) {
        elements.push(new DomeElement(scope_array[i]));
      }

      this._value = elements;
    },
    get: function () {
      return this._value;
    }
  });

  var scope_instance = scope_context.state[scope_array_symbol];
  // TODO: ScopeInstance should not be Unresolved at this point, but it has
  //       happened. Look into the root cause, so we can omit this check. This
  //       check may also be necessary for DomeElement as well.
  if (scope_instance instanceof Unresolved) scope_instance = scope_instance.value;

  Observable.call(this, scope_instance);

  this._scope_context = scope_context;
  this._scope_array_symbol = scope_array_symbol;
}

inherits(DomeElementCollection, Observable);

DomeElementCollection.prototype.getElements = function () {
  return this.get();
};

module.exports = DomeElementCollection;

},{"./dome_element":12,"./observables/observable.js":19,"./unresolved":21,"inherits":9}],14:[function(require,module,exports){
"use strict";

/* globals $$HELPERS */

var inherits = require('inherits');
var EventEmitter = require('events').EventEmitter;
var Unresolved = require('./unresolved');

function DomeRichElement (element_name, scope_instance) {
  EventEmitter.call(this);

  this._scope_instance = scope_instance;
  this._element_name = element_name;

  this._scope_instance['']();

  var async_init_unresolved = this._scope_instance[''];

  this.on('newListener', function (name, handler) {
    if (name === 'async_initialized') {
      if (async_init_unresolved === true) {
        handler();
      } else {
        var u = new Unresolved(1, [], Coral.sponges["ՙ"], function () {
          handler();
        });
        async_init_unresolved.add_dependee(u);
      }
    }
  });
}

inherits(DomeRichElement, EventEmitter);

DomeRichElement.prototype.getElementName = function () {
  return this._element_name;
};

DomeRichElement.prototype.toNodes = function () {
  var scope_instance = this._scope_instance;

  var begin_placement = scope_instance.state[scope_instance.state.begin_placement_symbol];
  var end_placement = scope_instance.state[scope_instance.state.end_placement_symbol];

  return Coral.sponges["Բ"](Coral.sponges["Ե"](begin_placement, end_placement));
};

DomeRichElement.prototype.appendTo = function (element) {
  var text_node = document.createTextNode('');
  element.appendChild(text_node);

  this._scope_instance.state[this._scope_instance.state.begin_placement_symbol] = text_node;

  this._scope_instance['']();
};

DomeRichElement.prototype.destroy = function () {
  this._scope_instance['m']();
};

module.exports = DomeRichElement;

},{"./unresolved":21,"events":5,"inherits":9}],15:[function(require,module,exports){
'use strict';

function CoralEvent (event) {
  this.originalEvent = event;
  this.propagationStopped = false;
  this.immediatePropagationStopped = false;

  var copy_keys = ['type', 'altKey', 'bubbles', 'button', 'buttons', 'cancelable', 'char', 'charCode', 'clientX', 'clientY', 'ctrlKey', 'currentTarget', 'data', 'detail', 'eventPhase', 'key', 'keyCode', 'metaKey', 'offsetX', 'offsetY', 'originalTarget', 'pageX', 'pageY', 'relatedTarget', 'screenX', 'screenY', 'shiftKey', 'target', 'toElement', 'view', 'which'];
  for (var i = 0; i < copy_keys.length; ++i) {
    var key = copy_keys[i];
    this[key] = event[key];
  }
}

CoralEvent.prototype.isDefaultPrevented = function () {
  return this.originalEvent.defaultPrevented;
};

CoralEvent.prototype.preventDefault = function () {
  this.originalEvent.preventDefault();
};

CoralEvent.prototype.isPropagationStopped = function () {
  return this.propagationStopped;
};

CoralEvent.prototype.stopPropagation = function () {
  this.originalEvent.stopPropagation();
  this.propagationStopped = true;
};

CoralEvent.prototype.isImmediatePropagationStopped = function () {
  return this.immediatePropagationStopped;
};

CoralEvent.prototype.stopImmediatePropagation = function () {
  this.originalEvent.stopImmediatePropagation();
  this.immediatePropagationStopped = true;
};

module.exports = CoralEvent;

},{}],16:[function(require,module,exports){
(function (global){
"use strict";

/* global global */

// Polyfill in promise support if needed.
require('es6-promise/auto');

function Coral (coralElem, coralParametersAndValues, coralSettings) {
  this.settings = coralSettings || {};
  this.settings.root_container_node = coralElem;
  Coral.sponges.coral_start(coralElem, coralParametersAndValues, coralSettings, this);
}

global.Coral = Coral;

global.Coral.sponges = {};

global.Coral.Unresolved = require('./unresolved');
global.Coral.Zone = require('./zone');

global.Coral.CoralEvent = require('./event');
global.Coral.Observable = require('./observables/observable');
require('./bind_element');

global.Coral.DomeElement = require('./dome_element');
global.Coral.DomeConditionalElement = require('./dome_conditional_element');
global.Coral.DomeElementCollection = require('./dome_element_collection');
global.Coral.DomeRichElement = require('./dome_rich_element');

global.Coral.generate_dependency_tags = require('./generate_dependency_tags');

global.Coral.deepClone = require('../../../../lib/deep_clone');

global.Coral.get_at_path = require('../../../../lib/get_at_path');
global.Coral.identity_deduplicate_array = require('../../../../lib/identity_deduplicate_array');


var key_validation = require('../../../../lib/key_validation');
var key_shortcut_manager = require('./key_shortcut_manager')(key_validation);
global.Coral.helpers = {
  key_validation: key_validation,
  key_shortcut_manager: key_shortcut_manager
};

var scope_constructors = require('./scope_constructors');
global.Coral.Scope = scope_constructors.scope;
global.Coral.ScopeSymbolMetadata = scope_constructors.scope_symbol_metadata;
global.Coral.InstanceSymbolMetadata = scope_constructors.instance_symbol_metadata;
global.Coral.ForwardRule = scope_constructors.forward_rule;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../../../../lib/deep_clone":1,"../../../../lib/get_at_path":2,"../../../../lib/identity_deduplicate_array":3,"../../../../lib/key_validation":4,"./bind_element":10,"./dome_conditional_element":11,"./dome_element":12,"./dome_element_collection":13,"./dome_rich_element":14,"./event":15,"./generate_dependency_tags":17,"./key_shortcut_manager":18,"./observables/observable":19,"./scope_constructors":20,"./unresolved":21,"./zone":22,"es6-promise/auto":7}],17:[function(require,module,exports){
"use strict";

module.exports = function (deps, registry) {
  var tags = '';

  for (var name in deps) {
    var deps_loaded = [name];
    var dep = deps[name];
    if (registry[name]) {
      continue;
    }

    registry[name] = true;
    if (dep.implied_shards) {
      for (var i = 0; i < dep.implied_shards.length; ++i) {
        registry[dep.implied_shards[i]] = true;
      }
    }

    if (dep.type === "javascript") {
      tags += "<script src='"+name+"'></script>";
    } else {
      tags += "<link rel='stylesheet' type='text/css' href='"+name+"'></link>";
    }
  }

  return tags;
};

},{}],18:[function(require,module,exports){
"use strict";

var deepClone = require('../../../../lib/deep_clone');

module.exports = function (key_validation) {
  var key_map = {};
  var last_key_press;

  document.addEventListener('keydown', function (e) {
    var last_key_pressed = e.key;
    if (!last_key_pressed || last_key_pressed === 'Shift') return;
    key_map[last_key_pressed] = true;
    last_key_press = last_key_pressed;
  }, true);

  document.addEventListener('keyup', function (e) {
    var last_key_pressed = e.key;
    if (!last_key_pressed || last_key_pressed === 'Shift') return;
    if (last_key_pressed.length === 1) {
      delete key_map[last_key_pressed.toUpperCase()];
      delete key_map[last_key_pressed.toLowerCase()];
    } else {
      delete key_map[last_key_pressed];
    }
  }, true);

  // We clear key board shortcut state onfocus once so when a user switches between tabs and windows, no key presses are left in the key_map.
  window.addEventListener('focus', function () {
    clear_state();
    key_map = {};
  });

  var current_key_sequence = [];
  var key_sequences_array = [];
  var clear_state_timeout;
  var has_metakeys_not_shift = key_validation.has_metakeys_not_shift;

  function sequence_match (current_key_sequence, key_sequence_array) {
    var best_match_length = 0;
    for (var i = 0; i !== current_key_sequence.length; ++i) {
      var sub_array = current_key_sequence.slice(i, current_key_sequence.length);
      for (var j = 0; j !== sub_array.length; ++j) {
        if (!match_single(sub_array[j], key_sequence_array[j])) break;
      }
      if (j === sub_array.length && j > best_match_length) {
        best_match_length = j;
        if (key_sequence_array.length === j) break;
      }
      else if (best_match_length !== 0) break;
    }
    return best_match_length;
  }

  function match_single (current_key_combo, key_hash) {
    var key_hash_length = Object.keys(key_hash).length;
    var needs_perfect_match = has_metakeys_not_shift(key_hash) || has_metakeys_not_shift(current_key_combo.concurrently_pressed);
    var same_length = key_hash_length === Object.keys(current_key_combo.concurrently_pressed).length;

    if (!needs_perfect_match && key_hash_length === 1) return key_hash[current_key_combo.last_key_press];
    else {
      if (needs_perfect_match && !same_length) return false;
      for (var k in key_hash) {
        if (!current_key_combo.concurrently_pressed[k]) return false;
      }
      return true;
    }
  }

  function clear_state () {
    current_key_sequence = [];
    key_sequences_array = [];
    if (clear_state_timeout) {
      clearTimeout(clear_state_timeout);
      clear_state_timeout = null;
    }
  }

  return {
    // TODO Rather than pushing to an array, we could make a trie
    queue_key_sequence_check: function (key_sequence, callback) {
      key_sequences_array.push({
        key_sequence: key_sequence,
        callback: callback
      });
    },

    execute_matches: function () {
      if (key_sequences_array.length === 0) return;
      if (clear_state_timeout) {
        clearTimeout(clear_state_timeout);
        clear_state_timeout = null;
      }
      clear_state_timeout = setTimeout(function () { clear_state(); }, 750);

      var longest_match = 0;
      var best_complete_match = null;

      current_key_sequence.push({
        concurrently_pressed: deepClone(key_map),
        last_key_press: last_key_press
      });
      var current_sequence_length = current_key_sequence.length;

      for (var i = key_sequences_array.length - 1; i >= 0; --i) {
        var key_sequence_data = key_sequences_array[i];
        var key_sequence_array = key_sequence_data.key_sequence;
        var match_length = sequence_match(current_key_sequence, key_sequence_array);
        if (match_length === key_sequence_array.length) {
          if (!best_complete_match) {
            best_complete_match = key_sequence_data;
          } else {
            best_complete_match = (key_sequence_array.length >= best_complete_match.key_sequence.length) ? key_sequence_data : best_complete_match;
          }
        }
        if (match_length > longest_match) longest_match = match_length;
      }
      key_sequences_array = [];

      if (best_complete_match) {
        best_complete_match.callback();
        clear_state();
      } else {
        current_key_sequence = current_key_sequence.slice(current_sequence_length - longest_match, current_sequence_length);
      }
    },

    clear_state: clear_state
  };
};

},{"../../../../lib/deep_clone":1}],19:[function(require,module,exports){
"use strict";

/* global $$HELPERS,$$SYMBOLS */

var inherits = require('inherits');
var EventEmitter = require('events').EventEmitter;

inherits(Observable, EventEmitter);

var updated_zones = [];

/**
 * TODO: Get rid of this living on Observable to make it clear Observables are not tied to the scheduler.
 */
Observable.scheduler = {
  _frozen: false,
  run: function () {
    if (this._frozen) return;

    // TODO: There should not be multiple things calling into this function during a single run
    for (var i = 0; i < updated_zones.length; ++i) {
      var updated_zone = updated_zones[i];
      updated_zone.run_update_cycle();
    }
    updated_zones = [];
  },
  freeze: function () {
    this._frozen = true;
  },
  in_transaction: function (cb) {
    if (this._frozen) {
      cb();
      return;
    }
    this._frozen = true;
    cb();
    this._frozen = false;

    this.run();
  },
  // initialization_start_tick must be provided if the update registered is asynchronously computed.
  register_update: function (scope, symbol, value, is_compute_update, is_forced, initialization_start_tick, set_source_scope, set_source_symbol) {
    var zone = scope[''];
    if (updated_zones.indexOf(zone) === -1) {
      updated_zones.push(zone);
    }

    // TODO: I'm not convinced this is the correct way to do this
    zone.add_updates([{ scope: scope, symbol: symbol, value: value, is_compute_update: is_compute_update, forced: is_forced, initialization_start_tick: initialization_start_tick, set_source_scope: set_source_scope, set_source_symbol: set_source_symbol }]);
  }
};

Observable.inTransaction = function (transaction_callback) {
  Observable.scheduler.in_transaction(transaction_callback);
};

function Observable(initialValue) {
  this.setMaxListeners(0);
  this.pending = arguments.length === 0;
  this.value = initialValue;
}

Observable.is = function isObervable(entity) {
  return entity instanceof Observable;
};

Observable.unpack = function unpack(entity) {
  return Observable.is(entity) ? entity.get() : entity;
};

Observable.getByPath = function (val, path) {
  if (Observable.is(val)) {
    return val.byPath(path.split('.'));
  } else {
    return Coral.sponges["Պ"](val, path.split('.'));
  }
};

Observable.prototype.get = function () {
  return this.value;
};

Observable.prototype.toString = function () {
  return this.value != null && this.value.toString() || '';
};

Observable.prototype.byPath = function (path) {
  var parent = this;
  var child = parent.pending ? new Observable()
    : new Observable(Coral.sponges["Պ"](parent.get(), path));

  parent.on('change', change);

  var _force = false;
  function change() {
    child._set(Coral.sponges["Պ"](parent.get(), path), _force);
    _force = false;
  }

  child.on('_set', function () {
    child.before();
    child.update();
    child.after();
  });

  child._set = child.set;
  child.set = function (val, force) {
    if (this.value === val && !this.pending && !force) return;
    _force = true;
    parent.set(Coral.sponges["Ջ"](parent.get(), path, val), true);
  };
  return child;
};

Observable.prototype.set = function (val, force) {
  var oldVal = this.value;
  val = Observable.unpack(val);
  if (oldVal === val && !this.pending && !force) return;
  this.value = val;
  this.pending = false;

  this.emit('_set', val, force);
  this.emit('_afterSet', val, force);
};

Observable.prototype.before = function () {
  this.emit('beforeChange', this.value);
};

Observable.prototype.update = function () {
  this.emit('change', this.value);
};

Observable.prototype.after = function () {
  this.emit('afterChange', this.value);
};

Observable.prototype.destroy = function () {
  this.removeAllListeners();
};

Observable.bind = function bind(a, b) {
  if (!(Observable.is(a) && Observable.is(b))) return;
  a.on('beforeChange', updateB);
  b.on('beforeChange', updateA);
  updateB(a.get());
  function updateB(val) {
    b.set(val);
  }
  function updateA(val) {
    a.set(val);
  }
};

Observable.uniBind = function bind(a, b) {
  if (!(Observable.is(a) && Observable.is(b))) return;
  a.on('beforeChange', updateB);
  updateB(a.get());
  function updateB(val) {
    b.set(val);
  }
};

module.exports = Observable;


},{"events":5,"inherits":9}],20:[function(require,module,exports){
"use strict";

/* global $$HELPERS, Coral*/

var scope_number = 0;

function Scope (scope_context, async_pre_init_function, sync_init_function, coral_instance) {
  this.coral_instance = coral_instance;

  this[''] = {};
  this[''] = {};
  this[''] = async_pre_init_function;
  this[''] = sync_init_function;
  // TODO: NOTE: There is a spot in zone assuming this is an incrementing integer, may want to change the name to reflect that.
  this[''] = scope_number++;
  this[''] = false;
  this[''] = false;
  this[''] = null;
  this[''] = false;
  this[''] = '';

  // TODO: It would be nice if we could specify both of these immediately to their proper values.
  this[''] = false;
  this[''] = null;

  this.state = {};
  this.state[''] = scope_context;
}

Scope.prototype.generateEmitEventHandler = function () {
  var _this = this;
  var scope_context = this.state[''];
  var event = scope_context.coral_instance.settings.event;

  return function emitEventHandler (name, data, use_proto, override_origin_emit_event) {
    var current_scope = _this;
    if (use_proto) {
      current_scope = current_scope.state[''];
    }

    var catch_handler;
    var scope_data = [];
    while (current_scope) {
      var current_state = current_scope.state;
      var catch_handlers = current_state[''];

      // If the emitEvent hits a scope that has not finished initializing yet, queue it up to retry once it is done.  It will retry from the originating scope.  Note that when this is hit for the originating scope, it will be considered initialized.
      if (!current_scope['']) {
        if (!current_state._pending_emits) current_state._pending_emits = [];
        current_state._pending_emits.push(pending_emit_event);
        return;
      }

      var scope_data_symbol = current_state.__scope_data_symbol;
      if (scope_data_symbol) {
        var current_scope_data = current_state[scope_data_symbol];
        if (current_scope_data instanceof Coral.Unresolved) {
          current_scope_data = current_scope_data.value;
        }
        scope_data.push(current_scope_data);
      }
      if (catch_handlers && (catch_handlers[name] || catch_handlers['*'])) {
        catch_handler = current_state[(catch_handlers[name] || catch_handlers['*'])];
        break;
      }

      current_scope = current_state[''];
    }

    if (catch_handler) {
      var args = [data, scope_data, event, override_origin_emit_event || _this.generateEmitEventHandler(), name];
      catch_handler.apply(null, args);
    }

    function pending_emit_event () {
      emitEventHandler(name, data, use_proto, override_origin_emit_event);
    }
  };
};

// TODO: We should probably have subtypes of this for the various optional field configurations
function ScopeSymbolMetadata () {
  this.is_scope_parameter = false;
  this.is_scope_input_output = false;
  this.is_scope_output = false;

  // TODO: It's messy that we only use this for zone entry scope parameters
  this.is_invariant = false;
  this.is_recording_value_necessary = false;
  this.is_registered_for_update_cycle = false;

  this.post_update_handlers = null;

  this.update_handler = null;
  this.update_handler_input_symbols = null;
  this.raw_update_handler_input_data = null;
  this.always_recompute_symbols = '';

  this.set_handler = null;
}

ScopeSymbolMetadata.prototype = {
  /**
   * @param {function} func The post-update handler
   * @param {*} metadata This value will the third arg to the post-update handler
   */
  add_post_update_handler: function (func, metadata) {
    if (!this.post_update_handlers) this.post_update_handlers = [];

    // TODO: Only need to do this for element as arg
    for (var i = 0; i < this.post_update_handlers.length; i++) {
      var c = this.post_update_handlers[i];
      if (c.func === func && c.metadata === metadata) return;
    }
    this.post_update_handlers.push({ func: func, metadata: metadata });
  },
  get_update_trigger_input_symbols: function () {
    return this.limited_recompute_symbols || this.update_handler_input_symbols;
  },
  assign_raw_update_handler_input_data: function (raw_data) {
    this.raw_update_handler_input_data = raw_data;
  },
  assign_limited_recompute_symbols: function (limited_recompute_symbols) {
    this.limited_recompute_symbols = limited_recompute_symbols;
  },
  assign_update_handler: function (func, symbols) {
    this.update_handler = func;
    this.update_handler_input_symbols = symbols;
  },
  // Update triggering symbols that happen to trigger an update even if the input recomputed to the same value.
  // - The symbols here should be part of the result of get_update_trigger_input_symbols and not unique symbols.
  assign_always_recompute_symbols: function (symbols) {
    this.always_recompute_symbols = symbols;
  },
  get_always_recompute_input_symbols: function () {
    return this.always_recompute_symbols;
  }
};

function InstanceSymbolMetadata (scope) {
  this.forward_to = null;
  this.last_recorded_value = undefined;
  this.scratch = null;
  this.state = null;
  this.scope = scope;
  this.observable = null;
  this.set_handler = null;
  this.set_handler_metadata = null;
}

InstanceSymbolMetadata.prototype = {
  is_item_index_parameter: function () {
    return this.is_scope_parameter &&
      this.set_handler_metadata &&
      this.set_handler_metadata.forward_to_scope;
  },
  assign_set_handler: function (func, metadata) {
    this.set_handler = func;
    this.set_handler_metadata = metadata;
  },
  run_set_handler: function (scope, value) {
    if (this.set_handler) {
      this.set_handler(scope, value, this.set_handler_metadata);
    }
  },
  add_forward_rule: function (scope, symbol, phantom_dep, intercept) {
    if (!this.forward_to) this.forward_to = [];
    var new_rule = new ForwardRule(scope, symbol, phantom_dep, intercept);
    this.forward_to.push(new_rule);
  },
  remove_forward_to_scopes: function (removed_scopes) {
    if (!this.forward_to) return;
    this.forward_to = this.forward_to.filter(function (rule) {
      return removed_scopes.indexOf(rule.scope) === -1;
    });
  },
  set_state: function (status) {
    var zone = this.scope[''];
    var shifted_tick = zone.get_tick() << 3;
    this.state = shifted_tick | (status || 0);
  },
  get_status: function () {
    return this.state & 7;
  },
  get_tick: function () {
    return this.state >> 3;
  }
};

function ForwardRule (scope, symbol, phantom_dep, intercept) {
  this.scope = scope;
  this.symbol = symbol;
  this.phantom_dependency_symbol = phantom_dep || null;
  this.intercept = intercept || null;
}

module.exports = {
  scope: Scope,
  scope_symbol_metadata: ScopeSymbolMetadata,
  instance_symbol_metadata: InstanceSymbolMetadata,
  forward_rule: ForwardRule
};

},{}],21:[function(require,module,exports){
"use strict";

// TODO: I'm certain there is a better way to abstract this than to allow null callbacks.
/**
 * An abstraction for representing a value that has not yet been determined.
 *
 * @constructor
 * @param {number} unresolved_count The number of times dependency_resolved will be called on this Unresolved before compute_callback will be called.
 * @param {Array.<*>} dependencies An array of values that can include special Unresolved values.
 * @param {function} compute_callback All dependencies will be passed to the function in the order in which they were passed here, an additional callback argument will be added on to the end to call with the final value for the Unresolved.
 * @param {function} resolve_callback The function that will be called when the Unresolved has resolved.
 */
function Unresolved (unresolved_count, dependencies, compute_callback, resolve_callback) {
  this.unresolved_count = unresolved_count;
  this.dependencies = dependencies;
  this.dependees = [];
  this.compute_callback = compute_callback;
  this.resolve_callback = resolve_callback;
  this.value = undefined;
}

/**
 * Notify a dependee Unresolved that the dependency Unresolved has resolved.
 */
Unresolved.prototype.dependency_resolved = function dependency_resolved () {
  if (--this.unresolved_count === 0) {
    var _this = this;
    var dependencies = [function(result) {
      _this.value = result;
      if (_this.resolve_callback) {
        _this.resolve_callback.call(undefined, result);
      }
      for (var j = 0; j !== _this.dependees.length; ++j) {
        _this.dependees[j].dependency_resolved();
      }
    }];

    for (var i = 0; i !== this.dependencies.length; ++i) {
      var dependency = this.dependencies[i];
      if (dependency instanceof Unresolved) {
        dependencies.push(dependency.value);
      } else {
        dependencies.push(dependency);
      }
    }

    this.compute_callback.apply(undefined, dependencies);
  }
};

/**
 * Called by any user of the Unresolved who wants to be notified when the Unresolved has resolved.
 * @param {Unresolved} dependee
 */
Unresolved.prototype.add_dependee = function add_dependee (dependee) {
  this.dependees.push(dependee);
};

module.exports = Unresolved;

},{}],22:[function(require,module,exports){
'use strict';
/* globals $$HELPERS, $$SYMBOLS, Coral */

var has_reported_page_frozen_event = false;
var Unresolved = require('./unresolved');

// Zone phases
var INITIALIZING_PHASE = 0;
var READY_PHASE = 1;
var UPDATING_PHASE = 2;

// Scope computable states
var UNDETERMINED = 0;
var FULLY_RESOLVED_CHANGED_PROCESSING = 1;
var FULLY_RESOLVED_CHANGED_PROCESSED = 2;
var FULLY_RESOLVED_UNCHANGED = 3;
var READY_TO_RESOLVE = 4;
var WAITING_ON_DEPENDENCIES = 5;

/**
 * @constructor
 */
function Zone (scope) {
  this._phase = INITIALIZING_PHASE;
  this._entry_scope = scope;
  this._tick = 0;
  this._initialization_start_tick = this._tick;
  this._cycle_contains_breaking_change = false;
  this._pending_update_cycle_computables = [];
  this._current_update_cycle_computables = [];
  this._zones_forwarded_to = [];
  this._queued_post_update_handlers = [];
  this._queued_updated_observables = [];

  this._pending_update_cycle_scopes = [];
}

Zone.SYMBOL_UNDETERMINED = UNDETERMINED;
Zone.SYMBOL_FULLY_RESOLVED_CHANGED_PROCESSING = FULLY_RESOLVED_CHANGED_PROCESSING;
Zone.SYMBOL_FULLY_RESOLVED_CHANGED_PROCESSED = FULLY_RESOLVED_CHANGED_PROCESSED;
Zone.SYMBOL_FULLY_RESOLVED_UNCHANGED = FULLY_RESOLVED_UNCHANGED;
Zone.SYMBOL_READY_TO_RESOLVE = READY_TO_RESOLVE;
Zone.SYMBOL_WAITING_ON_DEPENDENCIES = WAITING_ON_DEPENDENCIES;

Zone.prototype.is_initializing = function () {
  return this._phase === INITIALIZING_PHASE;
};

Zone.prototype.is_ready = function () {
  return this._phase === READY_PHASE;
};

Zone.prototype.is_updating = function () {
  return this._phase === UPDATING_PHASE;
};

Zone.prototype.get_entry_point = function () {
  return this._entry_scope;
};

function merge_updates (updates) {
  var merged_updates = [];
  var scope_symbol_updates = {};

  for (var i = 0; i !== updates.length; ++i) {
    var update = updates[i];
    var symbol = update.symbol;
    var scope = update.scope;

    var scope_id = scope[''];
    var scope_symbol_identifier = scope_id+symbol;

    var seen_scope_symbol_updates = scope_symbol_updates[scope_symbol_identifier] || [];
    seen_scope_symbol_updates.push(update);
    scope_symbol_updates[scope_symbol_identifier] = seen_scope_symbol_updates;
  }

  for (var scope_symbol_update_key in scope_symbol_updates) {
    var all_scope_symbol_updates = scope_symbol_updates[scope_symbol_update_key];

    if (all_scope_symbol_updates.length === 1) {
      merged_updates.push(all_scope_symbol_updates[0]);
    } else {
      // TODO: Consider support for custom merge handlers at one point
      merged_updates.push(default_merge_updates_handler(all_scope_symbol_updates));
    }
  }

  return merged_updates;
}

Zone.prototype.enter_ready_state = function () {
  this._running_handlers = true;

  if (this._pending_update_cycle_computables.length) {
    this._current_update_cycle_computables = this._current_update_cycle_computables.concat(this._pending_update_cycle_computables);
    this._pending_update_cycle_computables = [];
  }

  for (var i = 0; i < this._queued_post_update_handlers.length; ++i) {
    var post_update_handler_data = this._queued_post_update_handlers[i];

    var scope = post_update_handler_data.scope;

    if (scope['n']()) {
      continue;
    }

    post_update_handler_data.handler.func(post_update_handler_data.value, scope, post_update_handler_data.handler.metadata);
  }

  var j;
  var updated_observable;
  for (j = 0; j < this._queued_updated_observables.length; ++j) {
    updated_observable = this._queued_updated_observables[j];
    updated_observable.before();
    updated_observable.update();
  }

  for (j = 0; j < this._queued_updated_observables.length; ++j) {
    updated_observable = this._queued_updated_observables[j];
    updated_observable.after();
  }

  if (i) {
    this._queued_post_update_handlers = [];
  }

  if (j) {
    this._queued_updated_observables = [];
  }

  this._phase = READY_PHASE;
  this._running_handlers = false;

  // Handles initialize methods adding updates synchronously or observable change methods adding updating synchronously.
  if (this._current_update_cycle_computables.length) {
    this.run_update_cycle();
  } else {
    if (this._cycle_contains_breaking_change) {
      this._cycle_contains_breaking_change = false;
      this.reinitialize();
    }
  }
};

Zone.prototype.reinitialize = function () {
  this._phase = INITIALIZING_PHASE;
  this._initialization_start_tick = this._tick;

  var entry_scope = this._entry_scope;
  entry_scope['m']();
  entry_scope[''] = false;

  if (entry_scope.state['']) {
    var io_symbols = entry_scope['ı']();
    entry_scope.state[''][''].initialize_scope_instance_parameters(entry_scope.state[''], io_symbols);
  }

  entry_scope['']();

  var is_root_scope = !entry_scope.state[''];
  if (is_root_scope) {
    return;
  }

  entry_scope['']();
};

/**
 * @param {Array.<Object>} updates
 * @return {Object} The last update in the updates array
 */
function default_merge_updates_handler (updates) {
  return updates[updates.length - 1];
}

Zone.prototype._mark_current_update_cycle_computable_symbol = function (update) {
  var scope = update.scope;
  var symbol = update.symbol;
  var instance_update_metadata = scope[''];
  var symbol_instance_update_metadata = instance_update_metadata[symbol];

  var initial_update_cycle_computable_tick = symbol_instance_update_metadata.get_tick();
  if (initial_update_cycle_computable_tick < this._update_cycle_start_tick) {
    symbol_instance_update_metadata.set_state(FULLY_RESOLVED_CHANGED_PROCESSING);
  }
};

/**
 * @param {Array.<{{ scope: Object, symbol: string, forwarded: boolean, same_value: boolean, value: * }}>} updates
 */
Zone.prototype.add_updates = function (updates) {
  for (var i = 0; i < updates.length; ++i) {
    var update = updates[i];

    if (update.initialization_start_tick === undefined) {
      update.initialization_start_tick = this._initialization_start_tick;
    }

    if (this._phase === INITIALIZING_PHASE) {
      this._pending_update_cycle_computables.push(update);
    } else {
      if (this._phase === UPDATING_PHASE) {
        this._mark_current_update_cycle_computable_symbol(update);
      }
      this._current_update_cycle_computables.push(update);
    }
  }
};

Zone.prototype._create_async_update_callback = function (scope, symbol) {
  var current_initialization_start_tick = this._initialization_start_tick;

  return function (value) {
    Coral.Observable.scheduler.register_update(scope,symbol,value,true,false,current_initialization_start_tick);
    Coral.Observable.scheduler.run();
  };
};

function create_symbol_assignment_callback (scope, symbol) {
  return function (value) {
    scope.state[symbol] = value;
  };
}

function create_forward_to_update (scope, symbol, value, old_value, forced, same_value, forward_to_rule, set_source_scope, set_source_symbol) {
  var forward_to_rule_scope = forward_to_rule.scope;
  var forward_to_rule_symbol = forward_to_rule.symbol;

  var forward_to_update = {
    scope: forward_to_rule_scope,
    symbol: forward_to_rule_symbol,
    forwarded: true,
    forward_source_scope: scope,
    forward_source_symbol: symbol,
    set_source_scope: set_source_scope,
    set_source_symbol: set_source_symbol
  };

  if (forward_to_rule.intercept) {
    var new_value = forward_to_rule.intercept(value, forward_to_rule_scope);
    forward_to_update.value = new_value;
  } else {
    // Only add the forwarder's same_value key if value has not been intercepted
    forward_to_update.value = value;
    forward_to_update.forced = forced;
    forward_to_update.same_value = same_value;
  }

  return forward_to_update;
}



function create_phantom_dependency_callback (scope, symbol, old_value, forced, same_value, forward_to_rule, set_source_scope, set_source_symbol) {
  return function () {
    var forward_to_update = create_forward_to_update(scope, symbol, scope.state[symbol], old_value, forced, same_value, forward_to_rule, set_source_scope, set_source_symbol);
    forward_to_update.phantom = true;
    var forward_to_zone = forward_to_update.scope[""];
    forward_to_zone.add_updates([forward_to_update]);
    forward_to_zone.run_update_cycle();
  };
}

// TODO: We seem to be passing maybe not the right symbols into this, like we shouldn't pass in the virtual symbols that point to non-virtual things, but pass in the non-virtual symbol that it points to.  Hmmm.
/**
 * @param {Object} scope
 * @param {string} symbols
 */
Zone.prototype.initialize_scope_instance_parameters = function (scope, symbols) {
  var special_symbols = ['', '', ''];
  var scope_update_metadata = scope[''];
  var instance_update_metadata = scope[''];

  for (var i = 0; i !== symbols.length; ++i) {
    var symbol = symbols[i];

    if (special_symbols.indexOf(symbol) !== -1) {
      continue;
    }

    var current_value = scope.state[symbol];
    if (current_value instanceof Unresolved) {
      continue;
    }

    var status = this._process_dependency_hierarchy(scope, symbol);
    var is_unresolved = status === WAITING_ON_DEPENDENCIES || status === READY_TO_RESOLVE;
    if (is_unresolved) {
      // TODO: We should have a special subtype of Unresolved that doesn't require generating the second function, it just already does that and takes in a scope.
      var unresolved = new Unresolved(1, [], Coral.sponges["ՙ"], create_symbol_assignment_callback(scope, symbol));

      unresolved.value = current_value;

      // This will be resolved by the update cycle code when it update that symbol after the resolution function has completed.
      var symbol_update_metadata = scope_update_metadata[symbol];
      var symbol_instance_update_metadata = instance_update_metadata[symbol];
      if (symbol_update_metadata.is_recording_value_necessary) {
        symbol_instance_update_metadata.last_recorded_value = unresolved;
      } else {
        scope.state[symbol] = unresolved;
      }
    }
  }
};

function is_unavailable_dependency_status (symbol_status) {
  return symbol_status !== FULLY_RESOLVED_UNCHANGED;
}

/**
 * Start at a symbol, checking all the dependencies of it.  Will update the symbol of the currently processed symbol once it has finished checking the dependencies.  If the state is undetermined then recursively call the process that symbol.
 *
 * This function assumes that scope symbol's state has already been checked to see if it is undetermined or not.  This function should only be called with undetermined symbols.
 *
 * Returns the determined state for the given symbol.
 *
 * @param {Object} scope
 * @param {string} symbol
 * @param {boolean} descending If descending to a scope output for a compound nested passthrough, used to prevent it from going back up to the parent scope
 * @param {Object} traverse_from_scope
 * @returns {number} The determined status for the symbol.
 */
Zone.prototype._process_dependency_hierarchy = function (scope, symbol, descending, traverse_from_scope) {
  var scope_update_metadata = scope[''];
  var instance_update_metadata = scope[''];

  var determined_status = UNDETERMINED;
  var has_pending_dependency = false;
  var symbol_update_metadata = scope_update_metadata[symbol];
  var symbol_instance_update_metadata = instance_update_metadata[symbol];

  if (!symbol_update_metadata || !symbol_instance_update_metadata) {
    return FULLY_RESOLVED_UNCHANGED;
  }

  var symbol_status = symbol_instance_update_metadata.get_status();
  var symbol_tick = symbol_instance_update_metadata.get_tick();
  var is_undetermined_state = symbol_status === UNDETERMINED || this._update_cycle_start_tick > symbol_tick;


  if (!is_undetermined_state) {
    return symbol_status;
  }

  var i;
  var j;

  var parent_scope = scope.state[''];
  var forward_to_rules = symbol_instance_update_metadata.forward_to || [];

  var forward_to_metadata;
  var forward_to_scope;
  var forward_to_symbol;
  var forward_to_scope_update_metadata;
  var forward_to_symbol_update_metadata;
  var forward_to_symbol_status;
  var is_different_zone;


  // In some cases, like with an 'item_index' parameter, it may not have forward to rules and instead use set handler metadata.
  if (symbol_instance_update_metadata.is_item_index_parameter()) {
    forward_to_scope = symbol_instance_update_metadata.set_handler_metadata.forward_to_scope;
    forward_to_symbol = symbol_instance_update_metadata.set_handler_metadata.forward_to_array_symbol;
    forward_to_rules = forward_to_rules.concat(new Coral.ForwardRule(forward_to_scope, forward_to_symbol));
  }

  var may_be_compound_nested_passthrough_symbol = symbol_update_metadata.is_scope_input_output && !symbol_update_metadata.update_handler_input_symbols;
  if (may_be_compound_nested_passthrough_symbol) {
    for (i = 0; i !== forward_to_rules.length; ++i) {
      forward_to_metadata = forward_to_rules[i];
      forward_to_scope = forward_to_metadata.scope;

      // If the forward to scope is an element, we don't want to try to trace through that output, it is definitely a placement.
      var forward_to_scope_is_element = forward_to_scope.state.begin_placement_symbol;

      if (forward_to_scope === parent_scope || (traverse_from_scope && forward_to_scope === traverse_from_scope) || forward_to_scope_is_element) {
        continue;
      }

      forward_to_symbol = forward_to_metadata.symbol;
      forward_to_scope_update_metadata = forward_to_scope[''];
      forward_to_symbol_update_metadata = forward_to_scope_update_metadata[forward_to_symbol];

      // We have to treat compound nested passthroughs special since they represent a point in the graph where in order to traverse up the hierarchy, we must navigate down into the scope through its output and up through its inputs.
      var is_compound_nested_passthrough_forward_rule = forward_to_symbol_update_metadata && forward_to_symbol_update_metadata.is_scope_output;
      if (!is_compound_nested_passthrough_forward_rule) {
        continue;
      }

      forward_to_symbol_status = forward_to_scope['']._process_dependency_hierarchy(forward_to_scope, forward_to_symbol, true, scope);
      has_pending_dependency = is_unavailable_dependency_status(forward_to_symbol_status);
      break;
    }
  }

  if (!has_pending_dependency && symbol_update_metadata.is_scope_parameter && !descending) {
    // NOTE: This makes the assumption that scope parameters have no listed "update_handler_input_symbols" and must look up their dependency via the forwarding rule wired up on it and assumes that there will only be one forwarding rule wired up on this.
    // * NOTE: In most cases we never need an upward forwarding rule since the thing passed in is not mutable, but for right now we don't factor that in.  When real world performance numbers start appearing, then we might look at increasing the size of the generated code to reduce the update wiring we do.

    for (i = 0; i !== forward_to_rules.length; ++i) {
      forward_to_metadata = forward_to_rules[i];
      forward_to_scope = forward_to_metadata.scope;
      if (forward_to_scope !== parent_scope) {
        continue;
      }

      forward_to_symbol = forward_to_metadata.symbol;

      var forward_to_zone = forward_to_scope[''];
      is_different_zone = forward_to_zone !== this;

      // If the zone is not currently updating, any input passed in from it from it is safe to use.
      if (is_different_zone && (forward_to_zone._phase === READY_PHASE || forward_to_zone._running_handlers)) {
        continue;
      }

      forward_to_symbol_status = forward_to_zone._process_dependency_hierarchy(forward_to_scope, forward_to_symbol, false, scope);

      // Status of '2' may not indicate pending if no current updates are sourced from the forward scope/symbol
      if (is_different_zone && forward_to_symbol_status === FULLY_RESOLVED_CHANGED_PROCESSED) {
        for (j = 0; j < this._current_update_cycle_computables.length; j++) {
          var update = this._current_update_cycle_computables[j];
          if (update.forward_source_scope === forward_to_scope && update.forward_source_symbol === forward_to_symbol) {
            has_pending_dependency = true;
            break;
          }
        }
      } else if (is_unavailable_dependency_status(forward_to_symbol_status)) {
        has_pending_dependency = true;
      }
    }
  } else if (!has_pending_dependency) {
    var dependency_symbols = symbol_update_metadata.update_handler_input_symbols || '';
    var update_trigger_dependency_symbols = symbol_update_metadata.get_update_trigger_input_symbols() || '';
    for (i = 0; i !== dependency_symbols.length; ++i) {
      var dependency_symbol = dependency_symbols[i];
      var dependency_status = this._process_dependency_hierarchy(scope, dependency_symbol);
      if (is_unavailable_dependency_status(dependency_status) && update_trigger_dependency_symbols.indexOf(dependency_symbol) !== -1) {
        has_pending_dependency = true;
      }
    }
  }

  determined_status = has_pending_dependency ? WAITING_ON_DEPENDENCIES : FULLY_RESOLVED_UNCHANGED;
  symbol_instance_update_metadata.set_state(determined_status);

  return determined_status;
};

Zone.prototype.get_tick = function () {
  return this._tick;
};

/**
 * Runs an update cycle for the zone.
 */
Zone.prototype.run_update_cycle = function () {
  if (this._running_handlers || this._currently_updating || this._phase === INITIALIZING_PHASE) {
    return;
  }

  this._phase = UPDATING_PHASE;
  this._currently_updating = true;

  var current_tick = ++this._tick;

  var is_new_update_cycle = !this._pending_update_cycle_scopes.length;
  if (is_new_update_cycle) {
    this._update_cycle_start_tick = current_tick;
  }

  this._current_update_cycle_computables = merge_updates(this._current_update_cycle_computables);
  var current_update_cycle_computables = this._current_update_cycle_computables;

  var current_update;

  var i, j, k;
  var scope;
  var symbol;
  var scope_update_metadata;
  var instance_update_metadata;
  var symbol_update_metadata;
  var symbol_instance_update_metadata;

  // Mark observables that are kicking off the cycle as processing, so any dependees correctly see any of the incoming computables as pending and wait on them.
  for (i = 0; i !== current_update_cycle_computables.length; ++i) {
    this._mark_current_update_cycle_computable_symbol(current_update_cycle_computables[i]);
  }

  /* jshint -W084 */
  while (current_update = current_update_cycle_computables.shift()) {
    scope = current_update.scope;
    symbol = current_update.symbol;

    var initialization_start_tick = current_update.initialization_start_tick;
    // Drop updates from previous initialization runs.
    if (this._initialization_start_tick > initialization_start_tick) {
      continue;
    }

    // Updates may be added as a courtesy to make sure that the symbol knows no change occurred for it, and anything waiting on it to resolve can do so.
    var has_value = current_update.hasOwnProperty('value');
    var value = has_value ? current_update.value : scope.state[symbol];
    var forced = current_update.forced;
    var is_compute_update = current_update.is_compute_update;
    var forwarded = current_update.forwarded;
    var forward_source_scope = current_update.forward_source_scope;
    var forward_source_symbol = current_update.forward_source_symbol;

    var set_source_scope = current_update.set_source_scope;
    var set_source_symbol = current_update.set_source_symbol;

    scope_update_metadata = scope[''];
    instance_update_metadata = scope[''];

    symbol_update_metadata = scope_update_metadata[symbol];
    symbol_instance_update_metadata = instance_update_metadata[symbol];

    if (!symbol_update_metadata || !symbol_instance_update_metadata || !symbol_update_metadata.is_registered_for_update_cycle) {
      // console.warn("Skipping update for symbol not registered for update cycle", scope, symbol, symbol_update_metadata);
      continue;
    }

    var symbol_status = symbol_instance_update_metadata.get_status();
    var symbol_tick = symbol_instance_update_metadata.get_tick();

    if (scope['n']()) {
      continue;
    }

    var already_updated_since_update_cycle_start_tick = symbol_tick >= this._update_cycle_start_tick;

    // This can happen in situations like multiple sets to an Observable in the same function call or with how some update handlers will push updates for symbols that could possibly have changed already or something may have visited already and declared unchanged.
    // * This should really not happen otherwise, keep an eye on this.
    if (already_updated_since_update_cycle_start_tick && (symbol_status === FULLY_RESOLVED_UNCHANGED || symbol_status === FULLY_RESOLVED_CHANGED_PROCESSED)) {
      this._pending_update_cycle_computables.push(current_update);
      continue;
    }

    // If a symbol has a set update and yet has also been recomputed, don't apply the set update when it is waiting on the recompute update to be processed (READY_TO_RESOLVE), hold on to the set update for the next update cycle.
    var is_set_update_and_symbol_has_recomputed = already_updated_since_update_cycle_start_tick && !is_compute_update && symbol_status === READY_TO_RESOLVE;
    if (is_set_update_and_symbol_has_recomputed) {
      this._pending_update_cycle_computables.push(current_update);
      continue;
    }

    var current_value;

    // TODO: Maybe we should just have some sort of hook system here, so things that need special handling don't have to add their logic directly in here.
    // With certain proxied symbols we need to record updates as they come in here, in particular we need to do this for cases where the value proxied is not the same as the source such as with item, item nested and indexed other array items.
    if (symbol_update_metadata.is_recording_value_necessary) {
      current_value = symbol_instance_update_metadata.last_recorded_value;
      symbol_instance_update_metadata.last_recorded_value = value;
    } else {
      current_value = scope.state[symbol];
    }

    if (!scope['']) {
      scope.state._init_pending_updates = scope.state._init_pending_updates || [];
      scope.state._init_pending_updates.push(current_update);
      continue;
    }

    // TODO: Optimize placement of this further, this is a simple good enough approach for now
    if (this._pending_update_cycle_scopes.indexOf(scope) === -1) {
      this._pending_update_cycle_scopes.push(scope);
    }

    var currently_unresolved = current_value instanceof Unresolved;

    if (currently_unresolved) {
      var unresolved = current_value;
      current_value = current_value.value;

      // Unresolveds will be used for computables used as scope parameters if they are found to have pending changes up the hierarchy when we create a new scope, we need to create an Unresolved since that is how we communicate with the async pre-init code that the value is not ready yet.
      unresolved.dependencies.push(value);
      unresolved.dependency_resolved();
    }

    var same_value = current_update.hasOwnProperty('same_value') ? current_update.same_value : current_value === value;

    var changed = !same_value || forced;

    symbol_instance_update_metadata.set_state(changed ? FULLY_RESOLVED_CHANGED_PROCESSED : FULLY_RESOLVED_UNCHANGED);

    // NOTE: It won't forward down an update unless it is a different value or the update was forced, which is why we don't check that here.
    if (changed && scope === this._entry_scope && symbol_update_metadata.is_scope_parameter && symbol_update_metadata.is_invariant) {
      if (!this._cycle_contains_breaking_change) {
        var begin_placement = this._entry_scope.state[this._entry_scope.state.begin_placement_symbol];
        var end_placement = this._entry_scope.state[this._entry_scope.state.end_placement_symbol];
        // console.trace("CLEARING ZONE", this._entry_scope, current_update, symbol_update_metadata);
        if (begin_placement !== end_placement && begin_placement && end_placement) {
          Coral.sponges["Լ"](begin_placement, end_placement, true);
        }

        this._entry_scope.state[this._entry_scope.state.end_placement_symbol] = begin_placement;
      }

      scope.state[symbol] = value;

      this._pending_update_cycle_scopes = [];
      this._cycle_contains_breaking_change = true;
    }

    if (this._cycle_contains_breaking_change) {
      continue;
    }

    if (changed) {
      if (!same_value) {
        scope.state[symbol] = value;
      }

      var symbol_observable = symbol_instance_update_metadata.observable;
      if (symbol_observable && changed) {
        // TODO: Ideally we'd only want to do this if the observable has any listeners for its change handlers.
        this._queued_updated_observables.push(symbol_observable);
        symbol_observable.value = value;
      }

      if (symbol_update_metadata.post_update_handlers) {
        for (i = 0; i !== symbol_update_metadata.post_update_handlers.length; ++i) {
          this._queued_post_update_handlers.push({ scope: scope, value: value, handler: symbol_update_metadata.post_update_handlers[i] });
        }
      }

      if (!forwarded && !is_compute_update || (forwarded && forward_source_scope.state[''] === scope)) {
        symbol_instance_update_metadata.run_set_handler(scope, value);
      }
    }

    // TODO: Find a clean way to remove indirection and more tightly link to non-dynamic scope instance types (such as normal elements and models), forward to rules are basically meant for cases where the scope may not always exist.
    var forward_rules = symbol_instance_update_metadata.forward_to;

    if (forward_rules) {
      for (i = 0; i !== forward_rules.length; ++i) {
        var forward_to_rule = forward_rules[i];
        var forward_to_rule_scope = forward_to_rule.scope;
        var forward_to_rule_symbol = forward_to_rule.symbol;
        var forward_to_rule_zone = forward_to_rule_scope[''];

        var is_different_origin = forward_to_rule_scope !== forward_source_scope || forward_to_rule_symbol !== forward_source_symbol;

        if (forwarded && !is_different_origin) {
          continue;
        }

        var is_async_and_sync_initialized = forward_to_rule_scope[''];

        var should_forward_update = false;
        if (is_async_and_sync_initialized) {
          should_forward_update = true;
        } else if (changed) {
          var is_sync_border_param = Coral.sponges["Խ"]([67,99], forward_to_rule_symbol.charCodeAt(0));
          var async_init_finished = forward_to_rule_scope[''] === true;

          // This handling is only necessary because Observable sets get pushed into the current update cycle, if they were always pending then we could assume that any time we create a scope, all updates to proxying symbols should not forward, since they would all be Unresolved parameters waiting for an initial value, since they would look up the hierarchy and see a pending change.
          should_forward_update = !is_sync_border_param && (
             async_init_finished ||
             (!currently_unresolved && !(forward_to_rule_scope.state[forward_to_rule_symbol] instanceof Unresolved))
           );
        }

        if (should_forward_update) {
          var forward_to_value = value;
          var held_by_phantom_dep = false;

          if (forward_to_rule.phantom_dependency_symbol) {
            var phantom_dependency_state = this._process_dependency_hierarchy(scope, forward_to_rule.phantom_dependency_symbol);

            if (phantom_dependency_state === WAITING_ON_DEPENDENCIES) {
              held_by_phantom_dep = true;

              var phantom_dependency_value = scope.state[forward_to_rule.phantom_dependency_symbol];
              var phantom_dependency_unresolved = scope['Ĵ'](forward_to_rule.phantom_dependency_symbol);

              phantom_dependency_unresolved.compute_callback = Coral.sponges["ՙ"];

              var already_has_unresolved = phantom_dependency_value instanceof Unresolved;
              if (!already_has_unresolved) {
                phantom_dependency_unresolved.value = phantom_dependency_value;
              }

              // TODO: More cleanly hook up with zone forwarding to's update cycle.
              var dependee_unresolved = new Unresolved(1, [], create_phantom_dependency_callback(scope, symbol, current_value, forced, same_value, forward_to_rule, set_source_scope, set_source_symbol));
              phantom_dependency_unresolved.add_dependee(dependee_unresolved);
            }
          }

          if (!held_by_phantom_dep) {
            // TODO: This should probably go through Observable.scheduler.register_update
            var forward_to_update = create_forward_to_update(scope, symbol, value, current_value, forced, same_value, forward_to_rule, set_source_scope, set_source_symbol);
            forward_to_rule_zone.add_updates([forward_to_update]);
          }

          if (forward_to_rule_zone !== this && this._zones_forwarded_to.indexOf(forward_to_rule_zone) === -1) {
            this._zones_forwarded_to.push(forward_to_rule_zone);
          }
        }
      }
    }

    var update_cycle_symbols = scope[''];

    var found_index = update_cycle_symbols.indexOf(symbol);
    var start_index;
    if (found_index === -1) {
      start_index = 0;
    } else {
      start_index = found_index + 1;
    }

    for (i = start_index; i < update_cycle_symbols.length; ++i) {
      var update_cycle_symbol = update_cycle_symbols[i];
      var update_cycle_symbol_update_metadata = scope_update_metadata[update_cycle_symbol];

      if (set_source_scope && set_source_symbol && set_source_scope === scope && set_source_symbol === update_cycle_symbol) {
        continue;
      }

      var update_trigger_input_symbols = update_cycle_symbol_update_metadata.get_update_trigger_input_symbols();
      if (!update_trigger_input_symbols) {
        continue;
      }

      if (changed) {
        var update_cycle_symbol_input_index = update_trigger_input_symbols.indexOf(symbol);
        if (update_cycle_symbol_input_index === -1) {
          continue;
        }
      } else {
        var always_recompute_input_symbols = update_cycle_symbol_update_metadata.get_always_recompute_input_symbols();
        if (always_recompute_input_symbols.indexOf(symbol) === -1) {
          continue;
        }
      }

      this._perform_scope_symbol_update_process(scope, update_cycle_symbol);
    }
  }

  var has_ready_to_resolve_pending_symbols = false;
  if (this._pending_update_cycle_scopes.length) {
    // Perform an ascending order sort so that we don't have to look up from scope parameters to parent scopes to determine if the symbol forwarding to the scope parameter is pending.  We get to simplify the logic this way.
    this._pending_update_cycle_scopes.sort(function ascending_order_sort (scope_a, scope_b) {
      return scope_a[''] - scope_b[''];
    });

    var updated_pending_update_cycle_scopes = [];

    for (i = 0; i < this._pending_update_cycle_scopes.length; ++i) {
      var pending_update_cycle_scope = this._pending_update_cycle_scopes[i];

      if (pending_update_cycle_scope['n']()) {
        continue;
      }

      var pending_scope_update_metadata = pending_update_cycle_scope[''];
      var pending_instance_update_metadata = pending_update_cycle_scope[''];
      var pending_scope_update_cycle_symbols = pending_update_cycle_scope[''];
      var contains_pending_symbol = false;

      for (j = 0; j < pending_scope_update_cycle_symbols.length; ++j) {
        var pending_scope_symbol = pending_scope_update_cycle_symbols[j];
        var pending_symbol_instance_update_metadata = pending_instance_update_metadata[pending_scope_symbol];
        var pending_scope_symbol_status = pending_symbol_instance_update_metadata.get_status();
        var pending_scope_symbol_tick = pending_symbol_instance_update_metadata.get_tick();
        var is_undetermined_state = pending_scope_symbol_status === UNDETERMINED || this._update_cycle_start_tick > pending_scope_symbol_tick;
        if (is_undetermined_state) continue;

        if (pending_scope_symbol_status === READY_TO_RESOLVE) {
          has_ready_to_resolve_pending_symbols = true;
          contains_pending_symbol = true;
          continue;
        }

        if (pending_scope_symbol_status !== WAITING_ON_DEPENDENCIES) {
          continue;
        }

        contains_pending_symbol = true;
        this._perform_scope_symbol_update_process(pending_update_cycle_scope, pending_scope_symbol);
      }

      if (contains_pending_symbol) {
        updated_pending_update_cycle_scopes.push(pending_update_cycle_scope);
      }
    }

    this._pending_update_cycle_scopes = updated_pending_update_cycle_scopes;
  }

  var is_fully_updated = !this._pending_update_cycle_scopes.length;

  var _zones_forwarded_to = this._zones_forwarded_to.slice();
  this._zones_forwarded_to = [];
  _zones_forwarded_to.forEach(function (zone) {
    zone.run_update_cycle();
  });

  this._currently_updating = false;

  if (is_fully_updated) {
    this._pending_update_cycle_scopes = [];
    this.enter_ready_state();
  } else if (current_update_cycle_computables.length) {
    this.run_update_cycle();
  } else if (!has_ready_to_resolve_pending_symbols && !has_reported_page_frozen_event) {
    // If the parent zone is updating, it's possible the 5s are just this zone's scopes waiting on updates from the parent zone.
    var parent_zone_is_updating = this._entry_scope.state[''] && this._entry_scope.state[''][''].is_updating();
    if (!parent_zone_is_updating) {
      has_reported_page_frozen_event = true;
      var event_category = 'FrameworkUpdateCyclePageFreeze';
      var event_action = document.readyState !== "complete" ? 'DuringPageLoad' : 'AfterPageLoad';
      var event_label = null;
      var scope_context = this._entry_scope;
      var coral_instance = scope_context.coral_instance;
      Coral.sponges["Յ"](coral_instance, event_category, event_action, event_label);
    }
  }
};

Zone.prototype._perform_scope_symbol_update_process = function (scope, update_cycle_symbol) {
  var j;
  var scope_update_metadata = scope[''];
  var instance_update_metadata = scope[''];
  var update_cycle_symbol_instance_update_metadata = instance_update_metadata[update_cycle_symbol];
  var update_cycle_symbol_update_metadata = scope_update_metadata[update_cycle_symbol];
  var always_recompute_symbols = update_cycle_symbol_update_metadata.get_always_recompute_input_symbols();
  var dependee_update_input_values = [];
  var has_unavailable_dependencies = false;
  var has_changed_inputs = false;
  var dependee_current_value = scope.state[update_cycle_symbol];
  var update_handler_input_symbols = update_cycle_symbol_update_metadata.update_handler_input_symbols;

  for (j = 0; j !== update_handler_input_symbols.length; ++j) {
    var dependee_input_symbol = update_handler_input_symbols[j];
    var dependee_input_value;

    if (Coral.sponges["Կ"](dependee_input_symbol)) {
      dependee_input_value = Coral.sponges[dependee_input_symbol];
    } else if (dependee_input_symbol === '') {
      dependee_input_value = dependee_current_value;
      if (dependee_input_value instanceof Unresolved) {
        dependee_input_value = dependee_input_value.value;
      }
    } else {
      var dependee_input_status = this._process_dependency_hierarchy(scope, dependee_input_symbol);

      if (dependee_input_status !== FULLY_RESOLVED_UNCHANGED || always_recompute_symbols.indexOf(dependee_input_symbol) !== -1) {
        has_changed_inputs = true;
      }

      if (dependee_input_status === FULLY_RESOLVED_CHANGED_PROCESSING ||
          dependee_input_status === READY_TO_RESOLVE ||
          dependee_input_status === WAITING_ON_DEPENDENCIES) {
        has_unavailable_dependencies = true;
        break;
      }

      dependee_input_value = scope.state[dependee_input_symbol];
    }
    dependee_update_input_values.push(dependee_input_value);
  }

  var update_symbol_status = has_unavailable_dependencies ? WAITING_ON_DEPENDENCIES : READY_TO_RESOLVE;
  update_cycle_symbol_instance_update_metadata.set_state(update_symbol_status);

  if (update_symbol_status === READY_TO_RESOLVE) {
    // TODO: Support doing sync update processing in a far more efficient manner than having everything go down the async path.
    var resolve_callback = this._create_async_update_callback(scope, update_cycle_symbol);

    if (has_changed_inputs || dependee_current_value instanceof Unresolved) {
      var async_update_handler = update_cycle_symbol_update_metadata.update_handler;

      if (update_cycle_symbol_update_metadata.raw_update_handler_input_data) {
        async_update_handler(resolve_callback, scope, update_cycle_symbol_update_metadata.raw_update_handler_input_data);
      } else {
        dependee_update_input_values.unshift(resolve_callback);
        async_update_handler.apply(null, dependee_update_input_values);
      }
    } else {
      resolve_callback(dependee_current_value);
    }
  }
};

module.exports = Zone;

},{"./unresolved":21}]},{},[16]);
"use strict"
Coral.sponges["԰"]=function (text) {
      return document.createTextNode(text);
    };Coral.sponges["Ա"]=function () {
      return document.createTextNode('');
    };Coral.sponges["Բ"]=function (nodes) {
      return nodes.filter(function (node) {
        return node.nodeType !== Node.TEXT_NODE;
      });
    };Coral.sponges["Գ"]=function (value) {
      return value === undefined || value === null ? '' : value + '';
    };Coral.sponges["Դ"]=function (elem, placement) {
      if (placement.nextSibling) {
        return placement.parentNode.insertBefore(elem,placement.nextSibling);
      } else {
        return placement.parentNode.appendChild(elem);
      }
    };Coral.sponges["Ե"]=function (begin_placement, end_placement) {
      var nodes = [];
      var current_node = begin_placement.nextSibling;
      var after_end_placement = end_placement.nextSibling;
      while (current_node !== after_end_placement) {
        nodes.push(current_node);
        current_node = current_node.nextSibling;
      }

      return nodes;
    };Coral.sponges["Զ"]=function (node, begin_placement, end_placement) {
      if (!begin_placement || !end_placement) {
        return false;
      }

      // When the begin placement is equal to the end placement, then we know that the placement range is empty and don't need to do any further checks.
      if (begin_placement === end_placement) {
        return false;
      }

      if (node === end_placement) {
        return true;
      }

      var is_after_begin_placement = node.compareDocumentPosition(begin_placement) === Node.DOCUMENT_POSITION_PRECEDING;
      if (!is_after_begin_placement) {
        return false;
      }

      var position_relative_to_end_placement = node.compareDocumentPosition(end_placement);
      var is_before_or_in_end_placement = (position_relative_to_end_placement & 4) === 4 || (position_relative_to_end_placement & 8) === 8;
      return is_before_or_in_end_placement;
    };Coral.sponges["Է"]=function (html, placement) {
      var elem = document.createElement("div");
      elem.innerHTML = html;
      return Coral.sponges["Դ"](elem.firstChild, placement);
    };Coral.sponges["Ը"]=function (text, placement) {
      return Coral.sponges["Դ"](Coral.sponges["԰"](text == null ? '' : text), placement);
    };Coral.sponges["Թ"]=function (unsafe) {
      unsafe = unsafe == null ? '' : unsafe + '';
      return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#x27;")
        .replace(/`/g, "&#x60;");
    };Coral.sponges["Ժ"]=function (html) {
      var frag = document.createDocumentFragment();
      var parse_node = document.createElement("div");
      parse_node.innerHTML = html;
      while(parse_node.firstChild) {
        frag.appendChild(parse_node.firstChild);
      }

      return frag;
    };Coral.sponges["Ի"]=function (begin_placement, end_placement, destination_placement) {
      var parent_node = begin_placement.parentNode;
      var current_node = begin_placement.nextSibling;
      var after_end_placement = end_placement.nextSibling;
      while (current_node !== after_end_placement) {
        var next_node = current_node.nextSibling;

        Coral.sponges["Դ"](current_node, destination_placement);

        destination_placement = current_node;
        current_node = next_node;
      }
    };Coral.sponges["Լ"]=function (before_placement, after_placement, include_after_placement) {
      // Deleting the before placement isn't a good idea, so immediately bail if that is the case.
      if (before_placement === after_placement) return;

      var parent_node = before_placement.parentNode;
      var current_node = before_placement.nextSibling;

      var barrier_node = include_after_placement ? after_placement.nextSibling : after_placement;

      while (current_node !== barrier_node) {
        var node_to_remove = current_node;
        current_node = current_node.nextSibling;
        parent_node.removeChild(node_to_remove);
      }
    };Coral.sponges["Խ"]=function (range, code) {
      for (var i = 0; i !== range.length; i+=2) {
        if (code >= range[i] && code < range[i + 1]) {
          return true;
        }
      }
      return false;
    };Coral.sponges["Ծ"]=function (range, index) {
      var running_count = 0;
      for (var i = 0; i !== range.length; i+=2) {
        var start_code = range[i];
        var end_code = range[i + 1];

        var count = end_code - start_code;

        var current_offset = index - running_count;

        if (current_offset < count) {
          return String.fromCharCode(start_code + current_offset);
        }

        running_count += count;
      }

      return false;
    };Coral.sponges["Կ"]=function (symbol) {
      return Coral.sponges["Խ"]([1328,1568,2559,3133,19968,Infinity], symbol.charCodeAt(0));
    };Coral.sponges["Հ"]=function (input, operation_func, finish_callback, notify_failed_attempt_callback) {
      var backoff = 5;
      var attempts = 0;
      var notified = false;

      attempt();
      function attempt () {
        attempts++;

        operation_func(input, finish_callback, function () {
          if (!notified) {
            notified = true;
            notify_failed_attempt_callback();
          }

          setTimeout(attempt, backoff);
          backoff *= 2;
        });
      }
    };Coral.sponges["Ձ"]=function (url, success, failure) {
      var script = document.createElement('script');
      script.onload = success;
      script.onerror = failure;
      script.src = url;
      document.body.appendChild(script);
    };Coral.sponges["Ղ"]=function (url, success, failure) {
      var script = document.createElement('script');
      script.charset = "utf-8";
      script.onload = success;
      script.onerror = failure;
      script.src = url;
      document.body.appendChild(script);
    };Coral.sponges["Ճ"]=function (url, success, failure) {
      var css = document.createElement('link');
      css.rel = 'stylesheet';
      css.type = 'text/css';
      css.href = url;
      css.onload = success;
      css.onerror = failure;
      document.body.appendChild(css);
    };Coral.sponges["Մ"]=function load_dependency(dependency_name, dependency_input, dependency_type, coral_instance, loaded_callback, implied_deps) {
      var dependency_registry = coral_instance.settings.dependency_registry;
      if (!dependency_registry) {
        coral_instance.settings.dependency_registry = {};
        dependency_registry = coral_instance.settings.dependency_registry;
      }
      var dependency_state = dependency_registry[dependency_name];
      if (dependency_state === true) {
        loaded_callback();
        return;
      } else if (dependency_state instanceof Coral.Unresolved) {
        var pending_unresolved = new Coral.Unresolved(1, [], function (cb) { cb(); }, loaded_callback);
        dependency_state.add_dependee(pending_unresolved);
        return;
      }
      var dependency_loader = dependency_type === 'javascript' ? Coral.sponges["Ձ"]
        : dependency_type === 'shard_javascript' ? Coral.sponges["Ղ"]
        : dependency_type === 'css' ? Coral.sponges["Ճ"]
        : null;

      var operation_unresolved = new Coral.Unresolved(1, [], function (cb) { cb(); }, loaded_callback);
      dependency_registry[dependency_name] = operation_unresolved;

      if (implied_deps && implied_deps.length) {
        implied_deps.forEach(function (dep) {
          var already_resolved = dependency_registry[dep] === true;
          if (already_resolved) {
            return;
          }

          var dep_unresolved = new Coral.Unresolved(1, [], function (cb) { cb(); }, function () {
            dependency_registry[dep] = true;
          });
          operation_unresolved.add_dependee(dep_unresolved);
          dependency_registry[dep] = dep_unresolved;
        });
      }

      Coral.sponges["Հ"](dependency_input, dependency_loader, function () {
        dependency_registry[dependency_name] = true;
        operation_unresolved.dependency_resolved();
      }, function () {
        var event_category = 'DependencyLoadFailure';
        var dependency_host_match = dependency_input.match(/^(https?:)?\/\/(.*?)\//);
        var dependency_host = dependency_host_match && dependency_host_match[2] || dependency_input;
        var action = dependency_host;
        var label = dependency_input;
        Coral.sponges["Յ"](coral_instance, event_category, action, label);
      });
    };Coral.sponges["Յ"]=function (coral_instance, category, action, label) {
      if (coral_instance.settings.error_handler) {
        coral_instance.settings.error_handler(category, action, label);
      } else {
        console.error(
          'No error_handler specified in Coral settings; internal framework error details below.',
          '\ncategory:', category,
          '\naction:', action,
          '\nlabel:', label
        );
      }
    };Coral.sponges["Ն"]=function (scope_async_pre_init_function, scope_sync_init_function, parameter_values, parameter_name_to_symbol, coral_instance) {
      var scope_context = null; // There is no scope context for root scopes.
      var scope = new Coral.Scope(scope_context, scope_async_pre_init_function, scope_sync_init_function, coral_instance);

      for (var parameter_name in parameter_name_to_symbol) {
        var parameter_symbol = parameter_name_to_symbol[parameter_name];
        scope.state[parameter_symbol] = parameter_values[parameter_name];
        var parameter_symbol_metadata = scope['q'](parameter_symbol);
        parameter_symbol_metadata.is_scope_parameter = true;
      }

      scope['']();
      return scope;
    };Coral.sponges["Շ"]=function (scope_symbol_metadata) {
      scope_symbol_metadata.is_registered_for_update_cycle = true;
    };Coral.sponges["Ո"]=function (val, force) {
      var is_compute_update = false;
      Coral.Observable.scheduler.register_update(this.scope_context, this.symbol, val, is_compute_update, force);

      Coral.Observable.scheduler.run();
    };Coral.sponges["Չ"]=function () {
      var zone = this[''];
      var has_already_sync_initialized = zone.is_ready();
      if (has_already_sync_initialized) {
        return;
      }

      var is_zone_entry_point_async_resolved = this[''];

      if (is_zone_entry_point_async_resolved) {
        this.state._sync_init.bind(this)();
        zone.enter_ready_state();
      } else {
        var async_init_unresolved = this[''];

        var scope_context = this;

        // TODO: deduplicate
        if (scope_context.state._preload) {
          var preload_fragment = Coral.sponges["Ժ"]([scope_context.state._preload]);
          var preload_end_marker = Coral.sponges["Ա"]();
          preload_fragment.appendChild(preload_end_marker);
          Coral.sponges["Դ"](preload_fragment, scope_context.state[scope_context.state.begin_placement_symbol]);
          scope_context.state[scope_context.state.end_placement_symbol] = preload_end_marker;
        }

        var current_initialization_start_tick = zone._initialization_start_tick;

        var wait_till_resolved = new Coral.Unresolved(1,[],Coral.sponges["ՙ"],function () {
          if (current_initialization_start_tick !== zone._initialization_start_tick || scope_context['n']()) {
            return;
          }

          var begin_placement = scope_context.state[scope_context.state.begin_placement_symbol];
          var end_placement = scope_context.state[scope_context.state.end_placement_symbol];

          if (begin_placement !== end_placement && begin_placement && end_placement) {
            Coral.sponges["Լ"](begin_placement, end_placement, true);
          }

          scope_context.state._sync_init.bind(scope_context)();
          zone.enter_ready_state();
        });

        async_init_unresolved.add_dependee(wait_till_resolved);
      }
    };Coral.sponges["Պ"]=function (target, path) {
      return Coral.get_at_path(target, path);
    };Coral.sponges["Ջ"]=function (target, path, val) {
      target = typeof target === 'object' && target || {};
      var cur = target;
      for (var i = 0; i !== path.length - 1; ++i) {
        var entry = cur[path[i]];
        cur[path[i]] = typeof entry === 'object' && entry || {};
        cur = cur[path[i]];
      }
      cur[path[path.length - 1]] = val;
      return target;
    };Coral.sponges["Ռ"]=function (items_symbol, symbol_instance_update_metadata) {
      return {
        enumerable: true,
        get: function () {
          return this[""].scope_item_index;
        },
        // Sets on index parameters are not allowed, so I am just going to leave this empty.
        set: function (v) {}
      };
    };Coral.sponges["Ս"]=function (value, forward_to_scope) {
      var scratch = forward_to_scope.state[''];
      var index = scratch.scope_item_index;
      return index;
    };Coral.sponges["Վ"]=function () {
      throw new Error("Sets on index parameters are not allowed");
    };Coral.sponges["Տ"]=function () {
      return {
        enumerable: true,
        get: function () {
          var scratch_data = this[''];
          var previous_scope = scratch_data.previous_scope;
          var previous_intermediate_output_symbol = scratch_data.previous_intermediate_output_symbol;

          return previous_scope.state[previous_intermediate_output_symbol];
        }
      };
    };Coral.sponges["Ր"]=function (scope_array, initial_intermediate) {
      var safety_belt_text_node = Coral.sponges["Ա"]();
      var scope_array_length = scope_array.length;
      if (scope_array_length) {
        var scope;
        for (var i = 0; i !== scope_array_length; ++i) {
          scope = scope_array[i];
          // TODO: clean up this hack
          var scope_scratch_data = scope.state[''];
          scope_scratch_data.sync_intermediate_output_symbol = scope.state.end_placement_symbol;
          if (i !== 0) {
            scope_scratch_data.previous_intermediate_output_symbol = scope_scratch_data.previous_scope.state.end_placement_symbol;
            scope_scratch_data.previous_scope = scope_array[i - 1];
          }
          scope['ł']();
        }
        var last_scope_in_array = scope_array[scope_array_length - 1];
        var last_scope_in_array_end_placement_symbol = last_scope_in_array.state.end_placement_symbol;
        var last_scope_in_array_end_placement = last_scope_in_array.state[last_scope_in_array_end_placement_symbol];
        Coral.sponges["Դ"](safety_belt_text_node, last_scope_in_array_end_placement);
      } else {
        Coral.sponges["Դ"](safety_belt_text_node, initial_intermediate);
      }
      var final_intermediate_value = safety_belt_text_node;
      return final_intermediate_value;
    };Coral.sponges["Ց"]=function (scope_array, dom_node) {
      if (scope_array.length === 1) {
        return scope_array[0];
      }

      var range_start_index = 0;
      var range_length = scope_array.length;

      var scope;
      while (range_length) {
        if (range_length === 1) {
          scope = scope_array[range_start_index];
          break;
        }

        var range_midpoint_index = Math.floor(range_length / 2) + range_start_index;
        var midpoint_scope = scope_array[range_midpoint_index];
        var midpoint_scope_scratch_data = midpoint_scope.state[''];

        var midpoint_scope_end_placement = midpoint_scope.state[midpoint_scope_scratch_data.sync_intermediate_output_symbol];
        if (midpoint_scope_end_placement === dom_node) {
          scope = midpoint_scope;
          break;
        }

        var end_placement_relative_position = dom_node.compareDocumentPosition(midpoint_scope_end_placement);

        var is_dom_node_in_end_placement = (end_placement_relative_position & 8) === 8;
        if (is_dom_node_in_end_placement) {
          scope = midpoint_scope;
          break;
        }

        var is_dom_node_after_end_placement = (end_placement_relative_position & 2) === 2;
        if (is_dom_node_after_end_placement) {
          var old_range_start_index = range_start_index;
          range_start_index = range_midpoint_index + 1;
          var range_start_diff = range_start_index - old_range_start_index;
          range_length = range_length - range_start_diff;
          continue;
        }

        var midpoint_scope_begin_placement = midpoint_scope.state[midpoint_scope_scratch_data.sync_intermediate_input_symbol];

        // NOTE: The midpoint scope places itself immediately after its begin placement.
        var begin_placement_relative_position = dom_node.compareDocumentPosition(midpoint_scope_begin_placement);

        var is_dom_node_in_begin_placement = (begin_placement_relative_position & 8) === 8;
        if (is_dom_node_in_begin_placement) {
          scope = scope_array[range_midpoint_index - 1];
          break;
        }

        var is_dom_node_after_begin_placement = (begin_placement_relative_position & 2) === 2;
        if (is_dom_node_after_begin_placement) {
          scope = midpoint_scope;
          break;
        }

        // DOM node is somewhere before the midpoint, so update the range length to our current index.
        range_length = range_midpoint_index - range_start_index;
      }

      return scope;
    };Coral.sponges["Ւ"]=function (identity_deduplicated_items_array, identity_deduplicated_last_items_array, identity_comparison) {
      var items_array = identity_deduplicated_items_array;
      var last_items_array = identity_deduplicated_last_items_array;

      var larger_length = Math.max(items_array.length, last_items_array.length);
      var unmatched_new_item_indexes = [];
      var unmatched_old_item_indexes = [];

      var updated_item_indexes = [];
      var unchanged_item_indexes = [];

      var i;
      var j;

      for (i = 0; i !== larger_length; ++i) {
        var item = items_array[i];
        var old_item = last_items_array[i];
        var beyond_items_array_length = i >= items_array.length;
        var beyond_old_items_array_length = i >= last_items_array.length;

        if (!beyond_items_array_length && beyond_old_items_array_length) {
          unmatched_new_item_indexes.push(i);
        } else if (beyond_items_array_length && !beyond_old_items_array_length) {
          unmatched_old_item_indexes.push(i);
        } else if (identity_comparison(item, old_item)) {
          if (item !== old_item) {
            updated_item_indexes.push(i);
          } else {
            unchanged_item_indexes.push(i);
          }
        } else {
          unmatched_old_item_indexes.push(i);
          unmatched_new_item_indexes.push(i);
        }
      }

      var new_item_indexes = [];
      var removed_item_indexes = [];
      var all_index_moves = [];

      if (unmatched_new_item_indexes.length && !unmatched_old_item_indexes.length) {
        new_item_indexes = unmatched_new_item_indexes;
      } else if (unmatched_old_item_indexes.length && !unmatched_new_item_indexes.length) {
        removed_item_indexes = unmatched_old_item_indexes;
      } else {
        for (i = 0; i !== unmatched_new_item_indexes.length; ++i) {
          var unmatched_new_item_index = unmatched_new_item_indexes[i];
          var unmatched_old_item_index;
          var unmatched_new_item = items_array[unmatched_new_item_index];
          var unmatched_old_item;
          var found_match = false;

          for (j = 0; j !== unmatched_old_item_indexes.length; ++j) {
            unmatched_old_item_index = unmatched_old_item_indexes[j];
            unmatched_old_item = last_items_array[unmatched_old_item_index];

            if (identity_comparison(unmatched_new_item, unmatched_old_item)) {
              found_match = true;
              break;
            }
          }

          if (found_match) {
            unmatched_old_item_indexes.splice(j, 1);
            if (unmatched_new_item !== unmatched_old_item) {
              updated_item_indexes.push(unmatched_new_item_index);
            } else {
              unchanged_item_indexes.push(unmatched_new_item_index);
            }

            all_index_moves.push(unmatched_new_item_index, unmatched_old_item_index);
          } else {
            new_item_indexes.push(unmatched_new_item_index);
          }
        }

        Array.prototype.push.apply(removed_item_indexes, unmatched_old_item_indexes);
      }

      return {
        item_updates: updated_item_indexes,
        unchanged_items: unchanged_item_indexes,
        new_item_indexes: new_item_indexes,
        removed_item_indexes: removed_item_indexes,
        item_index_moves: all_index_moves
      };
    };Coral.sponges["Փ"]=function (scope, value, metadata) {
      var source_computable_symbol = metadata.source_computable_symbol;
      var field_path = metadata.field_path;

      var source = scope.state[source_computable_symbol];
      var updated_source = Coral.sponges["Ջ"](source, field_path, value);

      scope['ĺ'](source_computable_symbol, null, function (originating_scope, originating_symbol) {
        var is_compute_update = false;
        var is_forced_update = true;
        var initialization_start_tick;

        Coral.Observable.scheduler.register_update(originating_scope, originating_symbol, updated_source, is_compute_update, is_forced_update, initialization_start_tick, scope, metadata.symbol);
        Coral.Observable.scheduler.run();
      });
    };Coral.sponges["Ք"]=function (scope, value, metadata) {
      var source_computable_symbol = metadata.source_computable_symbol;
      var dynamic_field_symbol = metadata.dynamic_field_symbol;

      var source = scope.state[source_computable_symbol];
      var dynamic_field_name = scope.state[dynamic_field_symbol];

      var updated_source = Coral.sponges["Ջ"](source, [dynamic_field_name], value);

      scope['ĺ'](source_computable_symbol, null, function (originating_scope, originating_symbol) {
        var is_compute_update = false;
        var is_forced_update = true;
        var initialization_start_tick;

        Coral.Observable.scheduler.register_update(originating_scope, originating_symbol, updated_source, is_compute_update, is_forced_update, initialization_start_tick, scope, metadata.symbol);
        Coral.Observable.scheduler.run();
      });
    };Coral.sponges["Օ"]=function (val, force) {
    var is_compute_update = false;
    Coral.Observable.scheduler.register_update(this.scope_context, this.symbol, val, is_compute_update, force);

    Coral.Observable.scheduler.run();
  };Coral.sponges["Ֆ"]=function (observable) {
      var scope_not_destroyed = !!observable.scope_context;
      if (scope_not_destroyed) {
        observable.on('_set', Coral.sponges["Օ"]);
      }
    };Coral.sponges["՗"]=function (resolve_callback, source, path) {
      resolve_callback(Coral.sponges["Պ"](source, path));
    };Coral.sponges["՘"]=function (resolve_callback, source, field) {
      resolve_callback(Coral.sponges["Պ"](source, [field]));
    };Coral.sponges["ՙ"]=function (resolve_callback, value) {
      resolve_callback(value);
    };Coral.sponges["՚"]=function (resolve_callback, scope_context, symbols) {
      var scope_symbol = symbols[0];
      var existing_scope = scope_context.state[scope_symbol];

      if (existing_scope instanceof Coral.Unresolved) {
        existing_scope = existing_scope.value;
      }

      var updated_boolean_determining_value = !!scope_context.state[symbols[1]];
      var scratch_data = existing_scope.state[''];

      var last_boolean_determining_value = scratch_data.determining_value_boolean;

      // Return the existing scope to make it clear no change occurred.
      if (updated_boolean_determining_value === last_boolean_determining_value) {
        return resolve_callback(existing_scope);
      }

      var created_scope;
      var existing_scope_async_input_output_symbols;
      var existing_scope_sync_input_output_symbols;
      var new_scope_async_input_output_symbols;
      var new_scope_sync_input_output_symbols;
      var scope_async_pre_init_function;
      var scope_sync_init_function;

      var option_symbol_groups = symbols.slice(2).split('');
      var truthy_input_output_symbol_groups = option_symbol_groups[0].split('');
      var falsy_input_output_symbol_groups = option_symbol_groups[1].split('');

      if (updated_boolean_determining_value) {
        existing_scope_async_input_output_symbols = falsy_input_output_symbol_groups[0];
        existing_scope_sync_input_output_symbols = falsy_input_output_symbol_groups[1];
        new_scope_async_input_output_symbols = truthy_input_output_symbol_groups[0];
        new_scope_sync_input_output_symbols = truthy_input_output_symbol_groups[1];
        scope_async_pre_init_function = scratch_data.truthy_scope_async_pre_init;
        scope_sync_init_function = scratch_data.truthy_scope_sync_init;
      } else {
        existing_scope_async_input_output_symbols = truthy_input_output_symbol_groups[0];
        existing_scope_sync_input_output_symbols = truthy_input_output_symbol_groups[1];
        new_scope_async_input_output_symbols = falsy_input_output_symbol_groups[0];
        new_scope_sync_input_output_symbols = falsy_input_output_symbol_groups[1];
        scope_async_pre_init_function = scratch_data.falsy_scope_async_pre_init;
        scope_sync_init_function = scratch_data.falsy_scope_sync_init;
      }

      var new_scope = scope_context['l'](scope_async_pre_init_function, scope_sync_init_function);

      scope_context[''].initialize_scope_instance_parameters(scope_context, new_scope_async_input_output_symbols+new_scope_sync_input_output_symbols);

      // TODO: Deduplicate setup code, the block below is basically duplicated, but with different vars
      new_scope.state[''] = {
        is_polymorphic_scope: true,
        determining_value_boolean: updated_boolean_determining_value,
        truthy_scope_async_pre_init: scratch_data.truthy_scope_async_pre_init,
        truthy_scope_sync_init: scratch_data.truthy_scope_sync_init,
        falsy_scope_async_pre_init: scratch_data.falsy_scope_async_pre_init,
        falsy_scope_sync_init: scratch_data.falsy_scope_sync_init,
        safety_belt_text_node: scratch_data.safety_belt_text_node
      };

      new_scope['t'](new_scope_async_input_output_symbols, [35,67]);
      new_scope['t'](new_scope_sync_input_output_symbols, [67,99]);
      scope_context['v'](new_scope, new_scope_async_input_output_symbols, [35,67]);
      scope_context['v'](new_scope, new_scope_sync_input_output_symbols, [67,99]);

      new_scope['']();

      existing_scope['m']();

      // NOTE: This keeps the upward forwarding in place, but the updates will be filtered out by the update cycle.  The updates will work themselves out of the system over time.
      var parent_scope = existing_scope.state[''];
      parent_scope['w']([existing_scope], existing_scope_async_input_output_symbols + existing_scope_sync_input_output_symbols);

      var async_init_resolved_status = new_scope[''];
      if (!new_scope[''] && async_init_resolved_status instanceof Coral.Unresolved) {
        var finish_when_resolved = new Coral.Unresolved(1, [async_init_resolved_status], function (cb) { cb(new_scope); }, resolve_callback);
        async_init_resolved_status.add_dependee(finish_when_resolved);
      } else {
        resolve_callback(new_scope);
      }
    };Coral.sponges["՛"]=function (resolve_callback, scope_context, symbols) {
      var scope_symbol = symbols[0];
      var determining_value_symbol = symbols[1];

      var existing_scope = scope_context.state[scope_symbol];

      if (existing_scope instanceof Coral.Unresolved) {
        existing_scope = existing_scope.value;
      }

      var determining_value = scope_context.state[determining_value_symbol];

      var scratch_data = existing_scope.state[''];
      var all_cases_data = scratch_data.cases;
      var existing_case_data = all_cases_data[scratch_data.current_case];

      var case_global_symbol;
      for (case_global_symbol in all_cases_data) {
        var case_value = Coral.sponges[case_global_symbol];

        if (determining_value === case_value) {
          break;
        }
      }

      // NOTE: Since we use an exact value match for the determining value, it is impossible for a change in determining value to not result in a change in scope.
      // * TODO: Think about possibility of case changing, but still using the same type of scope. Very oddball case, but I suppose it is possible.  Fine for now if it just destroys the existing and creates a new one.

      var case_data = all_cases_data[case_global_symbol];

      var new_scope_input_output_symbol_groups = case_data.input_output_symbols.split('');
      var existing_scope_input_output_symbol_groups = existing_case_data.input_output_symbols.split('');

      var new_scope_async_input_output_symbols = new_scope_input_output_symbol_groups[0];
      var new_scope_sync_input_output_symbols = new_scope_input_output_symbol_groups[1];
      var existing_scope_async_input_output_symbols = existing_scope_input_output_symbol_groups[0];
      var existing_scope_sync_input_output_symbols = existing_scope_input_output_symbol_groups[1];

      // TODO: Deduplicate setup code, the block below is basically duplicated, but with different vars.  Scratch data is different.
      var new_scope = scope_context['l'](case_data.async_pre_init, case_data.sync_init);

      scope_context[''].initialize_scope_instance_parameters(scope_context, new_scope_async_input_output_symbols+new_scope_sync_input_output_symbols);

      new_scope.state[''] = {
        is_polymorphic_scope: true,
        cases: all_cases_data,
        current_case: case_global_symbol,
        safety_belt_text_node: scratch_data.safety_belt_text_node
      };

      new_scope['t'](new_scope_async_input_output_symbols, [35,67]);
      new_scope['t'](new_scope_sync_input_output_symbols, [67,99]);
      // TODO: We want to add a special dependency on these forwarding rules that will hold an update if a symbol has the possibility of changing in that update cycle and kill the update if that is the case.
      scope_context['v'](new_scope, new_scope_async_input_output_symbols, [35,67]);
      scope_context['v'](new_scope, new_scope_sync_input_output_symbols, [67,99]);

      new_scope['']();

      existing_scope['m']();

      // NOTE: This keeps the upward forwarding in place, but the updates will be filtered out by the update cycle.  The updates will work themselves out of the system over time.
      var parent_scope = existing_scope.state[''];
      parent_scope['w']([existing_scope], existing_scope_async_input_output_symbols + existing_scope_sync_input_output_symbols);

      var async_init_resolved_status = new_scope[''];
      if (!new_scope[''] && async_init_resolved_status instanceof Coral.Unresolved) {
        var finish_when_resolved = new Coral.Unresolved(1, [async_init_resolved_status], function (cb) { cb(new_scope); }, resolve_callback);
        async_init_resolved_status.add_dependee(finish_when_resolved);
      } else {
        resolve_callback(new_scope);
      }
    };Coral.sponges["՜"]=function (resolve_callback, scope_context, argument_data) {
      var symbols = argument_data.symbols;
      var identity_comparison = argument_data.identity_comparison;

      var items_array_symbol = symbols[1];
      var items_array = scope_context.state[items_array_symbol];
      var dedup = Coral.identity_deduplicate_array;
      var deduplicated_items = dedup(items_array, identity_comparison);

      // Grab last items and last indexes metadata
      var scope_array_symbol = symbols[0];
      var scratch = scope_context[''][scope_array_symbol].scratch;
      var last_items_array = scratch.last_items_array;

      // Since only one option exists, it maps to all indexes
      function to_range (el, i) { return i; }

      var option = {
        case_data: argument_data.case_data,
        last_items: last_items_array,
        last_indexes: last_items_array.map(to_range),
        current_items: deduplicated_items,
        current_indexes: deduplicated_items.map(to_range)
      };

      // Reset 'last' scratch data for next update
      scratch.last_items_array = deduplicated_items.slice();

      return Coral.sponges["՞"](
        scope_context,
        resolve_callback,
        [option],
        symbols,
        deduplicated_items,
        identity_comparison
      );
    };Coral.sponges["՝"]=function (resolve_callback, scope_context, argument_data) {
      var identity_comparison = argument_data.identity_comparison;
      var symbols = argument_data.symbols;
      var data_by_case = argument_data.data_by_case;

      // Prep map function with current values
      var map_function = argument_data.map_function_func;
      var map_function_symbols = argument_data.map_function_input_symbols;
      var map_item_parameter_index = -1;
      var map_arguments = [];

      for (var i = 0; i < map_function_symbols.length; i++) {
        var symbol = map_function_symbols[i];
        if (symbol === '') {
          map_item_parameter_index = i;
          map_arguments.push(undefined);
        } else {
          map_arguments.push(scope_context.state[symbol]);
        }
      }

      var items_array_symbol = symbols[1];
      var items_array = scope_context.state[items_array_symbol];
      var dedup = Coral.identity_deduplicate_array;
      var deduplicated_items = dedup(items_array, identity_comparison);

      // Parse items by their case scopes
      var items_by_case = {};
      var indexes_by_case = {};

      deduplicated_items.forEach(function (item, i) {
        if (map_item_parameter_index !== -1) {
          map_arguments[map_item_parameter_index] = item;
        }
        var case_value = map_function.apply(null, map_arguments);

        if (!items_by_case[case_value]) items_by_case[case_value] = [];
        if (!indexes_by_case[case_value]) indexes_by_case[case_value] = [];

        items_by_case[case_value].push(item);
        indexes_by_case[case_value].push(i);
      });

      // Grab last items and last indexes metadata
      var scope_array_symbol = symbols[0];
      var scratch = scope_context[''][scope_array_symbol].scratch;
      var last_items_by_case = scratch.last_items_by_case;
      var last_indexes_by_case = scratch.last_indexes_by_case;

      // Build options array with all necessary data per case
      var options = Object.keys(data_by_case).map(function (case_value) {
        return {
          case_data: data_by_case[case_value],
          last_items: last_items_by_case[case_value] || [],
          last_indexes: last_indexes_by_case[case_value] || [],
          current_items: items_by_case[case_value] || [],
          current_indexes: indexes_by_case[case_value] || []
        };
      });

      // Reset 'last' scratch data for next update
      scratch.last_items_by_case = items_by_case;
      scratch.last_indexes_by_case = indexes_by_case;

      return Coral.sponges["՞"](
        scope_context,
        resolve_callback,
        options,
        symbols,
        deduplicated_items,
        identity_comparison
      );
    };Coral.sponges["՞"]=function (scope_context, resolve_callback, options, symbols, deduplicated_items, identity_comparison) {
      var scope_array_symbol = symbols[0];
      var scope_array = scope_context.state[scope_array_symbol];
      if (scope_array instanceof Coral.Unresolved) scope_array = scope_array.value;

      var items_array_symbol = symbols[1];
      var items_array = scope_context.state[items_array_symbol];

      var zone = scope_context[''];
      var updated_scope_array = new Array(deduplicated_items.length);
      var any_changes = false;

      options.forEach(function (option, option_index) {
        if (!option.last_items.length && !option.current_items.length) {
          return;
        }

        var current_items = option.current_items;
        var current_indexes = option.current_indexes;
        var last_scopes = option.last_indexes.map(function (i) {
          return scope_array[i];
        });

        var diff = Coral.sponges["Ւ"](
          current_items,
          option.last_items,
          identity_comparison
        );

        any_changes = any_changes || diff.item_index_moves.length ||
          diff.new_item_indexes.length || diff.removed_item_indexes.length ||
          current_indexes.join('') !== option.last_indexes.join('');

        var current_scopes = Coral.sponges["՟"](
          current_items.length,
          last_scopes,
          diff.item_index_moves,
          diff.removed_item_indexes
        );

        // Must use 'for' loop to handle undefined (new scope) indexes
        for (var i = 0; i < current_scopes.length; i++) {
          var scope = current_scopes[i];
          var index = current_indexes[i];

          if (!scope) {
            // Store option index for scopes that must be created
            updated_scope_array[index] = option_index;
            continue;
          }

          var item = current_items[i];
          var scratch = scope.state[''];
          var scope_item_index = items_array.indexOf(item);
          scratch.scope_item_index = scope_item_index;
          updated_scope_array[index] = scope;
        }

        // Destroy scopes at removed indexes
        if (diff.removed_item_indexes.length) {
          var scopes_to_destroy = diff.removed_item_indexes.map(function (i) {
            var scope = last_scopes[i];
            scope['m']();
            return scope;
          });

          scope_context['w'](
            scopes_to_destroy,
            option.case_data.async_input_symbols + option.case_data.sync_input_output_symbols
          );
        }

        // Initialize params if new scopes needed
        if (diff.new_item_indexes.length) {
          zone.initialize_scope_instance_parameters(
            scope_context,
            option.case_data.async_input_symbols + option.case_data.sync_input_output_symbols
          );
        }
      });

      if (!any_changes) {
        return resolve_callback(scope_array);
      }

      // Create new array scopes
      var initial_intermediate_symbol = symbols[2];
      var unresolveds = [];

      updated_scope_array.forEach(function (option_index, i) {
        // Scopes that need creation have an option_index as a placeholder
        if (typeof option_index !== 'number') return;

        var option = options[option_index];
        var new_item = deduplicated_items[i];
        var previous_scope = updated_scope_array[i - 1];

        var new_scope = scope_context['Ł'](
          items_array_symbol,
          items_array.indexOf(new_item),
          option.case_data.async_pre_init,
          option.case_data.sync_init,
          option.case_data.async_input_symbols,
          option.case_data.sync_input_output_symbols,
          initial_intermediate_symbol,
          scope_array_symbol,
          previous_scope
        );

        updated_scope_array[i] = new_scope;
        new_scope['']();

        var is_zone = new_scope[''];
        var async_init_status = new_scope[''];
        if (!is_zone && async_init_status instanceof Coral.Unresolved) {
          unresolveds.push(async_init_status);
        }
      });

      if (unresolveds.length) {
        var array_async_init_status = new Coral.Unresolved(
          unresolveds.length,
          unresolveds,
          function (cb) { cb(updated_scope_array); },
          resolve_callback
        );
        unresolveds.forEach(function (unresolved) {
          unresolved.add_dependee(array_async_init_status);
        });
      } else {
        return resolve_callback(updated_scope_array);
      }
    };Coral.sponges["՟"]=function (size, initial_array, moved_indexes, removed_indexes) {
      var updated_array = new Array(size);
      var i;

      for (i = 0; i < initial_array.length; i++) {
        if (i < size && removed_indexes.indexOf(i) === -1) {
          updated_array[i] = initial_array[i];
        }
      }

      for (i = 0; i < moved_indexes.length; i += 2) {
        var move_to = moved_indexes[i];
        var move_from = moved_indexes[i + 1];
        var item = initial_array[move_from];

        var curr_index = updated_array.indexOf(item);
        if (curr_index !== -1) {
          updated_array[curr_index] = undefined;
        }
        updated_array[move_to] = item;
      }

      return updated_array;
    };Coral.sponges["ՠ"]=function (pure_function) {
      return function (resolve_callback) {
        var inputs = Array.prototype.slice.call(arguments, 1);
        resolve_callback(pure_function.apply(null, inputs));
      };
    };Coral.sponges["ա"]=function (resolve_callback, value) {
      if (value instanceof Promise) {
        value.then(function (result) {
          resolve_callback({ result: result });
        }, function (err) {
          // The promise being rejected should be considered an error state, it seems best to not pass through the error to avoid code not expecting an error and expecting some sort of specific sort of value otherwise.
          resolve_callback({ error: err });
        });
      } else {
        resolve_callback({ result: value });
      }
    };Coral.sponges["բ"]=function (pure_function) {
      return function (resolve_callback) {
        var inputs = Array.prototype.slice.call(arguments, 1);
        var output = pure_function.apply(null, inputs);
        Coral.sponges["ա"](resolve_callback, output);
      };
    };Coral.sponges["գ"]=function (start_index, end_index, scope_array, scope_context, initial_intermediate_symbol) {
      var last_scope = scope_array[start_index - 1] || scope_context;
      var last_intermediate_output_symbol = last_scope === scope_context ? initial_intermediate_symbol : last_scope.state[''].sync_intermediate_output_symbol;

      var finish_index = end_index + 1;

      for (var i = start_index; i !== finish_index; ++i) {
        var scope = scope_array[i];
        if (!scope) {
          continue;
        }

        var scope_scratch_data = scope.state[''];

        scope_scratch_data.previous_scope = last_scope;
        scope_scratch_data.previous_intermediate_output_symbol = last_intermediate_output_symbol;

        last_scope = scope;
        last_intermediate_output_symbol = scope_scratch_data.sync_intermediate_output_symbol;
      }
    };Coral.sponges["դ"]=function (new_polymorphic_scope, scope_context, symbols) {
      var begin_placement = new_polymorphic_scope.state[new_polymorphic_scope.state.begin_placement_symbol];
      var safety_belt_text_node = new_polymorphic_scope.state[''].safety_belt_text_node;
      Coral.sponges["Լ"](begin_placement, safety_belt_text_node);

      new_polymorphic_scope['']();
    };Coral.sponges["ե"]=function (remove_start_index, remove_end_index, scope_array, scope_context, initial_intermediate_symbol) {
      var remove_start_scope = scope_array[remove_start_index];
      var remove_end_scope = scope_array[remove_end_index];
      var begin_removal_placement = remove_start_scope.state[remove_start_scope.state.begin_placement_symbol];
      var end_removal_placement = remove_end_scope.state[remove_end_scope.state.end_placement_symbol];

      Coral.sponges["Լ"](begin_removal_placement, end_removal_placement, true);

      var remove_start_scope_scratch_data = remove_start_scope.state[''];
      var scope_before_range = remove_start_scope_scratch_data.previous_scope;
      var scope_after_remove_range = scope_array[remove_end_index + 1];
      if (scope_after_remove_range) {
        var scope_after_remove_range_scratch_data = scope_after_remove_range.state[''];
        scope_after_remove_range_scratch_data.previous_scope = scope_before_range;
        scope_after_remove_range_scratch_data.previous_intermediate_output_symbol = scope_before_range === scope_context ? initial_intermediate_symbol : scope_before_range.state.end_placement_symbol;
      }
    };Coral.sponges["զ"]=function (value, scope, scope_array_scratch_data) {
      var scope_array = value;
      var final_intermediate_symbol = scope_array_scratch_data.final_intermediate_symbol;
      var initial_intermediate_symbol = scope_array_scratch_data.initial_intermediate_symbol;
      var last_scope_array = scope_array_scratch_data.last_scope_array;
      scope_array_scratch_data.last_scope_array = scope_array;

      var i;
      var j;
      var initial_intermediate_placement = scope.state[initial_intermediate_symbol];
      var last_end_placement = initial_intermediate_placement;
      var original_scope_array_pool = [];

      var removed_scope_indexes = [];
      var removed_scope_index_length = 0;
      for (i = 0; i !== last_scope_array.length; ++i) {
        var last_scope_array_scope = last_scope_array[i];
        var is_removed = true;

        for (j = 0; j !== scope_array.length; ++j) {
          if (last_scope_array_scope === scope_array[j]) {
            is_removed = false;
            break;
          }
        }

        if (is_removed) {
          removed_scope_index_length = removed_scope_indexes.push(i);
        } else {
          original_scope_array_pool.push(last_scope_array_scope);
        }
      }

      var removed_scope_index;
      if (removed_scope_index_length === 1) {
        removed_scope_index = removed_scope_indexes[0];
        Coral.sponges["ե"](removed_scope_index, removed_scope_index, last_scope_array, scope, initial_intermediate_symbol);
      } else if (removed_scope_index_length > 1) {
        var removed_scope_range_start_index = removed_scope_indexes[0];
        var last_removed_scope_index = removed_scope_range_start_index;
        for (i = 1; i !== removed_scope_indexes.length; ++i) {
          removed_scope_index = removed_scope_indexes[i];
          if (removed_scope_index !== (last_removed_scope_index + 1)) {
            Coral.sponges["ե"](removed_scope_range_start_index, last_removed_scope_index, last_scope_array, scope, initial_intermediate_symbol);
            removed_scope_range_start_index = removed_scope_index;
          }
          last_removed_scope_index = removed_scope_index;
        }

        Coral.sponges["ե"](removed_scope_range_start_index, last_removed_scope_index, last_scope_array, scope, initial_intermediate_symbol);
      }

      for (i = 0; i !== scope_array.length; ++i) {
        var updated_scope_array_scope = scope_array[i];
        var scope_array_pool_index = original_scope_array_pool.indexOf(updated_scope_array_scope);
        var is_new_scope = scope_array_pool_index === -1;
        if (is_new_scope) {
          updated_scope_array_scope['ł']();
        } else {
          var move_required = scope_array_pool_index !== 0;
          original_scope_array_pool.splice(scope_array_pool_index, 1);

          if (move_required) {
            var begin_placement = updated_scope_array_scope.state[updated_scope_array_scope.state.begin_placement_symbol];
            var end_placement = updated_scope_array_scope.state[updated_scope_array_scope.state.end_placement_symbol];
            Coral.sponges["Ի"](begin_placement, end_placement, last_end_placement);

            if (scope_array_pool_index < original_scope_array_pool.length) {
              Coral.sponges["գ"](scope_array_pool_index, scope_array_pool_index, original_scope_array_pool, scope, initial_intermediate_symbol);
            }
          }
        }

        Coral.sponges["գ"](i, i, scope_array, scope, initial_intermediate_symbol);
        last_end_placement = updated_scope_array_scope.state[updated_scope_array_scope.state.end_placement_symbol];
      }
    };Coral.sponges["է"]=function (initial_attribute_input_value) {
      var last_value_classes = initial_attribute_input_value.split(' ').filter(function (classValue) {
        return !!classValue;
      });

      return function (value, scope, dom_element_symbol) {
        var current_value = Coral.sponges["Գ"](value);
        var value_classes = current_value.split(' ').filter(function (classValue) {
          return !!classValue;
        });

        var dom_element = scope.state[dom_element_symbol];
        var current_classes = dom_element.className.split(' ');
        var updated_classes;
        var i;

        if (last_value_classes.length) {
          updated_classes = [];
          for (i = 0; i !== current_classes.length; ++i) {
            var class_name = current_classes[i];
            if (last_value_classes.indexOf(class_name) === -1) {
              updated_classes.push(class_name);
            }
          }
        } else {
          updated_classes = current_classes;
        }

        for (i = 0; i !== value_classes.length; ++i) {
          var value_class = value_classes[i];
          if (updated_classes.indexOf(value_class) === -1) {
            updated_classes.push(value_class);
          }
        }

        dom_element.className = updated_classes.join(' ').trim();

        last_value_classes = value_classes;
      };
    };Coral.sponges["ը"]=function (value, scope, symbols) {
      var dom_element = scope.state[symbols[0]];

      var updated_style_value = '';
      for (var i = 1; i < symbols.length; ++i) {
        var attribute_input_symbol = symbols[i];
        updated_style_value += scope.state[attribute_input_symbol] || '';
      }

      dom_element.style.cssText = updated_style_value;
    };Coral.sponges["թ"]=function (value, scope, symbols) {
      var dom_element = scope.state[symbols[0]];
      var attribute_name = Coral.sponges[symbols[1]];

      var updated_value = '';
      for (var i = 2; i < symbols.length; ++i) {
        var attribute_input_symbol = symbols[i];
        updated_value += Coral.sponges["Գ"](scope.state[attribute_input_symbol]);
      }

      dom_element.setAttribute(attribute_name, updated_value);
    };Coral.sponges["ժ"]=function (value, scope, symbols) {
      var dom_element = scope.state[symbols[0]];
      var attribute_name = Coral.sponges[symbols[1]];

      if (value == null) {
        dom_element.removeAttribute(attribute_name);
      } else {
        dom_element.setAttribute(attribute_name, Coral.sponges["Գ"](value));
      }
    };Coral.sponges["ի"]=function (value, scope, text_node_symbol) {
      var text_node = scope.state[text_node_symbol];
      text_node.textContent = value == null ? '' : value;
    };Coral.sponges["լ"]=function (value, scope, symbols) {
      var before_placement = scope.state[symbols[0]];
      var after_placement = scope.state[symbols[1]];

      Coral.sponges["Լ"](before_placement, after_placement);

      var frag = Coral.sponges["Ժ"](value);
      Coral.sponges["Դ"](frag,before_placement);
    };Coral.sponges["խ"]=function (val, scope, to_symbol) {
      Coral.Observable.scheduler.register_update(scope, to_symbol, val, false, false);
    };Coral.sponges["ծ"]="card-img-top";Coral.sponges["կ"]="img";Coral.sponges["հ"]="src";Coral.sponges["ձ"]="class";Coral.sponges["ղ"]="alt";Coral.sponges["ճ"]=function() {
// Sync init element: _inner_view_scope$0
this.M("կCFsհEձcղD").e()
};Coral.sponges["մ"]=function() {
// Async pre-init element: _inner_view_scope$0
this.c("CF").h("F").k(1,0,0,3).b().B("cծ")
};Coral.sponges["յ"]="card-text";Coral.sponges["ն"]="p";Coral.sponges["շ"]=function() {
// Sync init element: _inner_view_scope$1
this.M("նCEsձc").N("tDs").e()
};Coral.sponges["ո"]=function() {
// Async pre-init element: _inner_view_scope$1
this.c("CE").h("E").k(1,0,0,2).b().B("cյ")
};Coral.sponges["չ"]="btn btn-info";Coral.sponges["պ"]="blank";Coral.sponges["ջ"]="a";Coral.sponges["ռ"]="href";Coral.sponges["ս"]="target";Coral.sponges["վ"]=function() {
// Sync init element: _inner_view_scope$2
this.M("ջCFsռEձcսd").N("tDs").e()
};Coral.sponges["տ"]=function() {
// Async pre-init element: _inner_view_scope$2
this.c("CF").h("F").k(2,0,0,3).b().B("cչdպ")
};Coral.sponges["ր"]="mb-3 font-weight-bolder";Coral.sponges["ց"]="mt-4";Coral.sponges["ւ"]=function (counterValue) {
      var _counterValue = counterValue.get();
      counterValue.set(_counterValue + 1);
    };Coral.sponges["փ"]="click";Coral.sponges["ք"]="button";Coral.sponges["օ"]=0;Coral.sponges["ֆ"]="div";Coral.sponges["և"]="h2";Coral.sponges["ֈ"]="<p>Clicking the button increments the counter.</p>";Coral.sponges["։"]="<div> <strong>Code</strong> <ul> <li><a href=\"https://github.com/lockerdome/coral.js-tutorials/blob/master/demos/app/elements/demos/demo_001.js\" target=\"_blank\">app/elements/demos/demo_001.js</a></li> <li><a href=\"https://github.com/lockerdome/coral.js-tutorials/blob/master/demos/app/views/demos/demo_001.hjs\" target=\"_blank\">app/views/demos/demo_001.hjs</a></li> </ul> </div>";Coral.sponges["֊"]="<hr>";Coral.sponges["֋"]="<button type=\"button\" class=\"btn btn-info mr-2\">click to +1</button>";Coral.sponges["֌"]=" click counter: ";Coral.sponges["֍"]=" ";Coral.sponges["֎"]=function() {
// Sync init element: demos/demo_001
this.C("rօ").L("ֆCst").M("ևtuvձc").N("wDv").I(Coral.sponges["Է"],"xֈu").I(Coral.sponges["Է"],"y։x").I(Coral.sponges["Է"],"z֊s").M("ֆzE|ձd").I(Coral.sponges["Է"],"}֋|").I(Coral.sponges["Ը"],"~֌}").N("̰r~").I(Coral.sponges["Ը"],"̱֍̰").e()
};Coral.sponges["֏"]=function() {
// Async pre-init element: demos/demo_001
this.c("CE").h("E").k(2,0,0,2).b().B("cրdց").g("փքւr")
};Coral.sponges["֐"]=["title"];Coral.sponges["֑"]=function() {
// Sync init element: ITEM_WRAPPER_demos/demo_001__main/main__content__demo_001
this.Y("rDE").X("sr֐").P("c").e()
};Coral.sponges["֒"]=function() {
// Async pre-init element: ITEM_WRAPPER_demos/demo_001__main/main__content__demo_001
this.c("CF").h("F").k(1,0,0,3).b().R(Coral.sponges["֏"],"c֎CsF").g("փc")
};Coral.sponges["֓"]="<p>Even numbers will appear in <span class=\"text-primary\">blue</span>.</p>";Coral.sponges["֔"]="<p>Odd numbers will appear in <span class=\"text-danger\">red</span>.</p>";Coral.sponges["֕"]="<div> <strong>Code</strong> <ul> <li><a href=\"https://github.com/lockerdome/coral.js-tutorials/blob/master/demos/app/elements/demos/demo_002.js\" target=\"_blank\">app/elements/demos/demo_002.js</a></li> <li><a href=\"https://github.com/lockerdome/coral.js-tutorials/blob/master/demos/app/views/demos/demo_002.hjs\" target=\"_blank\">app/views/demos/demo_002.hjs</a></li> </ul> </div>";Coral.sponges["֖"]="span";Coral.sponges["֗"]=function() {
// Sync init element: demos/demo_002
this.C("rօ").H(function (counterValue) {
      return counterValue % 2 === 0;
    },"sr").H(function anonymous(isEven) {
return  isEven ? 'text-primary' : 'text-danger' 
},"ts").H(function anonymous(isEven) {
return isEven ? '(even)' : '(odd)'
},"us").L("ֆCvw").M("ևwxyձc").N("zDy").I(Coral.sponges["Է"],"{ֈx").I(Coral.sponges["Է"],"|֓{").I(Coral.sponges["Է"],"}֔|").I(Coral.sponges["Է"],"~֕}").I(Coral.sponges["Է"],"̰֊v").M("ֆ̰E̲ձd").I(Coral.sponges["Է"],"̳֋̲").I(Coral.sponges["Ը"],"̴֌̳").M("̴̵̶֖ձt").N("̷r̶").I(Coral.sponges["Ը"],"̸֍̵").N("̹u̸").I(Coral.sponges["Ը"],"̺֍̹").e()
};Coral.sponges["֘"]=function() {
// Async pre-init element: demos/demo_002
this.c("CE").h("E").k(2,0,0,2).b().B("cրdց").g("փքւr")
};Coral.sponges["֙"]=function() {
// Sync init element: ITEM_WRAPPER_demos/demo_002__main/main__content__demo_002
this.Y("rDE").X("sr֐").P("c").e()
};Coral.sponges["֚"]=function() {
// Async pre-init element: ITEM_WRAPPER_demos/demo_002__main/main__content__demo_002
this.c("CF").h("F").k(1,0,0,3).b().R(Coral.sponges["֘"],"c֗CsF").g("փc")
};Coral.sponges["֛"]=" You haven't clicked the button at all. ";Coral.sponges["֜"]=function() {
// Sync init element: _inner_view_scope$3
this.I(Coral.sponges["Ը"],"D֛C").e()
};Coral.sponges["֝"]=function() {
// Async pre-init element: _inner_view_scope$3
this.c("CD").h("D").k(0,0,0,1).b()
};Coral.sponges["֞"]=" You have clicked the +1 button once. ";Coral.sponges["֟"]=function() {
// Sync init element: _inner_view_scope$4
this.I(Coral.sponges["Ը"],"D֞C").e()
};Coral.sponges["֠"]=function() {
// Async pre-init element: _inner_view_scope$4
this.c("CD").h("D").k(0,0,0,1).b()
};Coral.sponges["֡"]=" You have clicked the +1 button twice. ";Coral.sponges["֢"]=function() {
// Sync init element: _inner_view_scope$5
this.I(Coral.sponges["Ը"],"D֡C").e()
};Coral.sponges["֣"]=function() {
// Async pre-init element: _inner_view_scope$5
this.c("CD").h("D").k(0,0,0,1).b()
};Coral.sponges["֤"]=" You have clicked the +1 button three times. ";Coral.sponges["֥"]=function() {
// Sync init element: _inner_view_scope$7
this.I(Coral.sponges["Ը"],"D֤C").e()
};Coral.sponges["֦"]=function() {
// Async pre-init element: _inner_view_scope$7
this.c("CD").h("D").k(0,0,0,1).b()
};Coral.sponges["֧"]=" You have clicked the +1 button more than three times! ";Coral.sponges["֨"]=function() {
// Sync init element: _inner_view_scope$8
this.I(Coral.sponges["Ը"],"D֧C").e()
};Coral.sponges["֩"]=function() {
// Async pre-init element: _inner_view_scope$8
this.c("CD").h("D").k(0,0,0,1).b()
};Coral.sponges["֪"]="mt-3";Coral.sponges["֫"]="250";Coral.sponges["֬"]="rounded";Coral.sponges["֭"]="../../assets/images/doodles/blue_tang.png";Coral.sponges["֮"]="drawing of a blue tang";Coral.sponges["֯"]="width";Coral.sponges["ְ"]="height";Coral.sponges["ֱ"]=function() {
// Sync init element: _inner_view_scope$9
this.M("ֆCDsձc").M("կstu֯dְdձeհfղg").e()
};Coral.sponges["ֲ"]=function() {
// Async pre-init element: _inner_view_scope$9
this.c("CD").h("D").k(5,0,0,1).b().B("c֪d֫e֬f֭g֮")
};Coral.sponges["ֳ"]="display: inline-block; width: 100px;";Coral.sponges["ִ"]="mt-2";Coral.sponges["ֵ"]="number";Coral.sponges["ֶ"]="0";Coral.sponges["ַ"]="255";Coral.sponges["ָ"]="red-slider";Coral.sponges["ֹ"]="range";Coral.sponges["ֺ"]="cursor-pointer";Coral.sponges["ֻ"]="green-slider";Coral.sponges["ּ"]="blue-slider";Coral.sponges["ֽ"]="mt-4 ml-2";Coral.sponges["־"]="background-color: rgb(";Coral.sponges["ֿ"]=", ";Coral.sponges["׀"]="); height: 200px; width: 400px; border-radius: 10px;";Coral.sponges["ׁ"]=73;Coral.sponges["ׂ"]=146;Coral.sponges["׃"]=245;Coral.sponges["ׄ"]="<p>Adjust the <strong>R</strong>ed, <strong>G</strong>reen, and <strong>B</strong>lue values to change the colour of the box.</p>";Coral.sponges["ׅ"]="<div> <strong>Code</strong> <ul> <li><a href=\"https://github.com/lockerdome/coral.js-tutorials/blob/master/demos/app/elements/demos/demo_004.js\" target=\"_blank\">app/elements/demos/demo_004.js</a></li> <li><a href=\"https://github.com/lockerdome/coral.js-tutorials/blob/master/demos/app/views/demos/demo_004.hjs\" target=\"_blank\">app/views/demos/demo_004.hjs</a></li> </ul> </div>";Coral.sponges["׆"]="style";Coral.sponges["ׇ"]="R: ";Coral.sponges["׈"]="input";Coral.sponges["׉"]="type";Coral.sponges["׊"]="min";Coral.sponges["׋"]="max";Coral.sponges["׌"]="value";Coral.sponges["׍"]="id";Coral.sponges["׎"]="G: ";Coral.sponges["׏"]="B: ";Coral.sponges["א"]="rgb(";Coral.sponges["ב"]=")";Coral.sponges["ג"]=function() {
// Sync init element: demos/demo_004
this.C("rׁ").C("sׂ").C("t׃").L("ֆCuv").M("ևvwxձd").N("yDx").I(Coral.sponges["Է"],"zׄw").I(Coral.sponges["Է"],"{ׅz").I(Coral.sponges["Է"],"|֊u").M("ֆ|E~ձe").M("ֆ~̰̱ձf").M("ֆ̱̲̳׆c").I(Coral.sponges["Ը"],"̴ׇ̳").M("׈̴̵̶׉g׊h׋i׌r").M("׈̷̸̲׍j׉k׊h׋i׌rձl").M("ֆ̰̹̺ձf").M("ֆ̺̻̼׆c").I(Coral.sponges["Ը"],"̽׎̼").M("׈̽̾̿׉g׊h׋i׌s").M("׈̻̀́׍m׉k׊h׋i׌sձl").M("ֆ̹͂̓ձf").M("ֆ̓̈́ͅ׆c").I(Coral.sponges["Ը"],"͆׏ͅ").M("׈͇͈͆׉g׊h׋i׌t").M("׈͉̈́͊׍n׉k׊h׋i׌tձl").M("ֆ͂͋͌ձo").I(Coral.sponges["Ը"],"͍א͌").N("͎r͍").I(Coral.sponges["Ը"],"͏ֿ͎").N("͐s͏").I(Coral.sponges["Ը"],"ֿ͑͐").N("͒t͑").I(Coral.sponges["Ը"],"͓ב͒").M("ֆ͔͕͋ձf׆prqsqtİ").e()
};Coral.sponges["ד"]=function() {
// Async pre-init element: demos/demo_004
this.c("CE").h("E").k(16,0,0,2).b().B("cֳdրeցfִgֵhֶiַjָkֹlֺmֻnּoֽp־qֿİ׀")
};Coral.sponges["ה"]=function() {
// Sync init element: ITEM_WRAPPER_demos/demo_004__main/main__content__demo_004
this.Y("rDE").X("sr֐").P("c").e()
};Coral.sponges["ו"]=function() {
// Async pre-init element: ITEM_WRAPPER_demos/demo_004__main/main__content__demo_004
this.c("CF").h("F").k(1,0,0,3).b().R(Coral.sponges["ד"],"cגCsF")
};Coral.sponges["ז"]="mb-4";Coral.sponges["ח"]="width: 350px;";Coral.sponges["ט"]="input-group mb-3";Coral.sponges["י"]="form-control";Coral.sponges["ך"]="alert alert-info h4";Coral.sponges["כ"]=function (isInputBlank, iscurrentlyCounting, countDownStartingValue, countDownCurrentValue) {

      var countDown = setInterval(doCountDown, 1000);

      countDownStartingValue.on('change', function (_newCountDownStartingValue) {
        var _isInputBlank = _newCountDownStartingValue !== 0 && !_newCountDownStartingValue;
        if (_isInputBlank) {
          isInputBlank.set(true);
          clearInterval(countDown);
          iscurrentlyCounting.set(false);
          return;
        }
        isInputBlank.set(false);
        countDownCurrentValue.set(_newCountDownStartingValue);
        if (!iscurrentlyCounting.get()) {
          iscurrentlyCounting.set(true);
          countDown = setInterval(doCountDown, 1000);
        }
      });

      function doCountDown () {
        var _countDownCurrentValue = parseFloat(countDownCurrentValue.get());
        if (_countDownCurrentValue <= 0) {
          stopCountDown();
          iscurrentlyCounting.set(false);
        } else {
          _countDownCurrentValue--;
          countDownCurrentValue.set(_countDownCurrentValue);
          iscurrentlyCounting.set(true);
        }
      }

      function stopCountDown () {
        clearInterval(countDown);
      }

    };Coral.sponges["ל"]=function (countDownStartingValue, countDownCurrentValue) {
      var _countDownStartingValue = countDownStartingValue.get();
      countDownStartingValue.set(_countDownStartingValue, true); // This .set() call uses the force trigger change flag
    };Coral.sponges["ם"]=false;Coral.sponges["מ"]=true;Coral.sponges["ן"]=5;Coral.sponges["נ"]="<p>Changing the starting value or clicking the Restart button restarts the countdown.</p>";Coral.sponges["ס"]="<div> <strong>Code</strong> <ul> <li><a href=\"https://github.com/lockerdome/coral.js-tutorials/blob/master/demos/app/elements/demos/demo_009.js\" target=\"_blank\">app/elements/demos/demo_009.js</a></li> <li><a href=\"https://github.com/lockerdome/coral.js-tutorials/blob/master/demos/app/views/demos/demo_009.hjs\" target=\"_blank\">app/views/demos/demo_009.hjs</a></li> </ul> </div>";Coral.sponges["ע"]="<div class=\"input-group-prepend\"> <span class=\"input-group-text\">Counting down from</span> </div>";Coral.sponges["ף"]="<div class=\"input-group-append\"> <button class=\"btn btn-danger\" type=\"button\">Restart</button> </div>";Coral.sponges["פ"]="strong";Coral.sponges["ץ"]=function() {
// Sync init element: demos/demo_009
this.C("rם").C("sמ").C("tן").C("uן").H(function (countDownCurrentValue) {
      if (countDownCurrentValue <= 0) return 'Timer expired.';
      var needsPlural = countDownCurrentValue !== 1;
      var seconds = 'second' + (needsPlural ? 's' : '');
      return countDownCurrentValue + ' ' + seconds + ' remaining.';
    },"vu").H(function anonymous(isInputBlank,countdownMessage) {
return isInputBlank ? 'Enter a starting value.' : countdownMessage
},"wrv").L("ֆCxy").M("ևyz{ձc").N("|D{").I(Coral.sponges["Է"],"}נz").I(Coral.sponges["Է"],"~ס}").I(Coral.sponges["Է"],"̰֊x").M("ֆ̰E̲ձd").M("ֆ̴̲̳׆e").M("ֆ̴̵̶ձf").I(Coral.sponges["Է"],"̷ע̶").M("׈̷̸̹׉gձh׌t").I(Coral.sponges["Է"],"̺ף̸").M("ֆ̵̻̼ձi").L("פ̼̽̾").N("̿w̾").d("").e().Ņ(Coral.sponges["כ"],"rstu")
};Coral.sponges["צ"]=function() {
// Async pre-init element: demos/demo_009
this.c("CE").h("E").k(7,0,0,2).b().B("cրdזeחfטgֵhיiך").g("փքלtu")
};Coral.sponges["ק"]=function() {
// Sync init element: ITEM_WRAPPER_demos/demo_009__main/main__content__demo_009
this.Y("rDE").X("sr֐").P("c").d("c").e()
};Coral.sponges["ר"]=function() {
// Async pre-init element: ITEM_WRAPPER_demos/demo_009__main/main__content__demo_009
this.c("CF").h("F").k(1,0,0,3).b().R(Coral.sponges["צ"],"cץCsF").g("փc")
};Coral.sponges["ש"]="<div> <p>Welcome to the <a href=\"https://github.com/lockerdome/coral.js-tutorials/tree/master/demos\" target=\"_blank\">demos</a> app of <a href=\"https://github.com/lockerdome/coral.js-tutorials\" target=\"_blank\">coral.js-tutorials</a>. This app was built with <a href=\"https://github.com/lockerdome/coral\">Coral.js</a>.</p> <p>Here you will find a variety of examples that showcase the many different features of the Coral.js framework.</p> </div>";Coral.sponges["ת"]=function() {
// Sync init element: demos/demo_intro
this.M("ևCrsձc").N("tDs").I(Coral.sponges["Է"],"Eשr").e()
};Coral.sponges["׫"]=function() {
// Async pre-init element: demos/demo_intro
this.c("CE").h("E").k(1,0,0,2).b().B("cր")
};Coral.sponges["׬"]=function() {
// Sync init element: ITEM_WRAPPER_demos/demo_intro__main/main__content__demo_intro
this.Y("rDE").X("sr֐").P("c").e()
};Coral.sponges["׭"]=function() {
// Async pre-init element: ITEM_WRAPPER_demos/demo_intro__main/main__content__demo_intro
this.c("CF").h("F").k(1,0,0,3).b().R(Coral.sponges["׫"],"cתCsF")
};Coral.sponges["׮"]="<p>Additional description for the demo.</p>";Coral.sponges["ׯ"]="<div class=\"mb-4\"> </div>";Coral.sponges["װ"]=function() {
// Sync init element: demos/demo_template
this.L("ֆCrs").M("ևstuձc").N("vDu").I(Coral.sponges["Է"],"w׮t").I(Coral.sponges["Է"],"x֊r").I(Coral.sponges["Է"],"Eׯx").e()
};Coral.sponges["ױ"]=function() {
// Async pre-init element: demos/demo_template
this.c("CE").h("E").k(1,0,0,2).b().B("cր")
};Coral.sponges["ײ"]="ml-4";Coral.sponges["׳"]="small";Coral.sponges["״"]=function() {
// Sync init element: _inner_view_scope$10
this.M("ֆCFsձc").M("׳stuձE").N("vDu").e()
};Coral.sponges["׵"]=function() {
// Async pre-init element: _inner_view_scope$10
this.c("CF").h("F").k(1,0,0,3).b().B("cײ")
};Coral.sponges["׶"]="width: 320px;";Coral.sponges["׷"]="text";Coral.sponges["׸"]="type something here...";Coral.sponges["׹"]=function (newEntry, seaCreatureList) {
            var _newEntry = newEntry.get();
            if (_newEntry) {
              var clonedSeaCreatureList = seaCreatureList.get().slice();
              clonedSeaCreatureList.push(_newEntry);
              newEntry.set('');
              seaCreatureList.set(clonedSeaCreatureList);
            }
          };Coral.sponges["׺"]="placeholder";Coral.sponges["׻"]="<div class=\"input-group-append\"><button class=\"btn bg-coral text-light\" type=\"button\" id=\"button-addon1\">+</button></div>";Coral.sponges["׼"]=function() {
// Sync init element: demos/demo_006.js->    - inline element at elements.seaCreatureAdder.type
this.M("ֆCFsձc׆d").M("׈stu׉eձf׌D׺g").I(Coral.sponges["Է"],"v׻t").e()
};Coral.sponges["׽"]=function() {
// Async pre-init element: demos/demo_006.js->    - inline element at elements.seaCreatureAdder.type
this.c("CF").h("F").k(5,0,0,3).b().B("cטd׶e׷fיg׸").g("փք׹DE")
};Coral.sponges["׾"]="#b2b2b2";Coral.sponges["׿"]="container rounded p-2 mt-3 mb-3";Coral.sponges["؀"]="background-color: ";Coral.sponges["؁"]=function (innerInnerClickCount) {
                      innerInnerClickCount.set(innerInnerClickCount.get() + 1);
                    };Coral.sponges["؂"]="<span class=\"font-monospace\">innerInnerClickCount:</span>";Coral.sponges["؃"]=function() {
// Sync init element: demos/demo_007.js->    - inline element at dynamicElementLists.innerElements.item.type->    - inline element at dynamicElementLists.innerElements.item.type
this.C("rօ").I(function (parentElementName, elementName) {
                      return parentElementName + elementName;
                    },"sDE").M("ֆCFuձd׆ec").L("פuvw").N("xsw").L("նvyz").I(Coral.sponges["Է"],"{؂z").L("פ{|}").N("~r}").e()
};Coral.sponges["؄"]=function() {
// Async pre-init element: demos/demo_007.js->    - inline element at dynamicElementLists.innerElements.item.type->    - inline element at dynamicElementLists.innerElements.item.type
this.c("CF").h("F").k(3,0,0,3).b().B("c׾d׿e؀").g("փ؁r")
};Coral.sponges["؅"]=["name"];Coral.sponges["؆"]=function() {
// Sync init element: ITEM_WRAPPER_demos/demo_007.js->    - inline element at dynamicElementLists.innerElements.item.type->    - inline element at dynamicElementLists.innerElements.item.type__demos/demo_007.js->    - inline element at dynamicElementLists.innerElements.item.type__innerElements__item
this.Y("rDE").X("sr؅").P("c").e()
};Coral.sponges["؇"]=function() {
// Async pre-init element: ITEM_WRAPPER_demos/demo_007.js->    - inline element at dynamicElementLists.innerElements.item.type->    - inline element at dynamicElementLists.innerElements.item.type__demos/demo_007.js->    - inline element at dynamicElementLists.innerElements.item.type__innerElements__item
this.c("CG").h("G").k(1,0,0,4).b().R(Coral.sponges["؄"],"c؃CFsG").g("փc")
};Coral.sponges["؈"]="#d8d8d8";Coral.sponges["؉"]=[{name:1},{name:2},{name:3}];Coral.sponges["؊"]="container rounded d-inline-block p-5 m-4";Coral.sponges["؋"]="; max-width: 350px;";Coral.sponges["،"]=function (innerClickCount) {
              innerClickCount.set(innerClickCount.get() + 1);
            };Coral.sponges["؍"]="<span class=\"font-monospace\">innerClickCount:</span>";Coral.sponges["؎"]=function() {
// Sync init element: demos/demo_007.js->    - inline element at dynamicElementLists.innerElements.item.type
this.C("rօ").M("ֆCEtձf׆gdh").L("פtuv").L("նuwx").W("c").N("zDv").I(Coral.sponges["Է"],"{؍x").L("פ{|}").N("~r}").e()
};Coral.sponges["؏"]=function(a,b) {
return ((a&&a.name)+"")===((b&&b.name)+"")
};Coral.sponges["ؐ"]=function() {
// Async pre-init element: demos/demo_007.js->    - inline element at dynamicElementLists.innerElements.item.type
this.c("CE").h("E").k(6,0,0,2).b().B("d؈e؉f؊g؀h؋").U(Coral.sponges["؇"],"c؆ewy؏¡e D¢").g("փcփ،r")
};Coral.sponges["ؑ"]=function() {
// Sync init element: ITEM_WRAPPER_demos/demo_007.js->    - inline element at dynamicElementLists.innerElements.item.type__demos/demo_007__innerElements__item
this.Y("rDE").X("sr؅").P("c").e()
};Coral.sponges["ؒ"]=function() {
// Async pre-init element: ITEM_WRAPPER_demos/demo_007.js->    - inline element at dynamicElementLists.innerElements.item.type__demos/demo_007__innerElements__item
this.c("CF").h("F").k(1,0,0,3).b().R(Coral.sponges["ؐ"],"c؎CsF").g("փc")
};Coral.sponges["ؓ"]="Element A";Coral.sponges["ؔ"]=[{name:"Element B"},{name:"Element C"}];Coral.sponges["ؕ"]=function (outerClickCount) {
      outerClickCount.set(outerClickCount.get() + 1);
    };Coral.sponges["ؖ"]="<p>Click around this demo area.</p>";Coral.sponges["ؗ"]="<div> <strong>Code</strong> <ul> <li><a href=\"https://github.com/lockerdome/coral.js-tutorials/blob/master/demos/app/elements/demos/demo_007.js\" target=\"_blank\">app/elements/demos/demo_007.js</a></li> <li><a href=\"https://github.com/lockerdome/coral.js-tutorials/blob/master/demos/app/views/demos/demo_007.hjs\" target=\"_blank\">app/views/demos/demo_007.hjs</a></li> </ul> </div>";Coral.sponges["ؘ"]="<span class=\"font-monospace\">outerClickCount:</span>";Coral.sponges["ؙ"]=function() {
// Sync init element: demos/demo_007
this.C("rօ").M("ֆCEtձf").L("ֆtuv").M("ֆuwxձg").L("פxyz").L("նy{|").L("ֆ{}~").W("c").M("ևv̱̲ձh").N("̳D̲").I(Coral.sponges["Է"],"̴̱ؖ").I(Coral.sponges["Է"],"̵̴ؗ").N("̶dz").I(Coral.sponges["Է"],"̷ؘ|").L("פ̷̸̹").N("̺r̹").e()
};Coral.sponges["ؚ"]=function() {
// Async pre-init element: demos/demo_007
this.c("CE").h("E").k(6,0,0,2).b().B("dؓeؔfֺgזhր").U(Coral.sponges["ؒ"],"cؑe~̰؏¡e ¢").g("փcփֆؕr")
};Coral.sponges["؛"]=function() {
// Sync init element: ITEM_WRAPPER_demos/demo_007__main/main__content__demo_007
this.Y("rDE").X("sr֐").P("c").e()
};Coral.sponges["؜"]=function() {
// Async pre-init element: ITEM_WRAPPER_demos/demo_007__main/main__content__demo_007
this.c("CF").h("F").k(1,0,0,3).b().R(Coral.sponges["ؚ"],"cؙCsF").g("փc")
};Coral.sponges["؝"]="btn rounded-pill btn-lg btn-block mb-3 bg-light";Coral.sponges["؞"]=function (emitEvent, multiplicationValue) {
                      emitEvent('multiplierWasSelected', Coral.Observable.unpack(multiplicationValue));
                    };Coral.sponges["؟"]=function() {
// Sync init element: demos/demo_008.js->    - inline element at dynamicElementLists.multiplicationCharts.item.type->    - inline element at dynamicElementLists.multiplierButtons.item.type
this.C("rօ").I(function anonymous(multiplicationValue) {
return "x " + multiplicationValue
},"sD").M("քCEu׉cձd").N("vsu").e()
};Coral.sponges["৿"]=function() {
// Async pre-init element: demos/demo_008.js->    - inline element at dynamicElementLists.multiplicationCharts.item.type->    - inline element at dynamicElementLists.multiplierButtons.item.type
this.c("CE").h("E").k(2,0,0,2).b().B("cքd؝").g("փ؞¦D")
};Coral.sponges["਀"]=["x"];Coral.sponges["ਁ"]=function() {
// Sync init element: ITEM_WRAPPER_demos/demo_008.js->    - inline element at dynamicElementLists.multiplicationCharts.item.type->    - inline element at dynamicElementLists.multiplierButtons.item.type__demos/demo_008.js->    - inline element at dynamicElementLists.multiplicationCharts.item.type__multiplierButtons__item
this.Y("rDE").X("sr਀").P("c").e()
};Coral.sponges["ਂ"]=function() {
// Async pre-init element: ITEM_WRAPPER_demos/demo_008.js->    - inline element at dynamicElementLists.multiplicationCharts.item.type->    - inline element at dynamicElementLists.multiplierButtons.item.type__demos/demo_008.js->    - inline element at dynamicElementLists.multiplicationCharts.item.type__multiplierButtons__item
this.c("CF").h("F").k(1,0,0,3).b().R(Coral.sponges["৿"],"c؟CsF").g("փc")
};Coral.sponges["ਃ"]=[{x:1},{x:2},{x:3},{x:4},{x:5}];Coral.sponges["਄"]="container rounded d-inline-block p-3 m-2";Coral.sponges["ਅ"]="; max-width: 200px;";Coral.sponges["ਆ"]="display-3 text-center text-light";Coral.sponges["ਇ"]="h1";Coral.sponges["ਈ"]=function (args, baseValue, emitEvent) {
              var multiplier = args[0];
              emitEvent('doMultiplication', {
                baseValue: baseValue,
                multiplier: Coral.Observable.unpack(multiplier)
              });
            };Coral.sponges["ਉ"]=function() {
// Sync init element: demos/demo_008.js->    - inline element at dynamicElementLists.multiplicationCharts.item.type
this.M("ֆCFsձe׆fEg").M("ਇstuձh").W("c").N("wDu").J(Coral.sponges["ਈ"],"x©D¦").e()
};Coral.sponges["ਊ"]=function(a,b) {
return ((a&&a.x)+"")===((b&&b.x)+"")
};Coral.sponges["਋"]="multiplierWasSelected";Coral.sponges["਌"]=function() {
// Async pre-init element: demos/demo_008.js->    - inline element at dynamicElementLists.multiplicationCharts.item.type
this.c("CF").h("F").k(6,0,0,3).b().B("dਃe਄f؀gਅhਆ").U(Coral.sponges["ਂ"],"cਁdtvਊ¡d ¢").K("਋x").g("փc")
};Coral.sponges["਍"]=["baseValue"];Coral.sponges["਎"]=["chartColor"];Coral.sponges["ਏ"]=function() {
// Sync init element: ITEM_WRAPPER_demos/demo_008.js->    - inline element at dynamicElementLists.multiplicationCharts.item.type__demos/demo_008__multiplicationCharts__item
this.Y("rDE").X("sr਍").X("tr਎").P("c").e()
};Coral.sponges["ਐ"]=function() {
// Async pre-init element: ITEM_WRAPPER_demos/demo_008.js->    - inline element at dynamicElementLists.multiplicationCharts.item.type__demos/demo_008__multiplicationCharts__item
this.c("CF").h("F").k(1,0,0,3).b().R(Coral.sponges["਌"],"cਉCstF").g("փc")
};Coral.sponges["਑"]=[{baseValue:3,chartColor:"#ff3b59"},{baseValue:4,chartColor:"#3b59ff"},{baseValue:5,chartColor:"#ffb03b"}];Coral.sponges["਒"]="display-3";Coral.sponges["ਓ"]=null;Coral.sponges["ਔ"]="<p>Put your math skills to the test. Click any multiplication on the charts to see the product.</p>";Coral.sponges["ਕ"]="<div> <strong>Code</strong> <ul> <li><a href=\"https://github.com/lockerdome/coral.js-tutorials/blob/master/demos/app/elements/demos/demo_008.js\" target=\"_blank\">app/elements/demos/demo_008.js</a></li> <li><a href=\"https://github.com/lockerdome/coral.js-tutorials/blob/master/demos/app/views/demos/demo_008.hjs\" target=\"_blank\">app/views/demos/demo_008.hjs</a></li> </ul> </div>";Coral.sponges["ਖ"]=" x ";Coral.sponges["ਗ"]=" = ";Coral.sponges["ਘ"]=function (args, selectedBaseValue, selectedMultiplier, product) {
      var data = args[0];
      _baseValue = Coral.Observable.unpack(data.baseValue);
      _multiplier = Coral.Observable.unpack(data.multiplier);
      selectedBaseValue.set(_baseValue);
      selectedMultiplier.set(_multiplier);
      product.set(_baseValue * _multiplier);
    };Coral.sponges["ਙ"]=function () {
      throw new Error("This will never get called because the event stops propagating upward after it is caught");
    };Coral.sponges["ਚ"]=function() {
// Sync init element: demos/demo_008
this.C("rਓ").C("sਓ").C("tਓ").L("ֆCuv").I(Coral.sponges["Է"],"w֊u").M("ֆwEyձe").M("ਇyz{ձf").L("ֆz|}").W("c").H(function anonymous(selectedBaseValue) {
return selectedBaseValue || '?'
},"̰r").H(function anonymous(selectedMultiplier) {
return selectedMultiplier || '?'
},"̱s").H(function anonymous(product) {
return product || '?'
},"̲t").M("ևv̴̳ձg").N("̵D̴").I(Coral.sponges["Է"],"̶ਔ̳").I(Coral.sponges["Է"],"̷ਕ̶").N("̸̰{").I(Coral.sponges["Ը"],"̹ਖ̸").N("̺̱̹").I(Coral.sponges["Ը"],"̻ਗ̺").N("̼̲̻").J(Coral.sponges["ਘ"],"̽©rst").J(Coral.sponges["ਙ"],"̾").e()
};Coral.sponges["ਛ"]=function(a,b) {
return ((a&&a.baseValue)+"")===((b&&b.baseValue)+"")
};Coral.sponges["ਜ"]="doMultiplication";Coral.sponges["ਝ"]=function() {
// Async pre-init element: demos/demo_008
this.c("CE").h("E").k(5,0,0,2).b().B("d਑eזf਒gր").U(Coral.sponges["ਐ"],"cਏd}~ਛ¡d ¢").K("ਜ̽਋̾").g("փc")
};Coral.sponges["ਞ"]=function() {
// Sync init element: ITEM_WRAPPER_demos/demo_008__main/main__content__demo_008
this.Y("rDE").X("sr֐").P("c").e()
};Coral.sponges["ਟ"]=function() {
// Async pre-init element: ITEM_WRAPPER_demos/demo_008__main/main__content__demo_008
this.c("CF").h("F").k(1,0,0,3).b().R(Coral.sponges["ਝ"],"cਚCsF").g("փc")
};Coral.sponges["ਠ"]="rounded p-4 mt-2";Coral.sponges["ਡ"]="background-color: #9372B3;";Coral.sponges["ਢ"]="<div><strong>Level 3</strong></div>";Coral.sponges["ਣ"]="regularNumber: ";Coral.sponges["ਤ"]="magicNumber: ";Coral.sponges["ਥ"]="inputNumber: ";Coral.sponges["ਦ"]=", inputNumberPlusFive: ";Coral.sponges["ਧ"]=function() {
// Sync init element: demos/demo_010.js->    - inline element at elements.innerElement.type->    - inline element at elements.innerElement.type
this.M("ֆCHsձc׆d").I(Coral.sponges["Է"],"tਢs").L("ֆtuv").I(Coral.sponges["Ը"],"wਣv").N("xDw").L("ֆuyz").I(Coral.sponges["Ը"],"{ਤz").N("|E{").L("ֆy}~").I(Coral.sponges["Ը"],"̰ਥ~").N("̱F̰").I(Coral.sponges["Ը"],"̲ਦ̱").N("̳G̲").e()
};Coral.sponges["ਨ"]=function() {
// Async pre-init element: demos/demo_010.js->    - inline element at elements.innerElement.type->    - inline element at elements.innerElement.type
this.c("CH").h("H").k(2,0,0,5).b().B("cਠdਡ")
};Coral.sponges["਩"]=8;Coral.sponges["ਪ"]="background-color: #C1AED3;";Coral.sponges["ਫ"]="<div><strong>Level 2</strong></div>";Coral.sponges["ਬ"]=function() {
// Sync init element: demos/demo_010.js->    - inline element at elements.innerElement.type
this.M("ֆCGsձe׆f").I(Coral.sponges["Է"],"tਫs").L("ֆtuv").L("ֆuwx").P("c").I(Coral.sponges["Ը"],"zਣv").N("{Dz").I(Coral.sponges["Ը"],"|ਤx").N("}d|").e()
};Coral.sponges["ਭ"]=function() {
// Async pre-init element: demos/demo_010.js->    - inline element at elements.innerElement.type
this.c("CG").h("G").k(4,0,0,4).b().B("d਩eਠfਪ").R(Coral.sponges["ਨ"],"cਧwDdEFy")
};Coral.sponges["ਮ"]=10;Coral.sponges["ਯ"]=3;Coral.sponges["ਰ"]="width: 500px;";Coral.sponges["਱"]="mb-3";Coral.sponges["ਲ"]="form-control mb-2";Coral.sponges["ਲ਼"]="Enter a number";Coral.sponges["਴"]="<p>The Environment makes it easy for descendant elements and models to have access to values.</p>";Coral.sponges["ਵ"]="<div> <strong>Code</strong> <ul> <li><a href=\"https://github.com/lockerdome/coral.js-tutorials/blob/master/demos/app/elements/demos/demo_010.js\" target=\"_blank\">app/elements/demos/demo_010.js</a></li> <li><a href=\"https://github.com/lockerdome/coral.js-tutorials/blob/master/demos/app/views/demos/demo_010.hjs\" target=\"_blank\">app/views/demos/demo_010.hjs</a></li> </ul> </div>";Coral.sponges["ਸ਼"]="<strong>Your Input:</strong>";Coral.sponges["਷"]="<div><strong>Level 1</strong></div>";Coral.sponges["ਸ"]=function() {
// Sync init element: demos/demo_010
this.C("rօ").H(function (inputNumber) {
      return parseInt(inputNumber) + 5;
    },"sr").L("ֆCtu").I(Coral.sponges["Է"],"v֊t").M("ֆvExձf").M("ֆxyz׆g").M("ֆz{|ձh").L("ֆ{}~").P("c").M("ևu̱̲ձi").N("̳D̲").I(Coral.sponges["Է"],"̴਴̱").I(Coral.sponges["Է"],"̵ਵ̴").I(Coral.sponges["Է"],"̶ਸ਼|").M("׈̶̷̸׉jձk׌r׺l").I(Coral.sponges["Է"],"̹਷~").L("ֆ̹̺̻").I(Coral.sponges["Ը"],"̼ਣ̻").N("̽e̼").L("ֆ̺̾̿").I(Coral.sponges["Ը"],"̀ਤ̿").N("́d̀").e()
};Coral.sponges["ਹ"]=function() {
// Async pre-init element: demos/demo_010
this.c("CE").h("E").k(10,0,0,2).b().B("dਮeਯfזgਰh਱iրjֵkਲlਲ਼").R(Coral.sponges["ਭ"],"cਬ}ers̰")
};Coral.sponges["਺"]=function() {
// Sync init element: ITEM_WRAPPER_demos/demo_010__main/main__content__demo_010
this.Y("rDE").X("sr֐").P("c").e()
};Coral.sponges["਻"]=function() {
// Async pre-init element: ITEM_WRAPPER_demos/demo_010__main/main__content__demo_010
this.c("CF").h("F").k(1,0,0,3).b().R(Coral.sponges["ਹ"],"cਸCsF")
};Coral.sponges["਼"]="text-success";Coral.sponges["਽"]="Data successfully loaded! You waited ";Coral.sponges["ਾ"]=" seconds.";Coral.sponges["ਿ"]=function() {
// Sync init element: _inner_view_scope$11
this.M("֖CEsձc").I(Coral.sponges["Ը"],"t਽s").L("פtuv").N("wDv").I(Coral.sponges["Ը"],"xਾu").e()
};Coral.sponges["ੀ"]=function() {
// Async pre-init element: _inner_view_scope$11
this.c("CE").h("E").k(1,0,0,2).b().B("c਼")
};Coral.sponges["ੁ"]="text-danger";Coral.sponges["ੂ"]="Data failed to fetch! You waited ";Coral.sponges["੃"]=function() {
// Sync init element: _inner_view_scope$12
this.M("֖CEsձc").I(Coral.sponges["Ը"],"tੂs").L("פtuv").N("wDv").I(Coral.sponges["Ը"],"xਾu").e()
};Coral.sponges["੄"]=function() {
// Async pre-init element: _inner_view_scope$12
this.c("CE").h("E").k(1,0,0,2).b().B("cੁ")
};Coral.sponges["੅"]=1;Coral.sponges["੆"]=["error"];Coral.sponges["ੇ"]=function() {
// Sync init element: demos/demo_011.js->    - inline element at elements.timeoutDisplayZone.type
this.I(function (timeElapsed /* from fetchDataFromSomewhere.result */) {
            return timeElapsed / 1000;
          },"rd").X("sc੆").I(function (timeElapsed /* from fetchDataFromSomewhere.error */) {
            return timeElapsed / 1000;
          },"ts").Q("fD").e()
};Coral.sponges["ੈ"]=["result"];Coral.sponges["੉"]=function() {
// Async pre-init element: demos/demo_011.js->    - inline element at elements.timeoutDisplayZone.type
this.c("CD").h("D").k(4,0,2,1).i("<div class=\"spinner-border spinner-border-sm mr-3 d-inline-block\" role=\"status\" style=\"color: #da5aa7\"></div><div class=\"d-inline-block\">Fetching data...please wait</div>","").F(function (/* async */ arbitraryAmountOfTimeInMilliseconds, shouldSucceed) {
            // If an async model returns a Promise, the framework will wait for the Promise to be resolved or rejected.
            return new Promise(function (resolve, reject) {
              setTimeout(function () {
                if (shouldSucceed) resolve(arbitraryAmountOfTimeInMilliseconds);
                else reject(arbitraryAmountOfTimeInMilliseconds);
              }, arbitraryAmountOfTimeInMilliseconds);
            });
          },"c$#").X("dcੈ").G(function anonymous($$condition_0 /* from fetchDataFromSomewhere.result */) {
return $$condition_0?0:1
},"ed").T(Coral.sponges["ੀ"],"feօਿCr੅੄੃Ct")
};Coral.sponges["੊"]=function () {
      return Math.floor(Math.random() * 4000);
    };Coral.sponges["ੋ"]="width: 700; height: 200px;";Coral.sponges["ੌ"]="border rounded p-4";Coral.sponges["੍"]=function (reload) {
      reload({shouldSucceed: true});
    };Coral.sponges["੎"]=function (reload) {
      reload({shouldSucceed: false});
    };Coral.sponges["੏"]="#reload";Coral.sponges["੐"]="#fail";Coral.sponges["ੑ"]="<div class=\"mb-3\"> <button id=\"reload\" type=\"button\" class=\"btn btn-success mr-3\">Reload Data: Simulate Data Fetch Success</button> <button id=\"fail\" type=\"button\" class=\"btn btn-danger\">Reload Data: Simulate Data Fetch Failure</button> </div>";Coral.sponges["੒"]=function (args, arbitraryAmountOfTimeInMilliseconds, shouldSucceed, getRandomNumber) {
      var _shouldSucceed = args[0].shouldSucceed;
      Coral.Observable.inTransaction(function () {
        arbitraryAmountOfTimeInMilliseconds.set(getRandomNumber());
        shouldSucceed.set(_shouldSucceed);
      });
    };Coral.sponges["੓"]="<p>Sometimes things take an unpredictable amount of time.</p>";Coral.sponges["੔"]="<p>Sometimes things succeed.</p>";Coral.sponges["੕"]="<p>Sometimes things fail.</p>";Coral.sponges["੖"]="<div> <strong>Code</strong> <ul> <li><a href=\"https://github.com/lockerdome/coral.js-tutorials/blob/master/demos/app/elements/demos/demo_011.js\" target=\"_blank\">app/elements/demos/demo_011.js</a></li> <li><a href=\"https://github.com/lockerdome/coral.js-tutorials/blob/master/demos/app/views/demos/demo_011.hjs\" target=\"_blank\">app/views/demos/demo_011.hjs</a></li> </ul> </div>";Coral.sponges["੗"]=function() {
// Sync init element: demos/demo_011
this.L("ֆCrs").I(Coral.sponges["Է"],"t֊r").M("ֆtEvձg׆h").I(Coral.sponges["Է"],"wੑv").M("ֆwxyձi").P("e").J(Coral.sponges["੒"],"{©cdf").M("ևs|}ձj").N("~D}").I(Coral.sponges["Է"],"̰੓|").I(Coral.sponges["Է"],"̱੔̰").I(Coral.sponges["Է"],"̲੕̱").I(Coral.sponges["Է"],"̳੖̲").e()
};Coral.sponges["੘"]=function() {
// Async pre-init element: demos/demo_011
this.c("CE").h("E").k(8,0,0,2).b().B("f੊gזhੋiੌjր").G(function (getRandomNumber) {
      return getRandomNumber();
    },"cf").C("dמ").R(Coral.sponges["੉"],"eੇdcyz").g("փ੏੍{੐੎{")
};Coral.sponges["ਖ਼"]=function() {
// Sync init element: ITEM_WRAPPER_demos/demo_011__main/main__content__demo_011
this.Y("rDE").X("sr֐").P("c").e()
};Coral.sponges["ਗ਼"]=function() {
// Async pre-init element: ITEM_WRAPPER_demos/demo_011__main/main__content__demo_011
this.c("CF").h("F").k(1,0,0,3).b().R(Coral.sponges["੘"],"c੗CsF").g("փc")
};Coral.sponges["ਜ਼"]="";Coral.sponges["ੜ"]=function() {
// Sync init element: __passthrough
this.I(Coral.sponges["Ը"],"Dਜ਼C").e()
};Coral.sponges["੝"]=function() {
// Async pre-init element: __passthrough
this.c("CD").h("D").k(0,0,0,1).b()
};Coral.sponges["ਫ਼"]="card mb-2";Coral.sponges["੟"]="width: 18rem;";Coral.sponges["੠"]="card-body";Coral.sponges["੡"]="h5";Coral.sponges["੢"]=function() {
// Sync init element: bootstrap_components/card
this.I(function anonymous(text) {
return text ? 'card-title' : ''
},"r#").M("ֆCFtձg׆h").Q("du").M("ֆuvwձi").M("੡wxyձr").Q("ez").Q("f{").N("|Dy").e()
};Coral.sponges["੣"]=function() {
// Async pre-init element: bootstrap_components/card
this.c("CF").h("F").k(7,0,4,3).b().B("gਫ਼h੟i੠").G(function anonymous(buttonText,buttonLink) {
return buttonText && buttonLink
},"c%&").S(Coral.sponges["մ"],"d$ճtE$੝ੜt").S(Coral.sponges["ո"],"e#շx#੝ੜx").S(Coral.sponges["տ"],"fcվz%&੝ੜz")
};Coral.sponges["੤"]=function() {
// Sync init element: ITEM_WRAPPER_bootstrap_components/card__demos/demo_006__seaCreatureListDisplay__basicEntry
this.Y("rDE").P("c").e()
};Coral.sponges["੥"]=function() {
// Async pre-init element: ITEM_WRAPPER_bootstrap_components/card__demos/demo_006__seaCreatureListDisplay__basicEntry
this.c("CG").h("G").k(1,0,4,4).b().R(Coral.sponges["੣"],"c੢#$%&CrFG")
};Coral.sponges["੦"]="Sea urchin";Coral.sponges["੧"]="Sea urchins use their spines and tube feet to walk around.";Coral.sponges["੨"]="../../assets/images/doodles/sea_urchin.png";Coral.sponges["੩"]="A sea urchin";Coral.sponges["੪"]="Read more about tube feet >>";Coral.sponges["੫"]="https://en.wikipedia.org/wiki/Tube_feet ";Coral.sponges["੬"]="basicEntry";Coral.sponges["੭"]="detailedEntryForSeaUrchin";Coral.sponges["੮"]="<h4>Add a sea creature:</h4>";Coral.sponges["੯"]="<h4>Sea creatures added:</h4>";Coral.sponges["ੰ"]="<p>Add names of sea creatures to make a list of cards! <em> Examples: jellyfish, sea urchin, clam, seahorse, eel, lobster.</em></p>";Coral.sponges["ੱ"]="<p>If you add a <strong>sea urchin</strong>, a more detailed card will display.</p>";Coral.sponges["ੲ"]="<p>Duplicate entries do not get displayed.</p>";Coral.sponges["ੳ"]="<div> <strong>Code</strong> <ul> <li><a href=\"https://github.com/lockerdome/coral.js-tutorials/blob/master/demos/app/elements/demos/demo_006.js\" target=\"_blank\">app/elements/demos/demo_006.js</a></li> <li><a href=\"https://github.com/lockerdome/coral.js-tutorials/blob/master/demos/app/views/demos/demo_006.hjs\" target=\"_blank\">app/views/demos/demo_006.hjs</a></li> </ul> </div>";Coral.sponges["ੴ"]=function() {
// Sync init element: demos/demo_006
this.C("rਜ਼").L("ֆCst").I(Coral.sponges["Է"],"u֊s").M("ֆuEwձm").L("ֆwxy").I(Coral.sponges["Է"],"z੮y").P("d").M("ֆx|}ձm").I(Coral.sponges["Է"],"~੯}").W("e").M("ևṯ̲ձn").N("̳D̲").I(Coral.sponges["Է"],"̴ੰ̱").I(Coral.sponges["Է"],"̵ੱ̴").I(Coral.sponges["Է"],"̶ੲ̵").I(Coral.sponges["Է"],"̷ੳ̶").e()
};Coral.sponges["ੵ"]=["starfish","whale"];Coral.sponges["੶"]=function compare_as_strings(a, b) {
  return (a + '') === (b + '');
};Coral.sponges["੷"]=function (item) { return /sea urchin/i.test(item) ? 'detailedEntryForSeaUrchin' : 'basicEntry'; };Coral.sponges["੸"]=function() {
// Async pre-init element: demos/demo_006
this.c("CE").h("E").k(12,0,0,2).b().B("fਜ਼g੦h੧i੨j੩k੪l੫mցnր").C("cੵ").R(Coral.sponges["׽"],"d׼zrc{").V(Coral.sponges["੷"],"ec~̰੶੷੬੥੤ffff¡c f¢੭੣੢hikl¡gj¢").g("փd")
};Coral.sponges["੹"]=function() {
// Sync init element: ITEM_WRAPPER_demos/demo_006__main/main__content__demo_006
this.Y("rDE").X("sr֐").P("c").e()
};Coral.sponges["੺"]=function() {
// Async pre-init element: ITEM_WRAPPER_demos/demo_006__main/main__content__demo_006
this.c("CF").h("F").k(1,0,0,3).b().R(Coral.sponges["੸"],"cੴCsF").g("փc")
};Coral.sponges["੻"]=function() {
// Sync init element: _inner_view_scope$6
this.Q("dr").Q("eD").e()
};Coral.sponges["੼"]=function() {
// Async pre-init element: _inner_view_scope$6
this.c("CD").h("D").k(3,0,2,1).b().D(function anonymous($$condition_0 /* from $$view_template_expression_4 */) {
return $$condition_0?0:1
},"c#").T(Coral.sponges["֦"],"dcօ֥C੅֩֨C").S(Coral.sponges["ֲ"],"e$ֱr੝ੜr")
};Coral.sponges["੽"]="reset";Coral.sponges["੾"]="btn btn-warning mr-2";Coral.sponges["੿"]="increment";Coral.sponges["઀"]="btn btn-info mr-2";Coral.sponges["ઁ"]="min-width: 300px; min-height: 300px;";Coral.sponges["ં"]=2;Coral.sponges["ઃ"]="https://github.com/lockerdome/coral.js-tutorials/blob/master/demos/app/elements/demos/demo_003.js";Coral.sponges["઄"]="_blank";Coral.sponges["અ"]="https://github.com/lockerdome/coral.js-tutorials/blob/master/demos/app/views/demos/demo_003.hjs";Coral.sponges["આ"]=function (counterValue) {
      counterValue.set(0);
    };Coral.sponges["ઇ"]="button#increment";Coral.sponges["ઈ"]="button#reset";Coral.sponges["ઉ"]="hr";Coral.sponges["ઊ"]="Clicking the \"click to +1\" button increments the counter.";Coral.sponges["ઋ"]="Clicking the \"reset\" button resets the counter to 0.";Coral.sponges["ઌ"]="Different messages are displayed depending on the number of times the +1 button is clicked.";Coral.sponges["ઍ"]="A fish shall display every 3rd click.";Coral.sponges["઎"]="Code";Coral.sponges["એ"]="ul";Coral.sponges["ઐ"]="li";Coral.sponges["ઑ"]="app/elements/demos/demo_003.js";Coral.sponges["઒"]="app/views/demos/demo_003.hjs";Coral.sponges["ઓ"]="click to +1";Coral.sponges["ઔ"]=function() {
// Sync init element: demos/demo_003
this.L("ֆCrs").L("ઉrtu").M("ֆtEwձl").M("քwxy׉m׍nձo").M("քxz{׉m׍pձq").I(Coral.sponges["Ը"],"|֌z").N("}c|").I(Coral.sponges["Ը"],"~֍}").M("ֆ~̰̱׆İձı").Q("k̲").M("ևs̴̳ձĲ").N("̵D̴").L("ն̶̷̳").I(Coral.sponges["Ը"],"̸ઊ̷").L("ն̶̹̺").I(Coral.sponges["Ը"],"̻ઋ̺").L("ն̹̼̽").I(Coral.sponges["Ը"],"̾ઌ̽").L("ն̼̿̀").I(Coral.sponges["Ը"],"́ઍ̀").L("ֆ̿͂̓").L("פ̓̈́ͅ").I(Coral.sponges["Ը"],"͆઎ͅ").L("એ͇͈̈́").L("ઐ͈͉͊").M("ջ͊͋͌ռĳսĴ").I(Coral.sponges["Ը"],"͍ઑ͌").L("ઐ͉͎͏").M("ջ͏͐͑ռĵսĴ").I(Coral.sponges["Ը"],"͒઒͑").I(Coral.sponges["Ը"],"͓੽y").I(Coral.sponges["Ը"],"͔ઓ{").e()
};Coral.sponges["ક"]=function() {
// Async pre-init element: demos/demo_003
this.c("CE").h("E").k(21,0,0,2).b().B("lցmքn੽o੾p੿q઀İઁı֪ĲրĳઃĴ઄ĵઅ").C("cօ").D(function (counterValue) {
      return counterValue === 0;
    },"dc").D(function (counterValue) {
      return counterValue === 1;
    },"ec").D(function (counterValue) {
      return counterValue === 2;
    },"fc").D(function (counterValue) {
      return counterValue % 3 === 0;
    },"gc").D(function anonymous(counterValue) {
return counterValue === 3
},"hc").D(function anonymous(counterValue,isMultipleOfThree) {
return counterValue > 0 && isMultipleOfThree
},"icg").D(function anonymous($$condition_0 /* from hasNotClicked */,$$condition_1 /* from hasClickedOnce */,$$condition_2 /* from hasClickedTwice */) {
return $$condition_0?0:$$condition_1?1:$$condition_2?2:3
},"jdef").T(Coral.sponges["֝"],"kjօ֜̱੅֠֟̱ં֣֢̱ਯ੼੻hi̱").g("փઇւcઈઆc")
};Coral.sponges["ખ"]=function() {
// Sync init element: ITEM_WRAPPER_demos/demo_003__main/main__content__demo_003
this.Y("rDE").X("sr֐").P("c").e()
};Coral.sponges["ગ"]=function() {
// Async pre-init element: ITEM_WRAPPER_demos/demo_003__main/main__content__demo_003
this.c("CF").h("F").k(1,0,0,3).b().R(Coral.sponges["ક"],"cઔCsF").g("փc")
};Coral.sponges["ઘ"]="mt-1";Coral.sponges["ઙ"]="#";Coral.sponges["ચ"]=function() {
// Sync init element: main/sidebar_item
this.H(function (sidebarItemId, selectedSidebarItemId) {
      return sidebarItemId === selectedSidebarItemId;
    },"rDF").H(function (isCurrentlySelected) {
      return 'sidebar-item nav-link text-dark ' + (isCurrentlySelected ? 'font-weight-bolder' : '');
    },"sr").H(function anonymous(isCurrentlySelected) {
return isCurrentlySelected ? 'text-dark': 'text-muted'
},"tr").M("ֆCuvձd").Q("cG").M("ջvxy׍Dձsռe").N("zEy").e()
};Coral.sponges["છ"]=function() {
// Async pre-init element: main/sidebar_item
this.c("CG").h("G").k(3,0,1,4).b().B("dઘeઙ").S(Coral.sponges["׵"],"c#״u#t੝ੜu")
};Coral.sponges["જ"]=["id"];Coral.sponges["ઝ"]=function() {
// Sync init element: ITEM_WRAPPER_main/sidebar_item__main/main__sidebarItems__item
this.X("rcજ").X("sc֐").P("e").e()
};Coral.sponges["ઞ"]=["description"];Coral.sponges["ટ"]=function() {
// Async pre-init element: ITEM_WRAPPER_main/sidebar_item__main/main__sidebarItems__item
this.c("CE").h("E").k(3,0,2,2).b().Y("c#$").X("dcઞ").R(Coral.sponges["છ"],"eચdCrsDE")
};Coral.sponges["ઠ"]=function (value) {
      var _value = parseFloat(value);
      return _value / 255;
    };Coral.sponges["ડ"]=function() {
// Sync init model: rgb_scaled
this.e()
};Coral.sponges["ઢ"]=function() {
// Async pre-init model: rgb_scaled
this.h("&").k(8,1,3,0).b().B("jઠ").D(function (redValue, rgbPartToScaleOf1) {
      return rgbPartToScaleOf1(redValue);
    },"c#j").D(function (greenValue, rgbPartToScaleOf1) {
      return rgbPartToScaleOf1(greenValue);
    },"d$j").D(function (blueValue, rgbPartToScaleOf1) {
      return rgbPartToScaleOf1(blueValue);
    },"e%j").D(function (redValue, greenValue, blueValue) {
      return Math.min(redValue, greenValue, blueValue);
    },"f#$%").D(function (minOfRGB, rgbPartToScaleOf1) {
      return rgbPartToScaleOf1(minOfRGB);
    },"gfj").D(function (redValue, greenValue, blueValue) {
      return Math.max(redValue, greenValue, blueValue);
    },"h#$%").D(function (maxOfRGB, rgbPartToScaleOf1) {
      return rgbPartToScaleOf1(maxOfRGB);
    },"ihj").D(function (redScaledTo1, greenScaledTo1, blueScaledTo1, minOfRGBScaledTo1, maxOfRGBScaledTo1) {
    return {
      red: redScaledTo1,
      green: greenScaledTo1,
      blue: blueScaledTo1,
      min: minOfRGBScaledTo1,
      max: maxOfRGBScaledTo1
    };
  },"&cdegi")
};Coral.sponges["ણ"]=function() {
// Sync init model: rgb_to_cmyk
this.e()
};Coral.sponges["ત"]=function() {
// Async pre-init model: rgb_to_cmyk
this.h("$").k(0,1,1,0).b().D(function (rgbScaled) {
    var min = rgbScaled.min;
    var max = rgbScaled.max;
    var red = rgbScaled.red;
    var green = rgbScaled.green;
    var blue = rgbScaled.blue;
    var k = (1 - max);
    var c = (1 - red - k ) / (1 - k);
    var m = (1 - green - k ) / (1 - k);
    var y = (1 - blue - k ) / (1 - k);
    return {
      cyan: c,
      magenta: m,
      yellow: y,
      black: k
    };
  },"$#")
};Coral.sponges["થ"]=function() {
// Sync init model: demos/demo_005.js->    - inline model at models.rgbToHSL.type
this.e()
};Coral.sponges["દ"]=function() {
// Async pre-init model: demos/demo_005.js->    - inline model at models.rgbToHSL.type
this.h("$").k(3,1,1,0).b().D(function (rgbScaled) {
            return (rgbScaled.min + rgbScaled.max) / 2;
          },"c#").D(function (rgbScaled, luminance) {
            var min = rgbScaled.min;
            var max = rgbScaled.max;
            var noSaturation = min === max;
            if (noSaturation) return 0;
            if (luminance <= 0.5) return (max - min) / (min + max);
            else return (max - min) / (2 - min - max);
          },"d#c").D(function (rgbScaled, saturation) {
            if (saturation === 0) return 0;
            var min = rgbScaled.min;
            var max = rgbScaled.max;
            var red = rgbScaled.red;
            var green = rgbScaled.green;
            var blue = rgbScaled.blue;
            var redIsDominant = max === red;
            var greenIsDominant = max === green;
            var blueIsDominant = max === blue;
            var hue, degrees;
            if (redIsDominant) {
              hue = (green - blue) / (max - min);
            } else if (greenIsDominant) {
              hue = 2 + (blue - red) / (max - min);
            } else if (blueIsDominant) {
              hue = 4 + (red - green) / (max - min);
            }
            degrees = hue * 60;
            if (degrees < 0) degrees = degrees + 360;
            return Math.round(degrees);
          },"e#d").D(function (hue, saturation, luminance) {
          return {
            h: hue,
            s: saturation,
            l: luminance
          };
        },"$edc")
};Coral.sponges["ધ"]=function (value) {
      var _value = parseInt(value);
      var hex = _value.toString(16);
      var needsPadding = hex.length === 1;
      var formatted = needsPadding ? '0' + hex : hex;
      return formatted.toString();
    };Coral.sponges["ન"]=function (value) {
      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Arithmetic_Operators#Unary_plus
      return +(value).toFixed(2);
    };Coral.sponges["઩"]="mt-2 ml-2";Coral.sponges["પ"]="<p>See your colour represented in different formats.</p>";Coral.sponges["ફ"]="<div> <strong>Code</strong> <ul> <li><a href=\"https://github.com/lockerdome/coral.js-tutorials/blob/master/demos/app/elements/demos/demo_005.js\" target=\"_blank\">app/elements/demos/demo_005.js</a></li> <li><a href=\"https://github.com/lockerdome/coral.js-tutorials/blob/master/demos/app/models/rgb_scaled.js\" target=\"_blank\">app/models/rgb_scaled.js</a></li> <li><a href=\"https://github.com/lockerdome/coral.js-tutorials/blob/master/demos/app/models/rgb_to_cmyk.js\" target=\"_blank\">app/models/rgb_to_cmyk.js</a></li> <li><a href=\"https://github.com/lockerdome/coral.js-tutorials/blob/master/demos/app/views/demos/demo_005.hjs\" target=\"_blank\">app/views/demos/demo_005.hjs</a></li> </ul> </div>";Coral.sponges["બ"]="<strong>RGB</strong>";Coral.sponges["ભ"]=" rgb(";Coral.sponges["મ"]="<strong>Hex</strong>";Coral.sponges["ય"]="<strong>HSL</strong>";Coral.sponges["ર"]=" hsl(";Coral.sponges["઱"]=["h"];Coral.sponges["લ"]=["s"];Coral.sponges["ળ"]="%, ";Coral.sponges["઴"]=["l"];Coral.sponges["વ"]="%)";Coral.sponges["શ"]="<strong>CMYK</strong>";Coral.sponges["ષ"]=" cmyk(";Coral.sponges["સ"]=["c"];Coral.sponges["હ"]=["m"];Coral.sponges["઺"]=["y"];Coral.sponges["઻"]=["k"];Coral.sponges["઼"]=function() {
// Sync init element: demos/demo_005
this.H(function (redValue, greenValue, blueValue, rgbPartToHex) {
      var RR = rgbPartToHex(redValue);
      var GG = rgbPartToHex(greenValue);
      var BB = rgbPartToHex(blueValue);
      return '#' + RR + GG + BB;
    },"rcdem").P("f").P("h").H(function (rgbToCMYK) {
      return {
        c: Math.round(rgbToCMYK.cyan * 100),
        m: Math.round(rgbToCMYK.magenta * 100),
        y: Math.round(rgbToCMYK.yellow * 100),
        k: Math.round(rgbToCMYK.black * 100)
      };
    },"si").P("j").H(function (rgbToHSL, roundToTwoDecimalPlaces) {
      return {
        s: roundToTwoDecimalPlaces(rgbToHSL.s * 100),
        l: roundToTwoDecimalPlaces(rgbToHSL.l * 100)
      };
    },"tkn").L("ֆCuv").M("ևvwxձo").N("yDx").I(Coral.sponges["Է"],"zׄw").I(Coral.sponges["Է"],"{પz").I(Coral.sponges["Է"],"|ફ{").I(Coral.sponges["Է"],"}֊u").M("ֆ}Ḛձp").M("ֆ̰̱̲ձq").M("ֆ̴̲̳׆l").I(Coral.sponges["Ը"],"̵̴ׇ").M("׈̵̶̷׉İ׊ı׋Ĳ׌c").M("׈̸̳̹׍ĳ׉Ĵ׊ı׋Ĳ׌cձĵ").M("ֆ̱̺̻ձq").M("ֆ̻̼̽׆l").I(Coral.sponges["Ը"],"̾׎̽").M("׈̾̿̀׉İ׊ı׋Ĳ׌d").M("׈̼́͂׍Ķ׉Ĵ׊ı׋Ĳ׌dձĵ").M("ֆ̺̓̈́ձq").M("ֆ̈́͆ͅ׆l").I(Coral.sponges["Ը"],"͇׏͆").M("׈͇͈͉׉İ׊ı׋Ĳ׌e").M("׈͊͋ͅ׍ķ׉Ĵ׊ı׋Ĳ׌eձĵ").M("ֆ͍̓͌ձĸ").I(Coral.sponges["Է"],"͎બ͍").I(Coral.sponges["Ը"],"͏ભ͎").N("͐c͏").I(Coral.sponges["Ը"],"ֿ͑͐").N("͒d͑").I(Coral.sponges["Ը"],"ֿ͓͒").N("͔e͓").I(Coral.sponges["Ը"],"͕ב͔").M("ֆ͖͌͗ձĹ").I(Coral.sponges["Է"],"͘મ͗").I(Coral.sponges["Ը"],"͙֍͘").N("͚r͙").M("ֆ͖͛͜ձĹ").I(Coral.sponges["Է"],"͝ય͜").I(Coral.sponges["Ը"],"͞ર͝").X("͟k઱").N("͟͠͞").I(Coral.sponges["Ը"],"ֿ͡͠").X("͢tલ").N("ͣ͢͡").I(Coral.sponges["Ը"],"ͤળͣ").X("ͥt઴").N("ͦͥͤ").I(Coral.sponges["Ը"],"ͧવͦ").M("ֆ͛ͨͩձĹ").I(Coral.sponges["Է"],"ͪશͩ").I(Coral.sponges["Ը"],"ͫષͪ").X("ͬsસ").N("ͭͬͫ").I(Coral.sponges["Ը"],"ͮળͭ").X("ͯsહ").N("Ͱͯͮ").I(Coral.sponges["Ը"],"ͱળͰ").X("Ͳs઺").N("ͳͲͱ").I(Coral.sponges["Ը"],"ʹળͳ").X("͵s઻").N("Ͷ͵ʹ").I(Coral.sponges["Ը"],"ͷવͶ").M("ֆͨ͸͹ձq׆ĺcĻdĻeļ").e()
};Coral.sponges["ઽ"]=71;Coral.sponges["ા"]=199;Coral.sponges["િ"]=92;Coral.sponges["ી"]=function() {
// Async pre-init element: demos/demo_005
this.c("CE").h("E").k(28,0,0,2).b().B("lֳmધnનoրpցqִİֵıֶĲַĳָĴֹĵֺĶֻķּĸֽĹ઩ĺ־Ļֿļ׀").C("cઽ").C("dા").C("eિ").R(Coral.sponges["ઢ"],"fડcdeg").R(Coral.sponges["ત"],"hણgi").R(Coral.sponges["દ"],"jથgk")
};Coral.sponges["ુ"]=function() {
// Sync init element: ITEM_WRAPPER_demos/demo_005__main/main__content__demo_005
this.Y("rDE").X("sr֐").P("c").e()
};Coral.sponges["ૂ"]=function() {
// Async pre-init element: ITEM_WRAPPER_demos/demo_005__main/main__content__demo_005
this.c("CF").h("F").k(1,0,0,3).b().R(Coral.sponges["ી"],"c઼CsF")
};Coral.sponges["ૃ"]=[{id:"demo_intro",title:"Demos"},{id:"demo_001",title:"001: Click to Increment",description:"Variables and Events (click handler)."},{id:"demo_002",title:"002: Red or Blue?",description:"Models and inline expressions in the view."},{id:"demo_003",title:"003: Fish",description:"View conditionals {{#if _}}, {{#elseif _}}, {{#else _}}, {{#endif _}} and using inline expressions in them."},{id:"demo_004",title:"004: RGB",description:"Two-way value binding."},{id:"demo_005",title:"005: RGB Converter",description:"Different ways to write Models."},{id:"demo_006",title:"006: Sea Creature List",description:"Elements and Dynamic Element Lists."},{id:"demo_007",title:"007: Outer/Inner",description:"Element and Dynamic Element List nesting, Event listener behaviour, Dynamic Element Lists using \"item\" notation."},{id:"demo_008",title:"008: Multiplication Tables",description:"emitEvent and catching emitEvents."},{id:"demo_009",title:"009: Countdown to zero",description:"The Initialize event handler, .set() true flag."},{id:"demo_010",title:"010: Magic Number",description:"environmentVars."},{id:"demo_011",title:"011: Data Fetch Simulator",description:"Async Models, Zones, Callbacks, /* from */ Parameter annotation"}];Coral.sponges["ૄ"]="root-dom-node";Coral.sponges["ૅ"]="container-fluid";Coral.sponges["૆"]="row flex-xl-nowrap";Coral.sponges["ે"]="sidebar";Coral.sponges["ૈ"]="mt-2 col-12 col-xl-2 border-right";Coral.sponges["ૉ"]="nav flex-column";Coral.sponges["૊"]="ml-4 mt-4 col-12 col-xl-9";Coral.sponges["ો"]="demo_intro";Coral.sponges["ૌ"]="demo_001";Coral.sponges["્"]="demo_002";Coral.sponges["૎"]="demo_003";Coral.sponges["૏"]="demo_004";Coral.sponges["ૐ"]="demo_005";Coral.sponges["૑"]="demo_006";Coral.sponges["૒"]="demo_007";Coral.sponges["૓"]="demo_008";Coral.sponges["૔"]="demo_009";Coral.sponges["૕"]="demo_010";Coral.sponges["૖"]="demo_011";Coral.sponges["૗"]=function (event, selectedSidebarItemId) {
      var elementId = event.target && event.target.id;
      if (elementId) selectedSidebarItemId.set(elementId);
    };Coral.sponges["૘"]=".sidebar-item";Coral.sponges["૙"]="<nav class=\"navbar navbar-light bg-light\">  <container class=\"mx-auto\"> <a class=\"navbar-brand\" href=\"#\"> <img src=\"../../assets/brand/logo_proto.png\" width=\"28\" height=\"28\" class=\"d-inline-block align-top rounded\" alt=\"placeholder logo\"> <span class=\"text-dark font-monospace\">Coral.js Demos</span> </a> </container> </nav>";Coral.sponges["૚"]="nav";Coral.sponges["૛"]="main";Coral.sponges["૜"]="<div class=\"mx-auto mt-2 mb-4\" style=\"width: 300px;\"> <small> visit github: <a href=\"https://github.com/lockerdome/coral.js-tutorials\" target=\"blank\" class=\"color-coral\">coral.js-tutorials</a> &nbsp;|&nbsp; <a href=\"https://github.com/lockerdome/coral.js\" target=\"blank\" class=\"color-coral\">coral.js</a> </small> </div>";Coral.sponges["૝"]=function() {
// Sync init element: main/main
this.M("ֆCDs׍h").I(Coral.sponges["Է"],"t૙s").M("ֆtuvձi").M("ֆvwxձj").M("ֆxyz׍kձl").M("૚z{|ձm").W("e").M("૛y~̰ձn").W("f").I(Coral.sponges["Է"],"̲૜u").d("f").e()
};Coral.sponges["૞"]=function(a,b) {
return ((a&&a.id)+"")===((b&&b.id)+"")
};Coral.sponges["૟"]=function (item) { return item.id; };Coral.sponges["ૠ"]=function() {
// Async pre-init element: main/main
this.c("CD").h("D").k(12,0,0,1).i(undefined,"").B("gૃhૄiૅj૆kેlૈmૉn૊").C("cો").D(function (sidebarItemsList, selectedSidebarItemId) {
      for (var i = 0; i !== sidebarItemsList.length; i++) {
        var sidebarItem = sidebarItemsList[i];
        if (sidebarItem.id === selectedSidebarItemId) return [sidebarItem];
      }
      return [];
    },"dgc").U(Coral.sponges["ટ"],"eઝg|}૞g ¡c¢").V(Coral.sponges["૟"],"fd̰̱૞૟ો׭׬¡d ¢ૌ֑֒¡d ¢્֚֙¡d ¢૎ગખ¡d ¢૏וה¡d ¢ૐૂુ¡d ¢૑੺੹¡d ¢૒؜؛¡d ¢૓ਟਞ¡d ¢૔רק¡d ¢૕਻਺¡d ¢૖ਗ਼ਖ਼¡d ¢").g("փfփ૘૗£c")
};Coral.sponges["coral_start"]=function(placement,parameter_values,settings,coral) {
var inner_placement = document.createTextNode("");placement.appendChild(inner_placement);parameter_values.__placement = inner_placement;return Coral.sponges["Ն"](Coral.sponges["ૠ"],Coral.sponges["૝"],parameter_values,{"__placement":"C"},coral)
};Coral.sponges[""]={};Coral.sponges[""]={};
Coral.Scope.prototype.A = function (packed_args) {
      var scope_context = this;
      var to_symbol = packed_args[0];
      var type = packed_args[1] === '0' ? 'css' : 'javascript';
      var halves = packed_args.slice(2).split("");
      var url = halves[0].replace(/{{(\w+)}}/g, function (match, global_name) {
        return scope_context.coral_instance.settings.deps_template_variables[global_name];
      });

      var dependencies = halves[1].split('').map(function (symbol) { return scope_context.state[symbol]; });

      scope_context['ĳ'](to_symbol, dependencies, function (resolve_callback) {
        Coral.sponges["Մ"](url, url, type, scope_context.coral_instance, function() {
          resolve_callback(true);
        });
      });
      return scope_context;
    };
Coral.Scope.prototype.B = function (packed_args) {
      this['Ŀ'](packed_args, false);
      return this;
    };
Coral.Scope.prototype.C = function (packed_args) {
      this['Ŀ'](packed_args, true);
      return this;
    };
Coral.Scope.prototype.D = function (pure_function, packed_args) {
      var callback = Coral.sponges["ՠ"](pure_function);
      this['ĵ'](callback, packed_args);
      this['ľ'](callback, packed_args);
      return this;
    };
Coral.Scope.prototype.E = function (pure_function, packed_args) {
      var callback = Coral.sponges["բ"](pure_function);
      this['ĵ'](callback, packed_args);
      this['ľ'](callback, packed_args);
      return this;
    };
Coral.Scope.prototype.F = function (pure_function, packed_args) {
      var callback = Coral.sponges["բ"](pure_function);
      this['Ķ'](packed_args[0]);
      this['ľ'](callback, packed_args);
      return this;
    };
Coral.Scope.prototype.G = function (pure_function, packed_args) {
      var callback = Coral.sponges["ՠ"](pure_function);
      this['Ķ'](packed_args[0]);
      this['ľ'](callback, packed_args);
      return this;
    };
Coral.Scope.prototype.H = function (pure_function, packed_args) {
      var callback = Coral.sponges["ՠ"](pure_function);
      this['ĵ'](callback, packed_args);
      this['Ļ'](pure_function, packed_args);
      return this;
    };
Coral.Scope.prototype.I = function (pure_function, packed_args) {
      this['Ķ'](packed_args[0]);
      this['Ļ'](pure_function, packed_args);
      return this;
    };
Coral.Scope.prototype.J = function (callback_handler, packed_args) {
      var scope_context = this;
      var uses_args = packed_args.indexOf('©') !== -1;

      var assign_to_symbol = packed_args[0];
      var invokable_callback = function () {
        var input_symbols = packed_args.slice(1);
        var args = uses_args ? Array.prototype.slice.call(arguments) : undefined;
        return scope_context['ņ'](callback_handler, input_symbols, args);
      };

      scope_context['Ĳ'](assign_to_symbol, invokable_callback);

      return scope_context;
    };
Coral.Scope.prototype.K = function (packed_args) {
      var packed_args_length = packed_args.length;
      var handler_name = packed_args[0];
      var handling = {};
      for (var i = 1; i < packed_args_length; i+=2) {
        handling[Coral.sponges[packed_args[i]]] = packed_args[i+1];
      }
      this.state[handler_name] = handling;
      return this;
    };
Coral.Scope.prototype.L = function (packed_args) {
      var elem = document.createElement(Coral.sponges[packed_args[0]]);
      this['Ŋ'](elem, packed_args.slice(1));
      return this;
    };
Coral.Scope.prototype.M = function (packed_args) {
      var scope_context = this;
      var dom_element = document.createElement(Coral.sponges[packed_args[0]]);
      var attribute_symbol_groups = packed_args.slice(4).split('');
      var assign_to_symbol = packed_args[2];

      for (var i = 0; i < attribute_symbol_groups.length; ++i) {
        var attribute_symbols = attribute_symbol_groups[i];
        var attribute_name = Coral.sponges[attribute_symbols[0]];

        var attribute_value = '';
        var attribute_input_value;
        var attribute_input_symbols = attribute_symbols.slice(1);
        var single_attribute_variable = attribute_input_symbols.length === 1;

        for (var j = 0; j < attribute_input_symbols.length; ++j) {
          var attribute_symbol = attribute_input_symbols[j];

          var symbol_metadata = scope_context['q'](attribute_symbol);
          attribute_input_value = scope_context.state[attribute_symbol];
          var attribute_converted_input_value = Coral.sponges["Գ"](attribute_input_value);
          if (attribute_converted_input_value) {
            attribute_value += attribute_converted_input_value;
          }

          if (attribute_name === 'class') {
            symbol_metadata.add_post_update_handler(
              Coral.sponges["է"](attribute_converted_input_value),
              assign_to_symbol
            );
          } else if (attribute_name === 'style') {
            symbol_metadata.add_post_update_handler(
              Coral.sponges["ը"],
              assign_to_symbol+attribute_input_symbols
            );
          } else if (single_attribute_variable) {
            // Wire up two-way binding, so when the tag value changes, we update the observable automatically.
            if (attribute_name === 'value' && ['INPUT', 'SELECT', 'TEXTAREA'].indexOf(dom_element.nodeName) !== -1) {
              var symbol_observable = this['z'](attribute_symbol);
              if (Coral.Observable.is(symbol_observable)) {
                var input_events;
                if (dom_element.nodeName === "INPUT" && dom_element.getAttribute("type") === "range") {
                  input_events = ['change', 'input'];
                } else {
                  input_events = ['change', 'keyup'];
                }

                Coral.Observable._bindElement(dom_element, symbol_observable, input_events);
              }
            }

            symbol_metadata.add_post_update_handler(
              Coral.sponges["ժ"],
              assign_to_symbol+attribute_symbols[0]
            );
          } else {
            // TODO: Ideally we'd register one post-update handler for all the symbols, that support isn't in the framework yet however.
            symbol_metadata.add_post_update_handler(
              Coral.sponges["թ"],
              assign_to_symbol+attribute_symbols
            );
          }
        }

        if (attribute_name === "style") {
          dom_element.style.cssText = attribute_value;
        } else if (attribute_name === "class" || !single_attribute_variable || attribute_input_value != null) {
          dom_element.setAttribute(attribute_name, attribute_value);
        }
      }

      scope_context['Ŋ'](dom_element, packed_args.slice(1,4));

      return scope_context;
    };
Coral.Scope.prototype.N = function (packed_args) {
      var assign_to_symbol = packed_args[0];
      var text_symbol = packed_args[1];
      var source_placement_symbol = packed_args[2];
      var symbol_metadata = this['q'](text_symbol);

      symbol_metadata.add_post_update_handler(
        Coral.sponges["ի"],
        assign_to_symbol
      );

      var text_value = this.state[text_symbol];
      var source_placement = this.state[source_placement_symbol];

      this.state[assign_to_symbol] = Coral.sponges["Ը"](text_value, source_placement);

      return this;
    };
Coral.Scope.prototype.O = function (packed_args) {
      var assign_to_symbol = packed_args[0];
      var html_string_symbol = packed_args[1];
      var source_placement_symbol = packed_args[2];
      var symbol_metadata = this['q'](html_string_symbol);

      symbol_metadata.add_post_update_handler(
        Coral.sponges["լ"],
        source_placement_symbol+assign_to_symbol
      );
      var html_string_value = this.state[html_string_symbol];
      if (html_string_value === null || html_string_value === undefined) {
        html_string_value = '';
      }

      var source_placement_value = this.state[source_placement_symbol];
      var frag = Coral.sponges["Ժ"](html_string_value);
      var after_injection_placement = Coral.sponges["Ա"]();
      frag.appendChild(after_injection_placement);
      Coral.sponges["Դ"](frag,source_placement_value);
      this.state[assign_to_symbol] = after_injection_placement;

      return this;
    };
Coral.Scope.prototype.P = function (scope_symbol) {
      var scope = this.state[scope_symbol];
      var scope_scratch = scope.state[''];

      if (scope_scratch && scope_scratch.post_update_handler) {
        var symbol_metadata = this['q'](scope_symbol);
        symbol_metadata.add_post_update_handler(scope_scratch.post_update_handler, scope_symbol);
      }

      scope['']();
      return this;
    };
Coral.Scope.prototype.Q = function (packed_args) {
      var scope_symbol = packed_args[0];
      var after_output_symbol = packed_args[1];

      this['P'](scope_symbol);

      var polymorphic_scope = this.state[scope_symbol];
      var internal_after_placement = polymorphic_scope.state[polymorphic_scope.state.end_placement_symbol];
      var safety_belt_text_node = Coral.sponges["Ա"]();
      Coral.sponges["Դ"](safety_belt_text_node, internal_after_placement);

      polymorphic_scope.state[''].safety_belt_text_node = safety_belt_text_node;

      this.state[after_output_symbol] = safety_belt_text_node;
      return this;
    };
Coral.Scope.prototype.R = function (scope_async_pre_init_function, packed_args) {
      var scope_context = this;
      var scope_symbol = packed_args[0];
      var sync_init_symbol = packed_args[1];

      var scope = this['l'](scope_async_pre_init_function, Coral.sponges[sync_init_symbol]);

      var phase_symbol_groups = packed_args.split('');

      var async_input_output_symbols = phase_symbol_groups[0].slice(2);
      scope['t'](async_input_output_symbols, [35,67]);
      var sync_input_output_symbols = phase_symbol_groups[1];
      scope['t'](sync_input_output_symbols, [67,99]);

      scope_context['v'](scope, async_input_output_symbols, [35,67]);
      scope_context['v'](scope, sync_input_output_symbols, [67,99]);

      scope['']();

      scope_context['s'](scope);

      scope_context['Ĳ'](scope_symbol, scope);

      return scope_context;
    };
Coral.Scope.prototype.S = function (truthy_scope_async_pre_init, packed_args) {
      var scope_context = this;

      function compute_scope (resolve_callback, determining_value) {
        var async_pre_init;
        var sync_init;
        var instantiation_args;
        var input_output_symbols;

        var truthy_scope_sync_init = Coral.sponges[truthy_sync_init_symbol];
        var falsy_scope_async_pre_init = Coral.sponges[option_symbol_groups[1][0]];
        var falsy_scope_sync_init = Coral.sponges[option_symbol_groups[1][1]];
        var truthy_option_symbol_group_symbols = option_symbol_groups[0].slice(3);
        var falsy_option_symbol_group_symbols = option_symbol_groups[1].slice(2);

        if (determining_value) {
          input_output_symbols = truthy_option_symbol_group_symbols;
          sync_init = truthy_scope_sync_init;
          async_pre_init = truthy_scope_async_pre_init;
        } else {
          input_output_symbols = falsy_option_symbol_group_symbols;
          sync_init = falsy_scope_sync_init;
          async_pre_init = falsy_scope_async_pre_init;
        }

        var scope = scope_context['l'](async_pre_init, sync_init);

        var phase_symbol_groups = input_output_symbols.split('');

        var async_input_output_symbols = phase_symbol_groups[0];
        var sync_input_output_symbols = phase_symbol_groups[1];

        // TODO: Deduplicate this setup code
        scope.state[''] = {
          is_polymorphic_scope: true,
          determining_value_boolean: !!determining_value,
          truthy_scope_async_pre_init: truthy_scope_async_pre_init,
          truthy_scope_sync_init: truthy_scope_sync_init,
          falsy_scope_async_pre_init: falsy_scope_async_pre_init,
          falsy_scope_sync_init: falsy_scope_sync_init
        };

        scope['t'](async_input_output_symbols, [35,67]);
        scope['t'](sync_input_output_symbols, [67,99]);
        scope_context['v'](scope, async_input_output_symbols, [35,67], null, scope_symbol);
        scope_context['v'](scope, sync_input_output_symbols, [67,99], null, scope_symbol);

        var wait_for_symbols = determining_value_symbol;
        var raw_argument_symbols = scope_symbol + determining_value_symbol + truthy_option_symbol_group_symbols + '' + falsy_option_symbol_group_symbols;

        scope_context['ķ'](
          Coral.sponges["՚"],
          scope_symbol + wait_for_symbols,
          raw_argument_symbols
        );

        scope.state[''].post_update_handler = Coral.sponges["դ"];

        scope['']();

        scope_context['s'](scope);

        resolve_callback(scope);
      }

      var scope_symbol = packed_args[0];
      var determining_value_symbol = packed_args[1];
      var truthy_sync_init_symbol = packed_args[2];

      var option_symbol_groups = packed_args.split('');
      var determining_value = scope_context.state[determining_value_symbol];
      if (determining_value instanceof Coral.Unresolved) {
        scope_context['ĳ'](scope_symbol, [determining_value], compute_scope);
      } else {
        compute_scope(function (scope) {
          scope_context['Ĳ'](scope_symbol, scope);
        }, determining_value);
      }
      return scope_context;
    };
Coral.Scope.prototype.T = function (first_option_async_pre_init, packed_args) {
      var scope_context = this;

      function compute_scope (resolve_callback, determining_value) {
        var scratch_data_cases = {};
        var current_case = null;
        var i;

        for (i = 0; i !== option_symbol_groups.length; ++i) {
          var async_pre_init;
          var sync_init;
          var input_output_symbols;
          var case_symbol;

          var option_symbol_group = option_symbol_groups[i];
          case_symbol = option_symbol_group[i === 0 ? 2 : 0];
          var case_value = Coral.sponges[case_symbol];
          if (determining_value === case_value) {
            current_case = case_symbol;
          }

          if (i === 0) {
            async_pre_init = first_option_async_pre_init;
            sync_init = Coral.sponges[option_symbol_group[3]];
            input_output_symbols = option_symbol_group.slice(4);
          } else {
            async_pre_init = Coral.sponges[option_symbol_group[1]];
            sync_init = Coral.sponges[option_symbol_group[2]];
            input_output_symbols = option_symbol_group.slice(3);
          }

          scratch_data_cases[case_symbol] = {
            async_pre_init: async_pre_init,
            sync_init: sync_init,
            input_output_symbols: input_output_symbols
          };
        }

        var current_case_data = scratch_data_cases[current_case];
        var current_case_input_output_symbols = current_case_data.input_output_symbols;
        var current_case_async_pre_init = current_case_data.async_pre_init;
        var current_case_sync_init = current_case_data.sync_init;

        var scope = scope_context['l'](current_case_async_pre_init, current_case_sync_init);
        var phase_symbol_groups = current_case_input_output_symbols.split('');

        // TODO: Look at reducing duplication with conditional instantiate scope
        var async_input_output_symbols = phase_symbol_groups[0];
        scope['t'](async_input_output_symbols, [35,67]);
        var sync_input_output_symbols = phase_symbol_groups[1];
        scope['t'](sync_input_output_symbols, [67,99]);
        scope_context['v'](scope, async_input_output_symbols, [35,67], null, scope_symbol);
        scope_context['v'](scope, sync_input_output_symbols, [67,99], null, scope_symbol);

        scope.state[''] = {
          is_polymorphic_scope: true,
          current_case: current_case,
          cases: scratch_data_cases
        };

        scope.state[''].post_update_handler = Coral.sponges["դ"];

        scope['']();
        scope_context['s'](scope);

        resolve_callback(scope);
      }

      var scope_symbol = packed_args[0];
      var determining_value_symbol = packed_args[1];

      var option_symbol_groups = packed_args.split('');

      var wait_for_symbols = determining_value_symbol;
      var raw_argument_symbols = scope_symbol+determining_value_symbol;

      scope_context['ķ'](
        Coral.sponges["՛"],
        scope_symbol + wait_for_symbols,
        raw_argument_symbols
      );

      var determining_value = scope_context.state[determining_value_symbol];

      if (determining_value instanceof Coral.Unresolved) {
        scope_context['ĳ'](scope_symbol, [determining_value], compute_scope);
      } else {
        compute_scope(function (scope) {
          scope_context['Ĳ'](scope_symbol, scope);
        }, determining_value);
      }
      return scope_context;
    };
Coral.Scope.prototype.U = function (scope_async_pre_init_function, packed_args) {
      var scope_context = this;

      var scope_array_symbol = packed_args[0];
      var sync_init_symbol = packed_args[1];
      var items_array_symbol = packed_args[2];
      var initial_intermediate_symbol = packed_args[3];
      var final_intermediate_symbol = packed_args[4];
      var identity_comparison_function = Coral.sponges[packed_args[5]];
      var input_output_symbols = packed_args.slice(6);
      var input_output_symbol_groups = input_output_symbols.split('');
      var async_inputs = input_output_symbol_groups[0];
      var sync_input_output_symbols = input_output_symbol_groups[1];
      var sync_init_function = Coral.sponges[sync_init_symbol];

      var wait_for_symbols = items_array_symbol;
      var raw_argument_data = {
        identity_comparison: identity_comparison_function,
        // TODO: Do we need this symbol data? It is available in the scratch.
        symbols: scope_array_symbol + items_array_symbol + initial_intermediate_symbol,
        case_data: {
          async_pre_init: scope_async_pre_init_function,
          sync_init: sync_init_function,
          async_input_symbols: async_inputs,
          sync_input_output_symbols: sync_input_output_symbols
        }
      };

      scope_context['ķ'](Coral.sponges["՜"], scope_array_symbol + wait_for_symbols, raw_argument_data);

      var items = scope_context.state[items_array_symbol];
      if (items instanceof Coral.Unresolved) {
        scope_context['ĳ'](scope_array_symbol, [items], compute_scopes);
      } else {
        compute_scopes(function (scopes) {
          scope_context['Ĳ'](scope_array_symbol, scopes);
        }, items);
      }
      return scope_context;

      function compute_scopes (resolve_callback, resolved_items) {
        var scopes = [];
        var i;
        var j;
        var scope;
        var identity_filtered_items = Coral.identity_deduplicate_array(resolved_items, identity_comparison_function);

        var last_scope;
        for (i = 0; i !== identity_filtered_items.length; ++i) {
          var item = identity_filtered_items[i];

          scope = scope_context['Ł'](
            items_array_symbol,
            resolved_items.indexOf(item),
            scope_async_pre_init_function,
            sync_init_function,
            async_inputs,
            sync_input_output_symbols,
            initial_intermediate_symbol,
            scope_array_symbol,
            last_scope
          );

          scope['']();
          scope_context['s'](scope);
          last_scope = scope;
          scopes.push(scope);
        }

        var scope_array_instance_update_metadata = scope_context[''][scope_array_symbol];
        scope_array_instance_update_metadata.scratch = {
          initial_intermediate_symbol: initial_intermediate_symbol,
          final_intermediate_symbol: final_intermediate_symbol,
          last_scope_array: scopes,
          last_items_array: identity_filtered_items.slice()
        };

        resolve_callback(scopes);
      }
    };
Coral.Scope.prototype.V = function (map_array_function, packed_args) {
      var scope_context = this;

      var scope_array_symbol = packed_args[0];
      var items_symbol = packed_args[1];
      var initial_intermediate_symbol = packed_args[2];
      var final_intermediate_symbol = packed_args[3];
      var identity_comparison_function = Coral.sponges[packed_args[4]];

      var symbol_groups = packed_args.slice(6).split('');

      var map_function = Coral.sponges[packed_args[5]];
      var map_function_symbols = symbol_groups[0];
      var map_function_item_parameter_index = map_function_symbols.indexOf('');

      var case_symbol_groups = symbol_groups.slice(1);
      var i;
      var option_data_by_case = {};
      var last_items_by_case = {};
      var last_indexes_by_case = {};

      for (i = 0; i !== case_symbol_groups.length; ++i) {
        var case_symbol_group = case_symbol_groups[i];
        var case_input_output_symbol_groups = case_symbol_group.slice(3).split('');

        var intermediate_output_index = case_input_output_symbol_groups[1].length - 1;
        var case_value = Coral.sponges[case_symbol_group[0]];
        option_data_by_case[case_value] = {
          async_pre_init: Coral.sponges[case_symbol_group[1]],
          sync_init: Coral.sponges[case_symbol_group[2]],
          async_input_symbols: case_input_output_symbol_groups[0],
          sync_input_output_symbols: case_input_output_symbol_groups[1]
        };
        last_items_by_case[case_value] = [];
        last_indexes_by_case[case_value] = [];
      }

      // NOTE: We don't wait on map inputs to update, we just immediately execute it with the current values for the map inputs when the items array has updated.
      var wait_for_symbols = items_symbol;

      var raw_argument_data = {
        // We can skip all item nested checks on the scopes if none of them are using item nesteds.
        identity_comparison: identity_comparison_function,
        map_function_func: map_function,
        map_function_input_symbols: map_function_symbols,
        data_by_case: option_data_by_case,
        symbols: scope_array_symbol + items_symbol + initial_intermediate_symbol
      };
      scope_context['ķ'](Coral.sponges["՝"], scope_array_symbol + wait_for_symbols, raw_argument_data);

      var items = scope_context.state[items_symbol];
      var unresolved_count = items instanceof Coral.Unresolved ? 1 : 0;
      var dependencies = [items];
      for (i = 0; i !== map_function_symbols.length; ++i) {
        var map_function_value = scope_context.state[map_function_symbols[i]];
        if (map_function_value instanceof Coral.Unresolved) {
          unresolved_count++;
        }
        dependencies.push(map_function_value);
      }

      if (unresolved_count) {
        scope_context['ĳ'](scope_array_symbol, dependencies, compute_scopes);
      } else {
        dependencies.unshift(function (scopes) {
          scope_context['Ĳ'](scope_array_symbol, scopes);
        });
        compute_scopes.apply(null, dependencies);
      }

      return scope_context;

      function compute_scopes (resolve_callback, resolved_items) {
        var scopes = [];
        var map_arguments = Array.prototype.slice.call(arguments, 2);
        var i;
        var j;


        var identity_filtered_items = Coral.identity_deduplicate_array(resolved_items, identity_comparison_function);
        var last_scope;

        for (i = 0; i !== identity_filtered_items.length; ++i) {
          var item = identity_filtered_items[i];

          if (map_function_item_parameter_index !== -1) {
            map_arguments[map_function_item_parameter_index] = item;
          }
          var map_result = map_function.apply(null, map_arguments);
          var option_data = option_data_by_case[map_result];

          if (!option_data) {
            console.error("Dynamic element list got map result that it doesn't support", map_result);
          }
          last_items_by_case[map_result].push(item);
          last_indexes_by_case[map_result].push(i);

          var array_scope = scope_context['Ł'](
            items_symbol,
            resolved_items.indexOf(item),
            option_data.async_pre_init,
            option_data.sync_init,
            option_data.async_input_symbols,
            option_data.sync_input_output_symbols,
            initial_intermediate_symbol,
            scope_array_symbol,
            last_scope
          );
          last_scope = array_scope;
          scopes.push(array_scope);
        }

        for (i = 0; i !== scopes.length; ++i) {
          var scope = scopes[i];
          scope['']();
          scope_context['s'](scope);
        }

        var scope_array_instance_update_metadata = scope_context[''][scope_array_symbol];
        scope_array_instance_update_metadata.scratch = {
          initial_intermediate_symbol: initial_intermediate_symbol,
          final_intermediate_symbol: final_intermediate_symbol,
          last_scope_array: scopes,
          last_items_by_case: last_items_by_case,
          last_indexes_by_case: last_indexes_by_case
        };

        resolve_callback(scopes);
      }
    };
Coral.Scope.prototype.W = function (packed_args) {
      var scope_array_symbol = packed_args[0];
      var scope_array = this.state[scope_array_symbol];
      var instance_symbol_metadata = this['r'](scope_array_symbol);
      var scope_symbol_metadata = this['q'](scope_array_symbol);

      var initial_intermediate_symbol = instance_symbol_metadata.scratch.initial_intermediate_symbol;
      var final_intermediate_symbol = instance_symbol_metadata.scratch.final_intermediate_symbol;

      scope_symbol_metadata.add_post_update_handler(Coral.sponges["զ"], instance_symbol_metadata.scratch);

      this.state[final_intermediate_symbol] = Coral.sponges["Ր"](scope_array, this.state[initial_intermediate_symbol]);

      return this;
    };
Coral.Scope.prototype.X = function (packed_args) {
      var scope_context = this;
      var assign_to_symbol = packed_args[0];
      var source_computable_symbol = packed_args[1];
      var field_path_symbol = packed_args[2];
      var field_path = Coral.sponges[field_path_symbol];

      var set_handler_metadata = { symbol: assign_to_symbol, source_computable_symbol: source_computable_symbol, field_path: field_path };
      scope_context['Ĺ'](Coral.sponges["՗"], assign_to_symbol+source_computable_symbol+field_path_symbol, Coral.sponges["Փ"], set_handler_metadata);
      var scope_symbol_metadata = scope_context['q'](assign_to_symbol);
      scope_symbol_metadata.assign_always_recompute_symbols(source_computable_symbol);

      var source = scope_context.state[source_computable_symbol];
      if (source instanceof Coral.Unresolved) {
        scope_context['ĳ'](assign_to_symbol, [source, field_path], Coral.sponges["՗"]);
      } else {
        scope_context['Ĳ'](assign_to_symbol, Coral.sponges["Պ"](source, field_path));
      }
      return scope_context;
    };
Coral.Scope.prototype.Y = function (packed_args) {
      var scope_context = this;
      var assign_to_symbol = packed_args[0];
      var source_computable_symbol = packed_args[1];
      var dynamic_field_symbol = packed_args[2];

      var set_handler_metadata = { symbol: assign_to_symbol, source_computable_symbol: source_computable_symbol, dynamic_field_symbol: dynamic_field_symbol };
      scope_context['Ĺ'](Coral.sponges["՘"], assign_to_symbol+source_computable_symbol+dynamic_field_symbol, Coral.sponges["Ք"], set_handler_metadata);
      var scope_symbol_metadata = scope_context['q'](assign_to_symbol);
      scope_symbol_metadata.assign_always_recompute_symbols(source_computable_symbol);

      var source = scope_context.state[source_computable_symbol];
      var dynamic_field = scope_context.state[dynamic_field_symbol];
      if (source instanceof Coral.Unresolved || dynamic_field instanceof Coral.Unresolved) {
        scope_context['ĳ'](assign_to_symbol, [source, dynamic_field], Coral.sponges["՘"]);
      } else {
        scope_context['Ĳ'](assign_to_symbol, Coral.sponges["Պ"](source, [dynamic_field]));
      }
      return scope_context;
    };
Coral.Scope.prototype.Z = function (packed_args) {
      var output_placement_symbol = packed_args[0];
      var element_representation_symbol = packed_args[1];
      var element_representation = this.state[element_representation_symbol];
      var begin_placement_symbol = packed_args[2];

      // Assume that usages of this parameter won't mix element and non-element types, if they pass an element or non-element, it will continue to get an element or non-element value on update.
      if (!Array.isArray(element_representation) && !(element_representation !== null && typeof element_representation === 'object' && typeof element_representation[''] === 'function')) {
        return this['O'](output_placement_symbol + element_representation_symbol + begin_placement_symbol);
      }

      // TODO: No closures
      var before_func = function (updated_element_representation, scope, symbols) {
        var begin_placement_symbol = symbols[0];
        var end_placement_symbol = symbols[1];

        if (Array.isArray(updated_element_representation)) {
          if (updated_element_representation.length) {
            var first_scope = updated_element_representation[0];
            var first_scope_scratch_data = first_scope.state[''];
            var first_scope_is_new = first_scope_scratch_data.previous_intermediate_output_symbol === 'ª';
            if (first_scope_is_new) {
              first_scope_scratch_data.previous_scope = scope;
              first_scope_scratch_data.previous_intermediate_output_symbol = begin_placement_symbol;
            }
          }
        } else {
          updated_element_representation['ŀ'](updated_element_representation.state.begin_placement_symbol, scope, begin_placement_symbol);
        }
      };

      var after_func = function (updated_element_representation, scope, symbols) {
        var begin_placement_symbol = symbols[0];
        var output_placement_symbol = symbols[1];
        var output_placement;

        if (Array.isArray(updated_element_representation)) {
          if (updated_element_representation.length) {
            var last_scope = updated_element_representation[updated_element_representation.length - 1];
            var last_scope_scratch_data = last_scope.state[''];
            output_placement = last_scope.state[last_scope_scratch_data.sync_intermediate_output_symbol];
          } else {
            output_placement = scope.state[begin_placement_symbol];
          }
        } else {
          output_placement = updated_element_representation.state[updated_element_representation.state.end_placement_symbol];
        }

        scope.state[output_placement_symbol] = output_placement;
      };

      // A string that will be passed to the post-update handler after the updated value.
      var metadata = begin_placement_symbol + output_placement_symbol;
      var scope_symbol_metadata = this['q'](element_representation_symbol);
      scope_symbol_metadata.add_post_update_handler(before_func, metadata);

      if (Array.isArray(element_representation)) {
        var traverse_callback = function (scope, symbol, scope_symbol_metadata, instance_symbol_metadata) {
          return instance_symbol_metadata.scratch;
        };
        var scope_array_scratch_data = this['ĺ'](element_representation_symbol, null, traverse_callback);

        scope_array_scratch_data.initial_intermediate_symbol = begin_placement_symbol;
        scope_array_scratch_data.final_intermediate_symbol = output_placement_symbol;
        scope_array_scratch_data.last_scope_array = element_representation;

        scope_symbol_metadata.add_post_update_handler(Coral.sponges["զ"], scope_array_scratch_data);
      } else {
        var post_update_func = element_representation.state[''] && element_representation.state[''].post_update_handler;
        if (post_update_func) {
          scope_symbol_metadata.add_post_update_handler(post_update_func, element_representation_symbol+metadata);
        }
      }

      scope_symbol_metadata.add_post_update_handler(after_func, metadata);

      var begin_placement = this.state[begin_placement_symbol];

      if (Array.isArray(element_representation)) {
        if (element_representation.length) {
          var first_scope = element_representation[0];

          // TODO: helper for not exposing these low level details.
          var first_scope_scratch_data = first_scope.state[''];
          first_scope_scratch_data.previous_scope = this;
          first_scope_scratch_data.previous_intermediate_output_symbol = begin_placement_symbol;
        }

        this.state[output_placement_symbol] = Coral.sponges["Ր"](element_representation, begin_placement);
      } else {
        element_representation['ŀ'](element_representation.state.begin_placement_symbol, this, begin_placement_symbol);
        element_representation['']();
        var output_placement = element_representation.state[element_representation.state.end_placement_symbol];

        if (element_representation.state[''] && element_representation.state[''].is_polymorphic_scope) {
          var safety_belt_text_node = Coral.sponges["Ա"]();
          Coral.sponges["Դ"](safety_belt_text_node, output_placement);
          output_placement = safety_belt_text_node;
          element_representation.state[''].safety_belt_text_node = safety_belt_text_node;
        }

        this.state[output_placement_symbol] = output_placement;
      }

      return this;
    };
Coral.Scope.prototype.a = function (shard_name, packed_args, implied_deps) {
      var scope_context = this;
      var compute_func_symbol = packed_args[0];
      var sync_init_func_symbol = packed_args[1];

      var async_init_unresolved = scope_context[""];
      var load_shard_unresolved;

      if (async_init_unresolved instanceof Coral.Unresolved) {
        load_shard_unresolved = new Coral.Unresolved(1, [], function (resolve_callback) { resolve_callback(); }, function () {});
        async_init_unresolved.unresolved_count++;
        async_init_unresolved.dependencies.push(load_shard_unresolved);
        load_shard_unresolved.add_dependee(async_init_unresolved);
      } else {
        load_shard_unresolved = new Coral.Unresolved(1, [], function (resolve_callback) {
          resolve_callback();
        }, function () {
          scope_context[''] = null;
          scope_context[''] = true;
        });
        scope_context[""] = load_shard_unresolved;
      }

      function shard_name_to_url (name) {
        var base_url = scope_context.coral_instance.settings.shards.shard_base_url;
        if (!/\/$/.test(base_url)) {
          base_url += '/';
        }

        var shard_file_template = scope_context.coral_instance.settings.shards.shard_file_template || '{{shard_name}}.js';
        return base_url + shard_file_template.replace(/{{(\w+)}}/g, function (match, template_variable) {
          if (template_variable === 'shard_name') {
            return name;
          }
          return scope_context.coral_instance.settings.shards.shard_template_variables[template_variable];
        });
      }
      function template (string) {
      }
      if (implied_deps) {
        implied_deps = implied_deps.map(shard_name_to_url);
      }
      var script_url = shard_name_to_url(shard_name);
      Coral.sponges["Մ"](script_url, script_url, 'shard_javascript', scope_context.coral_instance, function () {
        if (scope_context['']) {
          scope_context.state._sync_init = Coral.sponges[sync_init_func_symbol];
        } else {
          scope_context[""] = Coral.sponges[sync_init_func_symbol];
        }

        // TODO: Consider assigning sync init function in the async pre-init function.
        Coral.sponges[compute_func_symbol].call(scope_context);

        load_shard_unresolved.dependency_resolved();
      }, implied_deps);

      return scope_context;
    };
Coral.Scope.prototype.b = function () {
      if (!this['']) {
        this[''] = this.state[''][''];
      }
      return this;
    };
Coral.Scope.prototype.c = function (internal_begin_and_end_placement_symbols) {
      var has_already_been_called = this.state.begin_placement_symbol;
      if (has_already_been_called) return this;
      this.state.begin_placement_symbol = internal_begin_and_end_placement_symbols[0];
      this.state.end_placement_symbol = internal_begin_and_end_placement_symbols[1];
      return this;
    };
Coral.Scope.prototype.d = function (instructions) {
      this.state[''] = instructions;
      return this;
    };
Coral.Scope.prototype.e = function () {
      this[''] = true;
      var pending_emits = this.state._pending_emits;
      if (pending_emits) {
        for (var i = 0; i !== pending_emits.length; ++i) {
          pending_emits[i]();
        }
      }

      var init_pending_updates = this.state._init_pending_updates;
      if (init_pending_updates) {
        this[''].add_updates(init_pending_updates);
        this.state._init_pending_updates = undefined;
      }
      return this;
    };
Coral.Scope.prototype.f = function (packed_args) {
      // NOTE: Both symbols may already have proxies defined on them, so we do a transfer here.
      for (var i = 1; i < packed_args.length; i += 2) {
        var to_symbol = packed_args[i - 1];
        var from_symbol = packed_args[i];
        var from_value = this.state[from_symbol];

        // TODO: Have compound nested outputs assign directly to output symbols.
        var scope_symbol_metadata = this['q'](from_symbol);
        scope_symbol_metadata.add_post_update_handler(Coral.sponges["խ"], to_symbol);

        if (from_value instanceof Coral.Unresolved) {
          this['ĳ'](to_symbol, [from_value], Coral.sponges["ՙ"]);
        } else {
          this['Ĳ'](to_symbol, from_value);
        }
      }
      return this;
    };
Coral.Scope.prototype.g = function (event_instruction_symbols) {
      /**
       * string -> { dispatch_to_children_symbols: string, own_event_handler_symbols: Array.<string> }
       */
      var scope_context = this;
      var event_instructions = {};
      var event_instruction_sections = event_instruction_symbols.split('');
      var i;
      var event_type_group;
      var event_type_symbol;
      var event_type;
      var dispatch_to_children_instructions = event_instruction_sections[0];
      if (dispatch_to_children_instructions.length) {
        var dispatch_to_children_event_type_groups = dispatch_to_children_instructions.split('');
        for (i = 0; i !== dispatch_to_children_event_type_groups.length; ++i) {
          event_type_group = dispatch_to_children_event_type_groups[i];
          event_type_symbol = event_type_group[0];
          event_type = Coral.sponges[event_type_symbol];

          event_instructions[event_type] = {
            own_event_handler_symbol_groups: [],
            dispatch_to_children_symbols: event_type_group.slice(1)
          };
        }
      }

      var own_event_handler_instructions = event_instruction_sections[1];
      if (own_event_handler_instructions.length) {
        var event_type_groups = own_event_handler_instructions.split('');

        for (i = 0; i !== event_type_groups.length; ++i) {
          event_type_group = event_type_groups[i];
          event_type_symbol = event_type_group[0];
          event_type = Coral.sponges[event_type_symbol];

          var own_event_handler_symbol_groups = event_type_group.slice(1).split('');

          var event_type_instructions = event_instructions[event_type];
          if (event_type_instructions) {
            event_type_instructions.own_event_handler_symbol_groups = own_event_handler_symbol_groups;
          } else {
            event_instructions[event_type] = {
              own_event_handler_symbol_groups: own_event_handler_symbol_groups,
              dispatch_to_children_symbols: []
            };
          }
        }
      }

      scope_context.state[''] = event_instructions;

      // TODO: Move the below code out into its own thing that the scope compilation context decides whether to include or not.
      // TODO: Save off event_type_dispatching_function for cleanup later (removeEventListener)
      var is_root_scope = !scope_context.state[''];
      var is_overlay = scope_context.state.overlay;
      var source = scope_context.coral_instance.settings.root_container_node;

      if (is_root_scope || is_overlay) {
        for (var event_instruction_type in event_instructions) {
          /*jshint loopfunc:true*/
          var event_wiring = event_instructions[event_instruction_type];
          var dispatch_to_children_symbols = event_wiring.dispatch_to_children_symbols;
          var own_event_handler_symbols = event_wiring.own_event_handler_symbol_groups;

          if (event_instruction_type === 'keydown') {
            source.addEventListener('keydown', (function () {
              var event_type_dispatching_function = scope_context['ŉ'](dispatch_to_children_symbols, own_event_handler_symbols, event_instruction_type);
              var key_validation = window.Coral.helpers.key_validation;

              return function (e) {
                var key = e.key;
                var event_target = e.target;
                if ((event_target.isContentEditable || event_target.tagName === 'TEXTAREA') && !key_validation.validate_content_editable_key(key)) return;
                else if (event_target.tagName === 'INPUT' && !key_validation.validate_line_input_key(key)) return;
                else if (!key_validation.validate_general_key(key)) return;

                event_type_dispatching_function(e);
                window.Coral.helpers.key_shortcut_manager.execute_matches();
              };
            })());
          } else {
            // Certain events don't bubble, so we capture instead.
            // * We want to use bubbling when possible because of the possibility of third party javascript on the page that might call event.preventDefault or event.stopPropagation.  We don't want to bypass the third party javascript's handling of events.
            var use_capture = /focus|blur/.test(event_instruction_type);
            var event_type_dispatching_function = scope_context['ŉ'](dispatch_to_children_symbols, own_event_handler_symbols, event_instruction_type);
            source.addEventListener(event_instruction_type, event_type_dispatching_function, use_capture);
          }
        }
      }
      return scope_context;
    };
Coral.Scope.prototype.h = function (output_symbols) {
     for (var i = 0; i < output_symbols.length; ++i) {
        this['q'](output_symbols[i]).is_scope_output = true;
      }
      return this;
    };
Coral.Scope.prototype.i = function (preload, packed_args) {
      var scope_context = this;
      // Store off the original sync init and replace with a special helper.
      var existing_zone = scope_context[''];
      var is_reinitializing = !!existing_zone;
      var zone;

      if (is_reinitializing) {
        zone = existing_zone;
      } else {
        scope_context.state._preload = preload;

        var sync_start_index = -1;
        for (var i = 0; i < packed_args.length; ++i) {
          var parameter_flag = packed_args[i];
          if (parameter_flag === '') {
            sync_start_index = i + 1;
          } else {
            var is_variant = parameter_flag === '';
            if (is_variant) {
              continue;
            }

            var character_range;
            var character_range_index;
            if (sync_start_index === -1) {
              character_range = [35,67];
              character_range_index = i;
            } else {
              character_range = [67,99];
              character_range_index = i - sync_start_index;
            }

            var parameter_character = Coral.sponges["Ծ"](character_range, character_range_index);
            var symbol_metadata = scope_context['q'](parameter_character);
            symbol_metadata.is_invariant = true;
          }
        }

        zone = new Coral.Zone(scope_context);
        scope_context[''] = zone;
        scope_context[''] = true;
        scope_context.state._sync_init = scope_context[''];
        scope_context[''] = Coral.sponges["Չ"];
      }

      var parent_scope = scope_context.state[''];
      var is_root_zone = !parent_scope;
      // We want the zone to abide by the schedule of the scope controlling it, since child zones are not waited on to fully async initialize before the containing zone is async initialized, it will properly display a preload if it has not finished async initializing before the zone containing it is async initialized and wants its child zones to sync initialize.
      // * It will then on its own sync initialize itself when it has finished async initializing, removing the preload before it sync initializes itself.
      if (!is_root_zone) {
        return scope_context;
      }

      var parent_scope_zone = parent_scope && parent_scope[''];

      var async_init_unresolved = scope_context[''];
      var is_zone_entry_point_async_resolved = scope_context[''];
      var is_ancestor_zone_ready = !parent_scope_zone || !parent_scope_zone.is_initializing();

      var is_parent_scope_async_initialized = !parent_scope || parent_scope[''] === true;

      if (is_zone_entry_point_async_resolved && is_ancestor_zone_ready) {
        // Skip preload, there is nothing we need to wait on to display ourselves immediately.
        scope_context.state._sync_init.bind(scope_context)();
        zone.enter_ready_state();
      } else if (is_parent_scope_async_initialized && is_ancestor_zone_ready && !is_zone_entry_point_async_resolved) {

        if (preload) {
          var preload_fragment = Coral.sponges["Ժ"](preload);
          var preload_end_marker = Coral.sponges["Ա"]();
          preload_fragment.appendChild(preload_end_marker);
          Coral.sponges["Դ"](preload_fragment, scope_context.state[scope_context.state.begin_placement_symbol]);
          scope_context.state[scope_context.state.end_placement_symbol] = preload_end_marker;
        }

        var wait_till_resolved = new Coral.Unresolved(1,[async_init_unresolved],function(r){r();},function () {
          var begin_placement = scope_context.state[scope_context.state.begin_placement_symbol];
          var end_placement = scope_context.state[scope_context.state.end_placement_symbol];

          // If the begin placement is no longer inserted, an ancestor zone has likely re-initialized itself, so we no longer want to attempt to render.  The ancestor zone will create a new zone if needed, so we do not need to do anything further here.
          if (begin_placement && !begin_placement.parentNode) {
            return;
          }

          if (begin_placement && end_placement) {
            Coral.sponges["Լ"](begin_placement, end_placement, true);
          }

          scope_context.state._sync_init.bind(scope_context)();
          zone.enter_ready_state();
        });

        async_init_unresolved.add_dependee(wait_till_resolved);
      }
      return scope_context;
    };
Coral.Scope.prototype.j = function (scope_data_symbol) {
      this.state.__scope_data_symbol = scope_data_symbol;
      return this;
    };
Coral.Scope.prototype.k = function (async_internal_count, async_output_count, async_input_count, sync_input_count) {
      var scope_context = this;
      var u = [];
      var i;

      var async_output_index_offset = async_input_count;
      var symbol;
      var placeholder_unresolved;

      var parent_scope = scope_context.state[''];

      // Only run the sync symbol check if this is during an update cycle and this scope was created by something created in a previous update cycle or during initialization.  This is so we can make sure certain special parameter wirings can be safely accessed without risk of blowing up anything and to reduce the need to check a bunch of symbols unnecessarily.
      var created_by_previously_created_scope_during_update_cycle = parent_scope && parent_scope[''] === true;
      if (created_by_previously_created_scope_during_update_cycle) {
        for (i = 0; i !== sync_input_count; ++i) {
          symbol = Coral.sponges["Ծ"]([67,99], i);

          var sync_input_possible_unresolved = scope_context.state[symbol];

          if (sync_input_possible_unresolved instanceof Coral.Unresolved) {
            u.push(sync_input_possible_unresolved);
          }
        }

        scope_context[''] = false;
        scope_context[''] = false;
      }

      for (i = 0; i !== async_internal_count; ++i) {
        symbol = Coral.sponges["Ծ"]([99,114,304,816], i);
        placeholder_unresolved = scope_context['Ĵ'](symbol);
        if (placeholder_unresolved instanceof Coral.Unresolved) {
          u.push(placeholder_unresolved);
        }
      }

      for (i = 0; i !== async_input_count; ++i) {
        symbol = Coral.sponges["Ծ"]([35,67], i);
        var current_symbol_value = scope_context.state[symbol];
        if (current_symbol_value instanceof Coral.Unresolved) {
          u.push(current_symbol_value);
        }
      }

      // TODO: This is entirely covered by listening on internal async symbols.  This makes no real sense and likely only coincidentally didn't do something bad before I start exporting async symbols directly.
      for (i = 0; i !== async_output_count; ++i) {
        symbol = Coral.sponges["Ծ"]([35,67], async_output_index_offset + i);
        placeholder_unresolved = scope_context['Ĵ'](symbol);
        if (placeholder_unresolved instanceof Coral.Unresolved) {
          u.push(placeholder_unresolved);
        }
      }

      if (u.length) {
        var async_init_status_unresolved = new Coral.Unresolved(u.length,u,Coral.sponges["ՙ"],function(){scope_context['']=null;scope_context['']=true;});

        for (i = 0; i !== u.length; ++i) {
          u[i].add_dependee(async_init_status_unresolved);
        }

        scope_context[''] = async_init_status_unresolved;
      } else {
        scope_context[''] = true;
      }
      return scope_context;
    };
Coral.Scope.prototype.l = function (scope_async_pre_init_function, sync_init_function) {
      return new Coral.Scope(this, scope_async_pre_init_function, sync_init_function, this.coral_instance);
    };
Coral.Scope.prototype.m = function recursive_destroy_scope_cascade() {
      this[''] = true;

      // TODO: Make sure Unresolveds are cleaned up on zone re-initialization
      // TODO: Think about case where scope is destroyed through Observable.set and has things in it async initializing
      if (this instanceof Coral.Unresolved) {
        return;
      }

      var cleanup_instructions = this.state[''];
      if (!cleanup_instructions) return;

      var i = 0;
      while (i !== cleanup_instructions.length) {
        var instruction = cleanup_instructions[i];
        switch (instruction) {
          case '': {
            var begin_placement = this.state[this.state.begin_placement_symbol];
            var end_placement = this.state[this.state.end_placement_symbol];
            if (begin_placement && begin_placement.parentNode && end_placement) {
              Coral.sponges["Լ"](begin_placement, end_placement, true);
              begin_placement.parentNode.removeChild(begin_placement);
            }
            var parent_scope = this.state[''];
            var focus_element = parent_scope.state[parent_scope.state.begin_placement_symbol];
            // If we have a text node, get next element sibling
            if (focus_element.nodeType === 3) {
              focus_element = focus_element.nextElementSibling;
            }
            if (focus_element) {
              focus_element.tabIndex = -1;
              focus_element.style.outline = 'none';
              focus_element.focus();
            }
            ++i;
            break;
          }

          case '': {
            var subscribed = this.state[''];
            if (subscribed) {
              var obs;
              while (subscribed.length) {
                obs = subscribed.pop();
                obs.scope_context = null;
                obs.removeListener('_set', Coral.sponges["Օ"]);
              }
            }
            ++i;
            break;
          }

          case '': {
            var event_listeners = this.state[''];
            if (event_listeners) {
              while (event_listeners.length) {
                var observable_and_event = event_listeners.pop();
                var observable = observable_and_event.observable;
                var event_info = observable_and_event.event_info;
                observable.removeListener(event_info.event_name, event_info.listener);
              }
            }
            ++i;
            break;
          }

          default: {
            var cascade_destroy_to = this.state[instruction];
            if (cascade_destroy_to instanceof Coral.Unresolved) {
              cascade_destroy_to = cascade_destroy_to.value;
            }

            if (Array.isArray(cascade_destroy_to)) {
              for (var j = 0; j !== cascade_destroy_to.length; ++j) {
                var cascade_to_array_scope = cascade_destroy_to[j];
                recursive_destroy_scope_cascade.call(cascade_to_array_scope);
              }
            } else {
              recursive_destroy_scope_cascade.call(cascade_destroy_to);
            }

            ++i;
          }
        }
      }
    };
Coral.Scope.prototype.n = function recursive_is_destroyed() {
      // TODO: If we remove volatile update handlers on destroy, then the handling in here shouldn't need to scan upward since there shouldn't be anything inserting updates to things other than the parameters for the destroyed scope and its descendants.

      if (this['']) {
        return true;
      }

      var parent_scope = this.state[''];
      if (!parent_scope) {
        return false;
      }

      return recursive_is_destroyed.call(parent_scope);
    };
Coral.Scope.prototype.o = function (bucket_name) {
      var scratch = this[''];
      if (!scratch) {
        scratch = {};
        this[''] = scratch;
      }
      if (!scratch[bucket_name]) {
        scratch[bucket_name] = {};
      }
      return scratch[bucket_name];
    };
Coral.Scope.prototype.p = function (symbol) {
      return this.state[symbol];
    };
Coral.Scope.prototype.q = function (symbol) {
      var scope_metadata = this[''];
      if (!scope_metadata[symbol]) scope_metadata[symbol] = new Coral.ScopeSymbolMetadata();
      return scope_metadata[symbol];
    };
Coral.Scope.prototype.r = function (symbol) {
      var instance_metadata = this[''];
      if (!instance_metadata[symbol]) instance_metadata[symbol] = new Coral.InstanceSymbolMetadata(this);
      return instance_metadata[symbol];
    };
Coral.Scope.prototype.s = function (scope) {
      var child_async_init_unresolved = scope[''];
      if (!scope[''] && child_async_init_unresolved instanceof Coral.Unresolved) {
        var parent_async_init_unresolved = this[''];
        parent_async_init_unresolved.unresolved_count++;
        parent_async_init_unresolved.dependencies.push(child_async_init_unresolved);
        child_async_init_unresolved.add_dependee(parent_async_init_unresolved);
      }
    };
Coral.Scope.prototype.t = function (packed_args, range) {
      // TODO: alternatives to creating functions here?  Seems like I'm going to have to create two functions per, which is not great.
      for (var i = 0; i !== packed_args.length; ++i) {
        var current_parent_symbol = packed_args[i];
        if (current_parent_symbol === 'ª' || current_parent_symbol === '') {
          continue;
        }
        this['u'](Coral.sponges["Ծ"](range, i), current_parent_symbol);
      }
    };
Coral.Scope.prototype.u = function (symbol, parent_symbol) {
      Object.defineProperty(this.state, symbol, {
        enumerable: true,
        get: function () {
          return this[""].state[parent_symbol];
        },
        set: function (v) {
          this[""].state[parent_symbol] = v;
        }
      });
    };
Coral.Scope.prototype.v = function (scope, input_output_symbols, range, scopes_array_symbol, determining_value_symbol) {
      var _this = this;

      // TODO: Do this cleaner
      // TODO: Only do this for zone entry scopes for now.
      scope.state['_io_'+range[0]] = input_output_symbols;

      var border_symbol_index = -1;

      for (var i = 0; i !== input_output_symbols.length; ++i) {
        border_symbol_index++;
        var input_output_symbol = input_output_symbols[i];

        // Skip special reserved characters.
        switch (input_output_symbol) {
        case '¡':
        case '¢':
        case '':
        case 'ª':
          continue;
        }

        var indexed_border_char_code = Coral.sponges["Ծ"](range, border_symbol_index);

        var scope_symbol_scope_metadata = scope['q'](indexed_border_char_code);
        var scope_symbol_instance_metadata = scope['r'](indexed_border_char_code);

        /* TODO: This isn't always true or necessary, but simplifies things for
                 now. If I had the forwarding symbol encoded in such a way to
                 denotate that it is updatable, then this could be easily
                 determined, but unfortunately that is not so at the moment. */
        scope_symbol_scope_metadata.is_registered_for_update_cycle = true;
        scope_symbol_scope_metadata.is_scope_parameter = true;

        if (scopes_array_symbol && input_output_symbol === ' ') {
          scope.state[''].symbols_needing_recording.push(indexed_border_char_code);
          scope_symbol_scope_metadata.is_recording_value_necessary = true;
          scope_symbol_instance_metadata.assign_set_handler(
            Coral.sponges["Վ"],
            { forward_to_scope: this, forward_to_array_symbol: scopes_array_symbol }
          );

          var scopes_array_symbol_instance_metadata = _this['r'](scopes_array_symbol);
          scopes_array_symbol_instance_metadata.is_scope_input_output = true;
          scopes_array_symbol_instance_metadata.add_forward_rule(
            scope,
            indexed_border_char_code,
            determining_value_symbol,
            Coral.sponges["Ս"]
          );
        } else {
          var io_symbol_scope_metadata = this['q'](input_output_symbol);
          var io_symbol_instance_metadata = this['r'](input_output_symbol);
          io_symbol_scope_metadata.is_scope_input_output = true;
          io_symbol_instance_metadata.add_forward_rule(
            scope,
            indexed_border_char_code,
            determining_value_symbol
          );
          scope_symbol_instance_metadata.add_forward_rule(this, input_output_symbol);
        }
      }
    };
Coral.Scope.prototype.w = function (removed_scopes, input_output_symbols) {
      var instance_metadata = this[''];

      for (var i = 0; i !== input_output_symbols.length; ++i) {
        // TODO: Skip symbol if it is one of the special characters
        var symbol = input_output_symbols[i];
        var instance_symbol_metadata = instance_metadata[symbol];
        if (instance_symbol_metadata) {
          instance_symbol_metadata.remove_forward_to_scopes(removed_scopes);
        }
      }
    };
Coral.Scope.prototype.x = function (symbol) {
      var scope_instance_update_metadata = this[''];
      var symbol_instance_update_metadata = scope_instance_update_metadata[symbol];
      return symbol_instance_update_metadata && symbol_instance_update_metadata.observable;
    };
Coral.Scope.prototype.y = function (symbol, observable) {
      var scope_instance_update_metadata = this[''];
      var symbol_instance_update_metadata = scope_instance_update_metadata[symbol];
      symbol_instance_update_metadata.observable = observable;
    };
Coral.Scope.prototype.z = function (symbol, options) {
      return this['ĺ'](symbol, null, traverse_callback);

      function traverse_callback (scope, symbol, metadata, instance_metadata) {
        if (options && options.use_unpacked) {
          return scope.state[symbol];
        }

        if (instance_metadata && instance_metadata.observable) {
          return instance_metadata.observable;
        }

        if (!metadata || !instance_metadata || !metadata.is_registered_for_update_cycle) {
          return scope.state[symbol];
        } else {
          var observable = new Coral.Observable(scope.state[symbol]);
          observable.on('_set', Coral.sponges["Ո"]);
          observable.symbol = symbol;
          observable.scope_context = scope;

          scope['y'](symbol, observable);
          return observable;
        }

      }
    };
Coral.Scope.prototype.İ = function (scope_instance_symbol) {
      var already_created_symbol_observable = this['x'](scope_instance_symbol);
      if (already_created_symbol_observable) {
        return already_created_symbol_observable;
      }

      var scope_instance = this.state[scope_instance_symbol];
      // TODO: ScopeInstance should not be Unresolved at this point, but it has
      //       happened. Look into the root cause, so we can omit this check.
      if (scope_instance instanceof Coral.Unresolved) scope_instance = scope_instance.value;

      if (Array.isArray(scope_instance)) {
        var dome_element_collection = new Coral.DomeElementCollection(this, scope_instance_symbol);
        this['y'](scope_instance_symbol, dome_element_collection);
        return dome_element_collection;
      } else if (scope_instance && scope_instance.state['']) {
        // TODO: Checking for scratch data to use this versus simple DomeElement isn't necessarily a perfect assumption.  I will likely start storing that data differently one data.  What is really need to start doing is start using different constructor functions so I can easily identify between these different types.
        var conditional_dome_element = new Coral.DomeConditionalElement(this, scope_instance_symbol);
        this['y'](scope_instance_symbol, conditional_dome_element);
        return conditional_dome_element;
      } else {
        return new Coral.DomeElement(scope_instance);
      }
    };
Coral.Scope.prototype.ı = function () {
      // TODO: This is too much of a hackjob
      var async_symbol = this.state['_io_'+[35,67][0]];
      var sync_symbol = this.state['_io_'+[67,99][0]];
      return async_symbol + sync_symbol;
    };
Coral.Scope.prototype.Ĳ = function (to_symbol, value) {
      if (this[''] === true) {
        this.state[to_symbol] = value;
        return;
      }

      var placeholder_unresolved = this.state[to_symbol];

      // TODO: do this in a prettier way
      placeholder_unresolved.unresolved_count = 1;
      placeholder_unresolved.dependencies = [value];
      placeholder_unresolved.compute_callback = Coral.sponges["ՙ"];

      placeholder_unresolved.dependency_resolved();
    };
Coral.Scope.prototype.ĳ = function (to_symbol, dependencies, compute_callback) {
      // This method should not be used in any phase other than the initialize phase, so this assumption is sound here.
      var placeholder_unresolved = this.state[to_symbol];

      var unresolved_count = 0;
      for (var i = 0; i !== dependencies.length; ++i) {
        var dependency = dependencies[i];
        if (dependency instanceof Coral.Unresolved) {
          unresolved_count++;
          dependency.add_dependee(placeholder_unresolved);
        }
      }

      var immediately_resolving = unresolved_count === 0;
      if (immediately_resolving) {
        unresolved_count = 1;
      }
      // TODO: Do a better job of managing the Unresolved, this is a hack.
      placeholder_unresolved.unresolved_count = unresolved_count;
      placeholder_unresolved.dependencies = dependencies;
      placeholder_unresolved.compute_callback = compute_callback;

      if (immediately_resolving) {
        placeholder_unresolved.dependency_resolved();
      }
    };
Coral.Scope.prototype.Ĵ = function (symbol) {
      // TODO: Figure out a way to have this work as expected for reinitialization.  Don't do this for parameters.
      var scope_context = this;
      var existing_value = scope_context.state[symbol];
      if (existing_value instanceof Coral.Unresolved) {
        return existing_value;
      }

      function resolve_callback (result) {
        scope_context.state[symbol] = result;
      }

      var unresolved = new Coral.Unresolved(1, [], null, resolve_callback);
      scope_context.state[symbol] = unresolved;

      return unresolved;
    };
Coral.Scope.prototype.ĵ = function (func, packed_args) {
      var symbol = packed_args[0];
      var arg_symbols = packed_args.slice(1);

      // TODO: we really need a reliable mechanism for getting this thing all set up and manipulating it in very specific ways
      var scope_symbol_metadata = this['q'](symbol);
      var instance_symbol_metadata = this['r'](symbol);
      instance_symbol_metadata.observable = null;

      // TODO: This is to make sure element as arg doesn't result in dependee symbols or other bits of metadata being wired up more than once.
      // * One day when I have the time this will all get cleaned up when I do element as arg a different way that doesn't cause weirdness with metadata wiring.
      if (this['']) {
        return scope_symbol_metadata;
      }

      this[''] += symbol;

      scope_symbol_metadata.assign_update_handler(func, arg_symbols);
      this['ĺ'](symbol, Coral.sponges["Շ"]);

      return scope_symbol_metadata;
    };
Coral.Scope.prototype.Ķ = function (symbol) {
      this['ĵ'](null, symbol);
    };
Coral.Scope.prototype.ķ = function (func, packed_args, raw_argument_data) {
      var scope_symbol_metadata = this['ĵ'](func, packed_args);
      scope_symbol_metadata.assign_raw_update_handler_input_data(raw_argument_data);
    };
Coral.Scope.prototype.ĸ = function (callback, packed_args, limited_recompute_symbols) {
      var scope_symbol_metadata = this['ĵ'](callback, packed_args);
      scope_symbol_metadata.assign_limited_recompute_symbols(limited_recompute_symbols);
    };
Coral.Scope.prototype.Ĺ = function (func, packed_args, set_handler, set_handler_metadata) {
      this['ĵ'](func, packed_args);
      var scope_symbol_instance_metadata = this['r'](packed_args[0]);
      scope_symbol_instance_metadata.assign_set_handler(set_handler, set_handler_metadata);
    };
Coral.Scope.prototype.ĺ = function traverse_symbol_ancestors(symbol, func, callback) {
      var update_metadata = this[''][symbol];
      var instance_update_metadata = this[''][symbol];
      if (func) func(update_metadata, instance_update_metadata);

      if (update_metadata && update_metadata.is_scope_parameter &&
          instance_update_metadata && instance_update_metadata.forward_to) {
        var parent_scope = this.state[''];
        var forward_to_rules = instance_update_metadata.forward_to;

        for (var i = 0; i < forward_to_rules.length; i++) {
          var rule = forward_to_rules[i];
          if (rule.scope === parent_scope) {
            return traverse_symbol_ancestors.call(rule.scope, rule.symbol, func, callback);
          }
        }
      }
      if (callback) {
        return callback(this, symbol, update_metadata, instance_update_metadata);
      }
    };
Coral.Scope.prototype.Ļ = function (compute_function, packed_args) {
      var to_symbol = packed_args[0];

      var inputs = [];
      for (var i = 1; i < packed_args.length; i++) {
        var name = packed_args[i];
        var is_global = Coral.sponges["Կ"](name);
        var input = is_global ? Coral.sponges[name] : this.state[name];
        inputs.push(input);
      }

      var value = compute_function.apply(null, inputs);
      this['Ĳ'](to_symbol, value);
    };
Coral.Scope.prototype.ļ = function () {
      var key = '';
      if (!this.state[key]) this.state[key] = [];
      return this.state[key];
    };
Coral.Scope.prototype.Ľ = function () {
      var key = '';
      if (!this.state[key]) this.state[key] = [];
      return this.state[key];
    };
Coral.Scope.prototype.ľ = function (compute_callback, packed_arguments) {
      var assign_to_name = packed_arguments[0];

      var dependency_names = packed_arguments.slice(1);
      var dependencies = [];
      var unresolved_count = 0;
      for (var i = 0; i !== dependency_names.length; ++i) {
        var dependency_name = dependency_names[i];
        var dependency;
        if (Coral.sponges["Կ"](dependency_name)) {
          dependency = Coral.sponges[dependency_name];
        } else {
          dependency = this.state[dependency_name];
        }

        if (dependency instanceof Coral.Unresolved) ++unresolved_count;
        dependencies.push(dependency);
      }

      if (unresolved_count === 0) {
        var _this = this;
        dependencies.unshift(function (value) {
          _this['Ĳ'](assign_to_name, value);
        });
        compute_callback.apply(null, dependencies);
      } else {
        this['ĳ'](assign_to_name, dependencies, compute_callback);
      }
    };
Coral.Scope.prototype.Ŀ = function (packed_args, register_for_updates) {
      for (var i = 1; i < packed_args.length; i+=2) {
        var assign_to_symbol = packed_args[i - 1];
        var global_symbol = packed_args[i];

        if (register_for_updates) {
          this['Ķ'](assign_to_symbol);
        }

        var global_val = Coral.sponges[global_symbol];
        if (typeof global_val === 'object') {
          global_val = Coral.deepClone(global_val);
        }
        this['Ĳ'](assign_to_symbol, global_val);
      }

    };
Coral.Scope.prototype.ŀ = function (proxy_symbol, providing_scope, providing_scope_symbol) {
      Object.defineProperty(this.state, proxy_symbol, {
        enumerable: true,
        configurable: true, // Allow the proxy to be overriden if element as arg scope is reused.
        get: function () {
          return providing_scope.state[providing_scope_symbol];
        },
        set: function (v) {
          providing_scope.state[providing_scope_symbol] = v;
        }
      });
    };
Coral.Scope.prototype.Ł = function (items_symbol, item_index, async_pre_init, sync_init, async_input_output_symbols, sync_input_output_symbols, initial_intermediate_symbol, scope_array_symbol, previous_scope) {
      var j;
      var scope = this['l'](async_pre_init, sync_init);
      var sync_intermediate_output_symbol;
      var sync_intermediate_input_symbol;
      var async_input_output_border_index = 0;
      for (j = 0; j !== async_input_output_symbols.length; ++j) {
        var async_input_symbol = async_input_output_symbols[j];
        var async_input_symbol_char_code = async_input_symbol.charCodeAt(0);

        var index_async_input_symbol = Coral.sponges["Ծ"]([35,67], async_input_output_border_index);
        async_input_output_border_index++;
        if (async_input_symbol === ' ') {
          Object.defineProperty(scope.state, index_async_input_symbol, Coral.sponges["Ռ"]());
        } else {
          scope['u'](index_async_input_symbol, async_input_symbol);
        }
      }

      var sync_input_output_border_index = 0;

      for (j = 0; j !== sync_input_output_symbols.length; ++j) {
        var sync_input_output_symbol = sync_input_output_symbols[j];
        var sync_input_output_symbol_char_code = sync_input_output_symbol.charCodeAt(0);
        var index_sync_input_output_symbol = Coral.sponges["Ծ"]([67,99], sync_input_output_border_index);
        sync_input_output_border_index++;

        if (sync_input_output_symbol === '' || sync_input_output_symbol === '¢') {
          sync_intermediate_output_symbol = index_sync_input_output_symbol;
        } else if (sync_input_output_symbol === ' ') {
          Object.defineProperty(scope.state, index_sync_input_output_symbol, Coral.sponges["Ռ"]());
        } else if (sync_input_output_symbol === '¡') {
          sync_intermediate_input_symbol = index_sync_input_output_symbol;
          Object.defineProperty(scope.state, index_sync_input_output_symbol, Coral.sponges["Տ"]());
        } else {
          scope['u'](index_sync_input_output_symbol, sync_input_output_symbol);
        }
      }

      scope.state[''] = {
        symbols_needing_recording: [],
        previous_scope: previous_scope || this,
        previous_intermediate_output_symbol: previous_scope && previous_scope.state[''].sync_intermediate_output_symbol || initial_intermediate_symbol,
        scope_item_index: item_index,
        items_symbol: items_symbol,
        scope_array_symbol: scope_array_symbol,
        sync_intermediate_input_symbol: sync_intermediate_input_symbol,
        sync_intermediate_output_symbol: sync_intermediate_output_symbol
      };

      this['v'](scope, async_input_output_symbols, [35,67], scope_array_symbol, scope_array_symbol);
      this['v'](scope, sync_input_output_symbols, [67,99], scope_array_symbol, scope_array_symbol);

      return scope;
    };
Coral.Scope.prototype.ł = function () {
      this['Ń']();
      this['']();
    };
Coral.Scope.prototype.Ń = function () {
      var scope_scratch_data = this.state[''];
      var symbols_needing_recording = scope_scratch_data.symbols_needing_recording;
      if (symbols_needing_recording.length) {
        var scope_instance_update_metadata = this[''];

        for (var j = 0; j !== symbols_needing_recording.length; ++j) {
          var symbol_needing_recording = symbols_needing_recording[j];
          var symbol_instance_update_metadata = scope_instance_update_metadata[symbol_needing_recording];
          symbol_instance_update_metadata.last_recorded_value = this.state[symbol_needing_recording];
        }
      }
    };
Coral.Scope.prototype.ń = function (packed_args, invocation_arguments) {
      var virtuals = Coral.sponges[''];
      var args = [];
      var i;
      var use_unpacked_flag = false;
      for (i = 0; i !== packed_args.length; ++i) {
        var symbol = packed_args[i];
        var arg_value;
        var virtual_handler = virtuals[symbol];
        var end_placement;
        if (virtual_handler) {
          arg_value = virtual_handler(this);
        } else if (symbol === '¤') {
          end_placement = this.state[this.state.end_placement_symbol];
          arg_value = end_placement;
        } else if (symbol === '§') {
          var begin_placement = this.state[this.state.begin_placement_symbol];
          end_placement = this.state[this.state.end_placement_symbol];
          var top_level_view_nodes = Coral.sponges["Ե"](begin_placement, end_placement);
          arg_value = Coral.sponges["Բ"](top_level_view_nodes);
        } else if (symbol === '¦') {
          arg_value = this.generateEmitEventHandler();
        } else if (symbol === '©') {
          arg_value = invocation_arguments;
        } else if (symbol === '') {
          // Next symbol is a scope instance type.
          i++;
          var scope_instance_symbol = packed_args[i];
          arg_value = this['İ'](scope_instance_symbol);
        } else if (symbol === '¨') {
          use_unpacked_flag = true;
          continue;
        } else {
          arg_value = this['z'](symbol, {use_unpacked: use_unpacked_flag});
          if (use_unpacked_flag) use_unpacked_flag = false;
        }

        args.push(arg_value);
      }

      return args;
    };
Coral.Scope.prototype.Ņ = function (handler_function, packed_args) {
      // keep track of change event listeners registered to observables in this scope
      // so we can remove these listeners when the scope gets destroyed
      var event_listeners = this['Ľ']();

      var _on = Coral.Observable.prototype.on;

      Coral.Observable.prototype.on = function (event_name, listener) {
        var parent_prototype = Object.getPrototypeOf(Coral.Observable.prototype); // EventEmitter.prototype
        parent_prototype.on.apply(this, arguments);

        if (['beforeChange', 'change', 'afterChange'].indexOf(event_name) !== -1) {
          event_listeners.push({
            observable: this,
            event_info: {
              event_name: event_name,
              listener: listener
            }
          });
        }

        return this;
      };

      var args = this['ń'](packed_args);
      handler_function.apply(null, args);
      Coral.Observable.prototype.on = _on;
      return this;
    };
Coral.Scope.prototype.ņ = function (handler_function, packed_args, invocation_arguments) {
      var args = this['ń'](packed_args, invocation_arguments);
      return handler_function.apply(null, args);
    };
Coral.Scope.prototype.Ň = function (event_handler_function, packed_args, event, top_level_element_view_nodes) {
      var virtuals = Coral.sponges[''];
      var args = [];
      var i;
      var use_unpacked_flag = false;
      for (i = 0; i !== packed_args.length; ++i) {
        var symbol = packed_args[i];
        var arg_value;
        var virtual_handler = virtuals[symbol];
        var end_placement;

        if (virtual_handler) {
          arg_value = virtual_handler(this);
        } else if (symbol === '£') {
          arg_value = event;
        } else if (symbol === '¥') {
          arg_value = event.currentTarget;
        } else if (symbol === '¤') {
          end_placement = this.state[this.state.end_placement_symbol];
          arg_value = end_placement;
        } else if (symbol === '§') {
          var begin_placement = this.state[this.state.begin_placement_symbol];
          end_placement = this.state[this.state.end_placement_symbol];
          var top_level_view_nodes = Coral.sponges["Ե"](begin_placement, end_placement);
          arg_value = Coral.sponges["Բ"](top_level_view_nodes);
        } else if (symbol === '¦') {
          arg_value = this.generateEmitEventHandler();
        } else if (symbol === '') {
          // Next symbol is a scope instance type.
          i++;
          var scope_instance_symbol = packed_args[i];
          arg_value = this['İ'](scope_instance_symbol);
        } else if (symbol === '¨') {
          use_unpacked_flag = true;
          continue;
        } else {
          arg_value = this['z'](symbol, {use_unpacked: use_unpacked_flag});
          if (use_unpacked_flag) use_unpacked_flag = false;
        }

        args.push(arg_value);
      }

      event_handler_function.apply(null, args);
    };
Coral.Scope.prototype.ň = function recursive_waterfall_scope_event(event, event_type_descending_instruction_symbols, event_type_own_event_instruction_symbols) {
      /* jshint loopfunc:true */
      var i;
      var j;
      var event_target = event.target;
      var event_type = event.type;
      var begin_placement;
      var end_placement;
      var _this = this;

      var seen_scopes = event.originalEvent._seen_scopes || [];
      seen_scopes.push(this);
      event.originalEvent._seen_scopes = seen_scopes;

      for (i = 0; i !== event_type_descending_instruction_symbols.length; ++i) {
        var scope_symbol = event_type_descending_instruction_symbols[i];
        var scope_instance_representation = this.state[scope_symbol];

        if (scope_instance_representation instanceof Coral.Unresolved) {
          scope_instance_representation = scope_instance_representation.value;
        }

        // In the case of an element as arg, it is possible that one of the users of the scope that contains it does not pass down a scope instance type for it.
        if (!scope_instance_representation) {
          continue;
        }

        if (Array.isArray(scope_instance_representation)) {
          if (!scope_instance_representation.length) {
            continue;
          }

          var first_scope = scope_instance_representation[0];
          var last_scope = scope_instance_representation[scope_instance_representation.length - 1];

          var first_scope_scratch_data = first_scope.state[''];
          var containing_scope = first_scope_scratch_data.previous_scope;
          begin_placement = containing_scope.state[first_scope_scratch_data.previous_intermediate_output_symbol];
          end_placement = last_scope.state[last_scope.state[''].sync_intermediate_output_symbol];
        } else {
          begin_placement = scope_instance_representation.state[scope_instance_representation.state.begin_placement_symbol];
          end_placement = scope_instance_representation.state[scope_instance_representation.state.end_placement_symbol];
        }

        if (Coral.sponges["Զ"](event_target, begin_placement, end_placement)) {
          var interacted_with_scope_instance = scope_instance_representation;

          if (Array.isArray(scope_instance_representation)) {
            interacted_with_scope_instance = Coral.sponges["Ց"](scope_instance_representation, event_target);
          }

          var scope_instance_event_instructions = interacted_with_scope_instance.state[''] && interacted_with_scope_instance.state[''][event_type];

          if (scope_instance_event_instructions) {
            recursive_waterfall_scope_event.call(interacted_with_scope_instance, event, scope_instance_event_instructions.dispatch_to_children_symbols, scope_instance_event_instructions.own_event_handler_symbol_groups);
          }
          break;
        }
      }

      // If descendant scope has requested propagation be stopped, then don't execute handlers.
      if (event.isPropagationStopped()) {
        return;
      }

      var top_level_view_nodes;

      if (event_type_own_event_instruction_symbols.length) {
        begin_placement = this.state[this.state.begin_placement_symbol];
        end_placement = this.state[this.state.end_placement_symbol];
        top_level_view_nodes = Coral.sponges["Ե"](begin_placement, end_placement);
      }

      for (i = 0; i !== event_type_own_event_instruction_symbols.length; ++i) {
        var event_handler_symbols = event_type_own_event_instruction_symbols[i];
        var event_handler;

        var first_symbol_value = Coral.sponges[event_handler_symbols[0]];
        var second_symbol_value = Coral.sponges[event_handler_symbols[1]];
        var is_unconditional_dispatch = typeof first_symbol_value === "function";
        var is_keyboard_shortcut_dispatch = Array.isArray(first_symbol_value);
        var is_selector_based_dispatch = !is_keyboard_shortcut_dispatch && typeof second_symbol_value === "function";

        if (is_unconditional_dispatch) {
          event_handler = first_symbol_value;
          event.currentTarget = top_level_view_nodes.length > 1 ? top_level_view_nodes : top_level_view_nodes[0];
          this['Ň'](event_handler, event_handler_symbols.slice(1), event, top_level_view_nodes);
          continue;
        }

        if (is_selector_based_dispatch) {
          var selector = first_symbol_value;
          event_handler = second_symbol_value;

          var found_match = false;
          for (j = 0; !found_match && j !== top_level_view_nodes.length; ++j) {
            var view_node = top_level_view_nodes[j];
            if (view_node.nodeType === Node.ELEMENT_NODE) {

              // This is the silly thing I have to do to figure out how the browser supports matching on selector - https://developer.mozilla.org/en-US/docs/Web/API/Element/matches
              var matches_function = view_node.matches || view_node.matchesSelector || view_node.msMatchesSelector || view_node.oMatchesSelector || view_node.webkitMatchesSelector;
              if (matches_function.call(view_node, selector) && (view_node === event_target || view_node.compareDocumentPosition(event_target) & Node.DOCUMENT_POSITION_CONTAINED_BY)) {
                found_match = true;
                break;
              }

              var query_selector_results = view_node.querySelectorAll(selector);
              for (var k = 0; k !== query_selector_results.length; ++k) {
                var query_selector_result = query_selector_results[k];

                if (query_selector_result === event_target || (query_selector_result.compareDocumentPosition(event_target) & Node.DOCUMENT_POSITION_CONTAINED_BY)) {
                  found_match = true;
                  event.currentTarget = query_selector_result;
                  break;
                }
              }
            }
          }

          if (found_match) {
            this['Ň'](event_handler, event_handler_symbols.slice(2), event, top_level_view_nodes);
          }
        } else if (is_keyboard_shortcut_dispatch) {
          if (event.type !== 'keydown') return;
          var key_shortcut_manager = Coral.helpers.key_shortcut_manager;
          var key_event_command = first_symbol_value;

          key_shortcut_manager.queue_key_sequence_check(key_event_command, (function () {
            var key_event_handler = second_symbol_value;
            var input_symbols = event_handler_symbols.slice(2);
            var top_level_view_node = top_level_view_nodes.length > 1 ? top_level_view_nodes : top_level_view_nodes[0];
            var scope_context = _this;
            return function () {
              event.currentTarget = top_level_view_node;
              scope_context['Ň'](key_event_handler, input_symbols, event, top_level_view_nodes);
            };
          })());
        } else {
          begin_placement = this.state[event_handler_symbols[0]];
          end_placement = this.state[event_handler_symbols[1]];

          var is_element_as_arg_case = event_handler_symbols[0] === '';
          if (is_element_as_arg_case) {
            var element_as_arg_scope_representation = end_placement;
            if (element_as_arg_scope_representation instanceof Coral.Unresolved) {
              element_as_arg_scope_representation = element_as_arg_scope_representation.value;
            }

            if (Array.isArray(element_as_arg_scope_representation)) {
              if (!element_as_arg_scope_representation.length) {
                continue;
              }

              var first_element_as_arg_scope = element_as_arg_scope_representation[0];
              var last_element_as_arg_scope =  element_as_arg_scope_representation[element_as_arg_scope_representation.length - 1];

              begin_placement = first_element_as_arg_scope.state[first_element_as_arg_scope.state.begin_placement_symbol];
              end_placement = last_element_as_arg_scope.state[last_element_as_arg_scope.state.end_placement_symbol];
            } else {
              begin_placement = element_as_arg_scope_representation.state[element_as_arg_scope_representation.state.begin_placement_symbol];
              end_placement = element_as_arg_scope_representation.state[element_as_arg_scope_representation.state.end_placement_symbol];
            }
          }

          if (Coral.sponges["Զ"](event_target, begin_placement, end_placement)) {
            event_handler = Coral.sponges[event_handler_symbols[2]];

            var matched_placement_range = Coral.sponges["Ե"](begin_placement, end_placement);
            event.currentTarget = matched_placement_range.length > 1 ? matched_placement_range : matched_placement_range[0];

            this['Ň'](event_handler, event_handler_symbols.slice(3), event, top_level_view_nodes);
          }
        }
      }
    };
Coral.Scope.prototype.ŉ = function (event_type_descending_instruction_symbol_groups, event_type_own_event_instruction_symbol_groups) {
      var scope_context = this;
      return function (e) {
        var begin_placement = scope_context.state[scope_context.state.begin_placement_symbol];
        var end_placement = scope_context.state[scope_context.state.end_placement_symbol];

        if (scope_context['n']()) {
          return;
        }

        if (Coral.sponges["Զ"](e.target, begin_placement, end_placement)) {
          var coralEvent = new Coral.CoralEvent(e);
          scope_context.coral_instance.settings.event = coralEvent;

          scope_context['ň'](coralEvent, event_type_descending_instruction_symbol_groups, event_type_own_event_instruction_symbol_groups);

          Coral.Observable.scheduler.run();
        }
      };
    };
Coral.Scope.prototype.Ŋ = function (elem, packed_args) {
      this.state[packed_args[1]] = Coral.sponges["Դ"](elem, this.state[packed_args[0]]);
      this.state[packed_args[2]] = elem.appendChild(Coral.sponges["Ա"]());
    }