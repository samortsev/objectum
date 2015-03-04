//
//	Copyright (C) 2015 Samortsev Dmitry (samortsev@gmail.com). All Rights Reserved.
//
var Backbone = require ("backbone");
var pg = require ("pg");
var Postgres = Backbone.Model.extend ({
	initialize: function (opts) {
		var me = this;
		me.project = opts.project;
		me.connection = "tcp://" + me.project.username + ":" + me.project.password + "@" + me.host + ":" + me.port + "/" + me.db;
		me.adminConnection = "tcp://" + me.project.dbaUsername + ":" + me.project.dbaPassword + "@" + me.host + ":" + me.port + "/postgres";
		me.tags = {
			schema: me.project.code + ".",
			tablespace: "tablespace " + me.project.code,
			id: "bigserial",
			number: "bigint",
			number_value: "numeric",
			text: "text",
			timestamp: "timestamp (6)",
			string: "varchar (1024)",
			string_value: "text",
			toc_id: "object_id bigint not null, primary key (object_id)"
		};
	},
	connect: function (opts, cb) {
		var me = this;
		me.client = new pg.Client (opts.systemDB ? me.adminConnection : me.connection);
		client.connect (cb);
		client.on ("error", function (err) {
			console.error ("postgres client error", err);
		});
	},
	createDatabase: function () {
		var me = this;
		
	},
	removeDatabase: function () {
		var me = this;
	}
});
module.exports = Postgres;
