enyo.kind({
  kind: 'enyo.Component',
  name: 'AssetManager',

  library: {},

  create: function () {
    this.inherited(arguments);
    if (this.list.length) this.load(this.list);
  },

  load: function (arrList) {
    this._loaded = 0;
    this._total  = arrList.length;

    arrList.forEach(enyo.bind(this, function (item) {
      var src, name, img;

      img        = new Image();
      src        = item.src;
      name       = item.name;

      img.onload = enyo.bind(this, function (evt) {
        this.library[name] = img;
        this._loaded++;
        this.checkReady();
      });

      img.src = src;
    }));
  },

  checkReady: function () {
    if (this._loaded === this._total) {
      this.bubble('onReady', { assets: this.library });
    }
  }
});