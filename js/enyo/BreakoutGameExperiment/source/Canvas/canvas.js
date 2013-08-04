enyo.kind({
  name: 'Canvas',
  kind: enyo.Control,

  tag:  'canvas',

  published: {
    context: null,
    w:       1024,
    h:       768
  },

  create: function () {
  	this.inherited(arguments);
    this.render();
  },

  rendered: function () {
    this.inherited(arguments);

    var node;
    node = this.hasNode();

    this.setContext(node.getContext('2d'));
    node.width = this.getW();
    node.height = this.getH();
  },

  clearCanvas: function () {
    this.getContext().clearRect(0, 0, this.getW(), this.getH());
  }
});
