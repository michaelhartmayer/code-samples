enyo.kind({
	name: "GameSocket",
	kind: "Socket.IO",

	handlers: {
		'onConnect': 'connected',
		'onMessage': 'message',
		'onsetInfo': 'setInfo'
	},

	published: {
		sid: null
	},

	create: function () {
		this.inherited(arguments);
		window.sck = this;
	},

	connected: function (inSender, inEvent) {
		this.emit('getInfo');
	},

	message: function (inSender, inEvent) {		
		var response, type, message, data;
		
		// break down packet
		response = inEvent.message;
		type     = response.type;
		message  = response.message;
		data     = response.data;

		switch (type) {
			// debug
			case 'debug':
				//console.debug('<<<', message);
				break;

			case 'setInfo':
				this.setSid(inEvent.message.sid);
				this.emit('getPosition');

				this.bubble('onSetInfo', { 'sid': message.sid });
				break;

			case 'setPosition':
				this.bubble('setPosition', { 'x': message.x, 'y': message.y });
				break;

			case 'simulate':
				this.bubble('onSimulate', { 'message': message });
				break;
		}

		//console.log('<Message>', response);
	}
})