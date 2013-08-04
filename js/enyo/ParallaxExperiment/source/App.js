enyo.kind({
	name: "App",

	components: [
		{ name: 'surface', kind: 'com.machinespark.GameSurface', classes: 'surface'}
	],

	create: function () {
		this.inherited(arguments);
	}
});
