String.prototype.repeat = function (n) {
  var s = '';
  for (var i = 0; i < n; i++) s+= this;
  return s;
}
