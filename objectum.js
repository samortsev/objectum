var Backbone = require ("backbone");
var Server = require (__dirname + "/server");
var Project = require (__dirname + "/project");
var Objectum = Backbone.Model.extend ({
	initialize: function () {
		var me = this;
		me.server = new Server ();
	},
	start: function (port, cb) {
	}
});
module.exports = Objectum;
