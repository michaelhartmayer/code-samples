enyo.kind({
	name: "App",

	handlers: {
		'onmousemove': 'mouseMove',
		'onresize': 'resize',
		'ontap': 'fingerTap'
	},

	components: [
		{ name: 'assetManager', kind: 'AssetManager', onReady: 'assetsReady', list: [
			{ name: 'Basic', src: '/assets/images/04.png' },
			{ name: 'Sparkle', src: '/assets/images/sparkle.png' }
		]},
		{ name: 'status', tag: 'h1' },
		{ name: 'stage', kind: 'enyo.Canvas', attributes: { width: 500, height: 500 }}
	],

	create: function () {
		this.inherited(arguments);
	},

	assetsReady: function (inSender, inEvent) {
		this.assets = inEvent.assets;
		this.ready();
	},

	loading: function () {
		this.$.status.setContent('Loading . . .');
	},

	rendered: function () {
		this.loading();
		this.resize();

		this.inherited(arguments);
	},

	ready: function () {
		this.$.status.destroy();

		this.cursor = this.$.stage.createComponent({
			name: 'Cursor',
			kind: 'enyo.canvas.Image',
			src:  '/assets/images/04.png',
			bounds: { t: 0, l: 0, w: 256, h: 171 },
			handlers: { 'onTick': 'tick' },
			tick: function (t) {
				this.opacity = 0.25 * Math.random() + 0.75;
			}
		});

		this.mainLoop();
	},

	mainLoop: function (t) {
		var stage;
		stage = this.$.stage;

		var x, y;
		x = window.document.width / 2 - (500 * Math.cos(t*10));
		y = window.document.height / 2 - (500 * Math.sin(t));

		//this.$.stage.createComponent({ kind: 'Sparkle', bounds: {t: y, l: x }});

		this.waterfallDown('onTick');
		stage.update();

		// loop
		enyo.requestAnimationFrame(enyo.bind(this, 'mainLoop'));
	},

	mouseMove: function (inSender, inEvent) {
		var x, y;
		x = inEvent.clientX;
		y = inEvent.clientY;

		this.cursor.bounds.l = x - this.cursor.bounds.w / 2;
		this.cursor.bounds.t = y - this.cursor.bounds.h / 2;


		var chance;
		chance = enyo.irand(100) > 98;
		//if (chance) this.$.stage.createComponent({ kind: 'Sparkle', bounds: {t: y, l: x }});
		if (chance) {
			var spn = 20;
			while (spn--) {
				this.$.stage.createComponent({ kind: 'BurstSparkler', bounds: {t: y, l: x }});
			}
		}
	},

	fingerTap: function (inSender, inEvent) {
		var x, y;
		x = inEvent.clientX;
		y = inEvent.clientY;

		this.cursor.bounds.l = x - this.cursor.bounds.w / 2;
		this.cursor.bounds.t = y - this.cursor.bounds.h / 2;

			var spn = 15;
			while (spn--) {
				this.$.stage.createComponent({ kind: 'BurstSparkler', bounds: {t: y, l: x }});
			}
	
	},

	resize: function (inSender, inEvent) {
		var stage, w, h;
		stage = this.$.stage;
		w = window.document.width;
		h = window.document.height;

		stage.setAttributes({ width: w, height: h });
		stage.render();
	}
});
