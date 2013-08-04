enyo.kind({
	name: 'Sparkle',
	kind: 'enyo.canvas.Image',

	// base dimensions
	bd: { w: 512, h: 768 },

	src:  '/assets/images/sparkle.png',

	handlers: {
		onTick: 'updatePosition'
	},

	create: function () {
		this.inherited(arguments);
		
		// physics
		this.speed = 0.2 + enyo.irand(4);
		
		this.bounds.t -= 540;
		this.bounds.l -= 200;

		this.opacity = 1;

		this.dir = enyo.irand(1) - 1 == 0 ? 1 : -1;
		this.xburst = enyo.irand(55) + 5 * this.dir;
	},

	updatePosition: function (inSender, inEvent) {
		this.speed += this.speed * 0.02;
		this.bounds.t += this.speed;

		this.opacity -= this.opacity * 0.1;
		this.opacity = 0.5 + Math.random() * 0.2;

		this.xburst = this.xburst * 0.8;
		this.bounds.l += this.xburst;

		if (this.bounds.t > 3000) this.destroy();
	}
})