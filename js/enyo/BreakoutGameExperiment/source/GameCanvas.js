enyo.kind({
	name: "GameCanvas",
	kind: "Canvas",

	published: {
		actors: []
	},

	handlers: {
		// dom events
		onresize: 		'resize',
		onmousemove:  'mouseMove',
	},

	components: [
		// key signals
    { kind: 'Signals', onkeydown: 'keyDown' },
    { kind: 'Signals', onkeyup:   'keyUp' }
  ],

  // keys actively pressed down
  activeKeys: {},

  // CONST: Key Map
  KEY_LEFT_ARROW : 37,
  KEY_RIGHT_ARROW: 39,
  KEY_UP_ARROW   : 38,
  KEY_DOWN_ARROW : 40,
  KEY_SPACE      : 32,

  // mouse position
  mouseX: 0,
  mouseY: 0,

  keyDown: function (inSender, inEvent) {
    var kc;
    kc = inEvent.keyCode;

    this.activeKeys[kc] = true;
  },

  keyUp: function (inSender, inEvent) {
    var kc;
    kc = inEvent.keyCode;

    this.activeKeys[kc] = false;
  },

  isDown: function (kc) {
    return this.activeKeys[kc] || false;
  },

	mainLoop: function () {
		this.clearCanvas();

		var actors;
		actors = this.getActors();

		// turn actor data into sprites and dump into stack
		var ctx;
		ctx = this.getContext();

		// todo: draw everyone as sprites instead of balls
		actors.forEach(function (actor) {
			if (!actor.props.position) return;

			var x, y, r;

			r = 10;
      x = actor.props.position.x - r / 2;
      y = actor.props.position.y - r / 2;

      ctx.beginPath();
      ctx.arc(x, y, r, 0, 2 * Math.PI, false);
      ctx.fillStyle = 'green';
      ctx.fill();
      ctx.stroke();

			ctx.fillStyle = 'grey';
      ctx.fillText(actor.props.sid, x - (actor.props.sid.length / 2 * 6), y + 25);

      ctx.fillStyle = 'white';
      var s = '(' + x + ', ' + y + ')';
      ctx.fillText(s, x+15, y-15);
		});

		this.move();

		requestAnimFrame(this.mainLoop.bind(this));
	},

	move: function () {
		var v = 5;

		if (this.isDown(this.KEY_UP_ARROW)) {
			this.bubble('onMove', { x: 0, y: -v });
		}
		if (this.isDown(this.KEY_DOWN_ARROW)) {
			this.bubble('onMove', { x: 0, y: v });
		}
		if (this.isDown(this.KEY_LEFT_ARROW)) {
			this.bubble('onMove', { x: -v, y: 0 });
		}
		if (this.isDown(this.KEY_RIGHT_ARROW)) {
			this.bubble('onMove', { x: v, y: 0 });
		}
	},

	rendered: function () {
		this.inherited(arguments);
		requestAnimFrame(this.mainLoop.bind(this));
	}
})