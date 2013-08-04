var GameInput = function (el) {
  this.active = {};
 
  var _self = this;
 
  el.addEventListener('keydown', function (e) {
    _self._register(e.keyCode);
  }, false);
 
  el.addEventListener('keyup', function (e) {
    _self._unregister(e.keyCode);
  }, false);
};
 
GameInput.prototype = {
  _register: function (kc) {
    this.active[kc] = true;
  },
  _unregister: function (kc) {
    this.active[kc] = false;
  },
  down: function (kc) {
    if (this.active[kc]) return true;
    return false;
  }
};

GameInput.CONST = {
  ARROW_LEFT   : 37,
  ARROW_RIGHT  : 39,
  ARROW_UP     : 38,
  ARROW_DOWN   : 40,
  ARROW_SPACE  : 32
};
