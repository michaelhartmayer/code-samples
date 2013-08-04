enyo.kind({
	name: 'Canvas.Image',
	kind: enyo.Component,

	src: null,
	w: null,
	h: null,

	published: {
		src:  '',
		data: null
	},

	create: function () {
		this.inherited(arguments);
		if (this.src) this.setSrc(this.src);
	},

	setSrc: function (src) {
		var c, cx, w, h, img;

		c   = document.createElement('canvas');
		cx  = c.getContext('2d');
		img = new Image();

		img.onload = function () {
			var data;

			w = img.width;
			h = img.height;

			c.width  = w;
			c.height = h;

			cx.drawImage(img, 0, 0, w, h);
			data = cx.getImageData(0, 0, w, h);

			this.setData(data);
			this.bubble('onload', { data: this.getData() });
		}.bind(this);

		img.src = src;
	}
})