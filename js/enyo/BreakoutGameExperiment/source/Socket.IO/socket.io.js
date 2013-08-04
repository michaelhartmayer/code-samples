enyo.kind({
	name: 'Socket.IO',
	kind: enyo.Component,

	sck: null,

	published: {
		host: 'http://localhost'
	},

	create: function () {
		this.inherited(arguments);
		this.setHost(this.host);
	},

	connect: function () {
		this.sck = io.connect(this.getHost());

		// onConnect
		this.sck.on('connect', function (sck) {
			this.bubble('onConnect');
		}.bind(this));

		// onPacket
		this.sck.on('message', function (res) {
			this.bubble('onMessage', { 'message': res }, this);
		}.bind(this));

		// onDisconnect
		this.sck.on('disconnect', function () {
			this.bubble('onDisconnect');
		}.bind(this));
	},

	emit: function (type, message) {
		var m = { 'type': type, 'message': message || false };
		//console.debug('>>>', m);
		this.sck.emit('message', m);
	}
})