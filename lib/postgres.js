//
//	Copyright (C) 2015 Samortsev Dmitry (samortsev@gmail.com). All Rights Reserved.
//
var Backbone = require ("backbone");
var _ = require ("underscore");
var assert = require ("assert");
var VError = require ("verror");
var pg = require ("pg");
var fs = require ("fs");
var Postgres = Backbone.Model.extend (/** @lends Postgres.prototype */{
	/**
	 * @class Postgres
	 * @augments Backbone.Model
	 * @constructs Postgres
	 */
	initialize: function (opts) {
		var me = this;
		me.project = opts.project;
		me.connection = "tcp://" + me.project.dbUsername + ":" + me.project.dbPassword + "@" + me.host + ":" + me.port + "/" + me.code;
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
	/**
	 * Connect to database
	 * @param {Object} opts - Connect options.
	 * @param {Boolean} opts.system - Connect to system database (postgres).
	 * @param {Callback} cb - Callback function.
	 **/
	connect: function (opts, cb) {
		opts = opts || {};
		assert.equal (typeof (opts), "object");
		assert.equal (typeof (cb), "function");
		var me = this;
		me.client = new pg.Client (opts.system ? me.adminConnection : me.connection);
		client.connect (cb);
		client.on ("error", function (err) {
			console.error ("postgres client error", err);
		});
	},
	/**
	 * Disconnect from database
	 **/
	disconnect: function () {
		var me = this;
		me.client.end ();
		me.client = null;
	},
	/**
	 * Create database
	 * @param {Callback} cb - Callback function.
	 **/
	createDatabase: function (cb) {
		assert.equal (typeof (cb), "function");
		var me = this;
		async.series ([
			function (cb) {
				me.connect ({system: 1}, cb);
			},
			function (cb) {
				me.client.query ("create role " + me.project.dbUsername + " noinherit login password '" + me.project.dbPassword + "'", cb);
			},
			function (cb) {
				me.client.query ("create tablespace " + me.project.code + " owner " + me.project.dbUsername + " location '" + me.project.dbDir + "'", cb);
			},
			function (cb) {
				me.client.query ("create database " + me.project.code + " owner " + me.project.dbUsername + " encoding 'utf8' tablespace " + me.project.code, cb);
			},
			function (cb) {
				me.disconnect ();
				me.connect (null, cb);
			},
			function (cb) {
				me.client.query ("create schema " + me.project.code + " authorization " + me.project.dbUsername, cb);
			},
			function (cb) {
				async.eachSeries (["tables.sql", "indexes.sql", "data.sql"], function (filename, cb) {
					fs.readFile (__dirname + filename, "utf8", function (err, data) {
						if (err) {
							cb (err);
						} else {
							me.client.query (_.template (data)(me.tags), cb);
						};
					});
				}, cb);
			}
		], function (err) {
			me.client.disconnect ();
			cb (err);
		});
	},
	/**
	 * Remove database
	 * @param {Callback} cb - Callback function.
	 **/
	removeDatabase: function (cb) {
		assert.equal (typeof (cb), "function");
		var me = this;
		async.series ([
			function (cb) {
				me.connect (null, cb);
			},
			function (cb) {
				me.client.query ("drop schema " + me.project.code + " cascade", cb);
			},
			function (cb) {
				me.disconnect ();
				me.connect ({system: 1}, cb);
			},
			function (cb) {
				me.client.query ("drop database " + me.project.code, cb);
			},
			function (cb) {
				me.client.query ("drop tablespace " + me.project.code, cb);
			},
			function (cb) {
				me.client.query ("drop role " + me.project.dbUsername, cb);
			}
		], function (err) {
			me.client.disconnect ();
			cb (err);
		});
	}
});
module.exports = Postgres;
