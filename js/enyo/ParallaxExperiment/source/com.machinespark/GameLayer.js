enyo.kind({
	name: 'com.machinespark.GameLayer',
	kind: 'enyo.canvas.Image',

	speedX: null,

	create: function () {
		this.inherited(arguments);
	},

	moveLeft: function () {
		this.bounds.l -= this.speedX;
	},

	moveRight: function () {
		this.bounds.l += this.speedX;
	}
});