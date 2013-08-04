enyo.kind({
	name: 'com.machinespark.GameSurface',
	kind: 'enyo.Canvas',

  // todo: this is for dev onry
  map: window.dummyMap,

  components: [
    { kind: 'Signals', onkeydown: 'handleKeydown' },
    { kind: 'Signals', onkeyup:   'handleKeyup' },
    { name: 'bgLayerA', kind: 'com.machinespark.GameLayer', src: '/assets/panorama_a.png', bounds: {t: 0, l: 0 }, maxX: 1200, speedX: 0.2 },
    { name: 'bgLayerA2', kind: 'com.machinespark.GameLayer', src: '/assets/panorama_a2.png', bounds: {t: 300, l: 0 }, maxX: 1200, speedX: 0.5 },
    { name: 'bgLayerB', kind: 'com.machinespark.GameLayer', src: '/assets/panorama_b.png', bounds: {t: 470, l: 0 }, maxX: 1200, speedX: 0.75 },
    { name: 'player', kind: 'com.machinespark.Smurf' }
  ],

  wposx: 0,

  attributes: {
    width: 800,
    height: 600
  },

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

	handlers: {
		onclick: 'handleClick'
	},

  publisehd: {
    paused: false
  },

	create: function () {
		this.inherited(arguments);
	},

  handleKeydown: function (inSender, inEvent) {
    var kc;
    kc = inEvent.keyCode;

    this.activeKeys[kc] = true;
  },

  handleKeyup: function (inSender, inEvent) {
    var kc;
    kc = inEvent.keyCode;

    this.activeKeys[kc] = false;
  },

  isDown: function (kc) {
    return this.activeKeys[kc] || false;
  },

  handleClick: function (inSender, inEvent) {
  },

  mainLoop: function (tick) {    
    this.moveBackground();
    this.update();

    // loop
    enyo.requestAnimationFrame(enyo.bind(this, 'mainLoop'));
  },

  moveBackground: function () {
    var posx = this.$.bgLayerB.bounds.l;

    if (this.isDown(this.KEY_LEFT_ARROW)) {
      if (posx > 0) return;
      this.$.bgLayerA.moveRight();
      this.$.bgLayerA2.moveRight();
      this.$.bgLayerB.moveRight();
    }
    if (this.isDown(this.KEY_RIGHT_ARROW)) {
      if (posx < -390) return;
      this.$.bgLayerA.moveLeft();
      this.$.bgLayerA2.moveLeft();
      this.$.bgLayerB.moveLeft();
    }
  },

  rendered: function () {
    this.inherited(arguments);
    enyo.requestAnimationFrame(enyo.bind(this, 'mainLoop'));
  },

  renderSelf: function () {
    this.inherited(arguments);
  },

  update: function () {
    // update
    this.inherited(arguments);
  }
});