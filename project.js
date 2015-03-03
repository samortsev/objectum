var Backbone = require ("backbone");
var _ = require ("underscore");
var Postgres = require (__dirname + "/db/postgres");
var Project = Backbone.Model.extend ({
	rootDir: null,
	adminPassword: "d033e22ae348aeb5660fc2140aec35850c4da997",
	anonymous: 1,
	database: "postgres",
	host: "127.0.0.1",
	port: 5432,
	code: null,
	username: null,
	password: null,
	dbaUsername: "postgres",
	dbaPassword: null,
	initialize: function (opts) {
		var me = this;
		_.defaults (me, opts);
		me.database.username = me.database.username || opts.code;
		me.database.password = me.database.password || opts.code;
	},
	createClient: function () {
		var me = this;
		if (me.database == "postgres") {
			var client = new Postgres ({project: me});
			return client;
		};
	},
	create: function () {
		var me = this;
		var client = me.createClient ();
		client.connect ({systemDB: 1}, function (err) {
		});
	},
	remove: function () {
	}
});
module.exports = Project;
