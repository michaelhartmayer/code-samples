enyo.kind({
	name: 'BurstSparkler',
	kind: 'Sparkle',

	components: [
		{ kind: enyo.Animator, name: 'aX', duration: 500, onStep: 'adjustX', easingFunction: enyo.easing.cubicOut },
		{ kind: enyo.Animator, name: 'aY', duration: 500, onStep: 'adjustY', easingFunction: enyo.easing.cubicOut }
	],

	create: function () {
		this.inherited(arguments);
		

		var tx, ty;
		tx = (Math.cos(enyo.irand(100)) * 400) - 200;
		ty = (Math.cos(enyo.irand(100)) * 400) - 200;

		this.$.aX.startValue = 0;
		this.$.aX.endValue   = tx;
		this.$.aY.startValue = 0;
		this.$.aY.endValue   = ty;

		this.$.aX.play();
		this.$.aY.play();
	},

	adjustX: function (inSender, inEvent) {
		this.bounds.l += this.$.aX.value / 40;
	},

	adjustY: function (inSender, inEvent) {
		this.bounds.t += this.$.aY.value / 40;
	},

	updatePosition: function (t) {
		this.inherited(arguments);
		
		this.bounds.l += Math.cos(this.bounds.t / 30) * 3;
		this.opacity += Math.cos(this.bounds.t) * .25;
	}
});