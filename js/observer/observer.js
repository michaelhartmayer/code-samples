Event = function () {
  this.f = [];
};
 
Event.prototype = {
  subscribe: function (fn) {
    this.f.push(fn);
  },
  fire: function () {
    for (var i in this.f) this.f[i](arguments);
  }
};
