var Backbone = require ("backbone");
var express = require ("express");
var Platform = require (__dirname + "/platform");
var Server = Backbone.Model.extend ({
	initialize: function () {
		var me = this;
		me.app = express ();
		server.app.get ("/admin", server.setVars, server.processProjectPlugins, server.requestStart, 
			xmlss.report,
			projects.sqlstat,
			projects.services.captcha,
			projects.services.accountActivate,
			projects.services.restorePassword,
			projects.services.resetPassword,
			projects.getHandler
		);
		me.platform = new Platform ();
	}
});
module.exports = Server;
