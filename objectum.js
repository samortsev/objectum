var Backbone = require ("backbone");
var Objectum = Backbone.Model.extend ({
	initialize: function () {
		var me = this;
		me.Server = require (__dirname + "/server");
		me.Project = require (__dirname + "/project");
	},
	start: function (port, cb) {
		me.server = new Server ();
	}
});
module.exports = Objectum;
