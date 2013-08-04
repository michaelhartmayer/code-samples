enyo.kind({
	name: "App",
	kind: enyo.Control,

	content: 'Loading..',

	handlers: {
		// custom events
		onSimulate: 	 'simulate',
		onConnect:  	 'connected',
		onDisconnect:  'disconnected',
		onSetInfo:     'setInfo',
		onSetPosition: 'setPosition',

		// movement events
		onMove: 'move'
	},

	components: [
    // game components
		{ name:	'socket', kind: 'GameSocket',	host: 'http://68.6.175.196:6699' },
		{ name: 'stage', kind: 'GameCanvas'	},

		// player actor
		{ name: 'actor', kind: enyo.Control, x: null, y: null, alias: 'Unknown Sphere' }
	],

	published: {
		sid: null
	},

	timer: null,

	create: function () {
		this.inherited(arguments);

		this.timer = setInterval(this.emitPosition.bind(this), 15);
		this.fullscreenAll();
	},

	connected: function (inSender, inEvent) {
		//console.log('Application Connected!');
	},

	disconnected: function (inSender, inEvent) {
		//console.log('Application Disconnected!')
	},

	setInfo: function (inSender, inEvent) {
		this.setSid(inEvent.sid);
	},

	setPosition: function (inSender, inEvent) {
		var x, y;

		x = inEvent.x;
		y = inEvent.y;

		this.$.actor.x = x;
		this.$.actor.x = y;

		console.log(this.$.actor)
	},

	resize: function (inSender, inEvent) {
		this.fullscreenAll();
	},

	fullscreenAll: function () {
		var w, h, attr;

		w 	 = document.width;
		h    = document.height;
		attr = { width: w, height: h };

		// fullscreen
		//this.$.stage.setAttributes(attr) // breaks
	},

	simulate: function (inSender, inEvent) {
		this.$.stage.setActors(inEvent.message);
		return true;
	},

  mouseMove: function (inSender, inEvent) {
    this.mouseX = inEvent.x;
    this.mouseY = inEvent.y;
  },

	rendered: function () {
		this.inherited(arguments);
		this.$.socket.connect();
	},

	move: function (inSender, inEvent) {
		this.$.actor.x += inEvent.x;
		this.$.actor.y += inEvent.y;
	},

	emitPosition: function (inSender, inEvent) {
		var actor, x, y;

		actor = this.$.actor;
		x     = actor.x;
		y     = actor.y;

		this.$.socket.emit('moveTo', { 'x': x, 'y': y });
	}
});
