Array.prototype.grep = function (rx) {
  var a = [], r = new RegExp(rx);
  for (var i = 0; i < this.length; i++) {
    if (r.test(this[i])) a.push(this[i]);
  }
  return a;
};

Array.prototype.shuffle = function () {
  var l = this.length + 1;
  while (l--) {
    var r   = ~~(Math.random() * l), o = this[r];
    this[r] = this[0];
    this[0] = o;
  }
  return this;
};

Array.prototype.switch = function (a, b) {
  var x   = this[b];
  this[b] = this[a];
  this[a] = x;
  return this;
};

Array.prototype.odds = function () {
  var a = [], o = this;
  for (var i = 0; i < o.length; i++) {
    if (i%2==0) a.push(o[i]);
  }
  return a;
};

Array.prototype.evens = function () {
  var a = [], o = this;
  for (var i = 0; i < o.length; i++) {
    if (i%2!=0) a.push(o[i]);
  }
  return a;
};

