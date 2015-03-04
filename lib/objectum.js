var Backbone = require ("backbone");
var Objectum = Backbone.Model.extend ({
	Project: require (__dirname + "/project"),
	Session: require (__dirname + "/session"),
	initialize: function () {
		var me = this;
		me.Projects = Backbone.Collection.extend ({
			model: me.Project
		});
		me.projects = new me.Projects ();
		me.Sessions = Backbone.Collection.extend ({
			model: me.Session
		});
		me.sessions = new me.Sessions ();
	},
	start: function (port, cb) {
		var me = this;
	}
});
module.exports = Objectum;
