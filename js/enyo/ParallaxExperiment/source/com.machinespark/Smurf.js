enyo.kind({
	name: 'com.machinespark.Smurf',
	kind: enyo.canvas.Circle,

	width:  10,
	
	falling: true,
	modY:   0,
	posY:   490,
	energy: 0,

	maxHeight: 10,

	create: function () {
		this.inherited(arguments);

		this.setBounds({
			l: 400 - this.width,
			t: this.posY,
			w: this.width
		});
	},

	renderSelf: function(ctx) {
		this.inherited(arguments);

		if (this.energy > this.maxHeight) this.falling = true;
		if (this.energy < 0)  this.falling = false;

		var dir = this.falling ? -1 : 1;

		this.energy += (0.2 * dir) / 2 + (this.energy / 8 * dir);

		// update position
		this.modY = (this.maxHeight - this.energy) * 5;
		this.bounds.t = this.posY - this.modY;
	},

	jump: function () {

	}
});