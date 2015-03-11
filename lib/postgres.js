//
//	Copyright (C) 2015 Samortsev Dmitry (samortsev@gmail.com). All Rights Reserved.
//
var Backbone = require ("backbone");
var _ = require ("underscore");
var assert = require ("assert");
var VError = require ("verror");
var pg = require ("pg");
var fs = require ("fs");
var async = require ("async");
var userid = require ("userid");
var Postgres = Backbone.Model.extend (/** @lends Postgres.prototype */{
	/**
	 * @class Postgres
	 * @augments Backbone.Model
	 * @constructs Postgres
	 */
	initialize: function (opts) {
		var me = this;
		me.project = opts.project;
		me.connection = "tcp://" + me.project.dbUsername + ":" + me.project.dbPassword + "@" + me.project.host + ":" + me.project.port + "/" + me.project.code;
		me.adminConnection = "tcp://" + me.project.dbaUsername + ":" + me.project.dbaPassword + "@" + me.project.host + ":" + me.project.port + "/postgres";
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
		var connection = opts.system ? me.adminConnection : me.connection;
		me.client = new pg.Client (connection);
		me.client.connect (function (err) {
			if (err) err = new VError (err, "Failed to connect %s", connection);
			cb (err);
		});
		me.client.on ("error", function (err) {
			console.error ("postgres client error", err);
		});
	},
	/**
	 * Disconnect from database
	 **/
	disconnect: function () {
		var me = this;
		if (me.client) me.client.end ();
		me.client = null;
	},
	/**
	 * Execute SQL
	 * @param {String} sql - Query.
	 * @param {Callback} cb - Callback function.
	 **/
	query: function (sql, cb) {
		var me = this;
		console.log (sql);
		me.client.query (sql, cb);
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
				fs.exists (me.project.dbDir, function (exists) {
					if (exists) {
						cb ();
					} else {
						fs.mkdir (me.project.dbDir, function (err) {
							if (err) {
								cb (new VError (err, "Failed mkdir %s", me.project.dbDir));
							} else {
								fs.chown (me.project.dbDir, userid.uid ("postgres"), userid.gid ("postgres"), function (err) {
									cb (err ? new VError (err, "Failed chown postgres:postgres on %s", me.project.dbDir) : null);
								});
							};
						});
					};
				});
			},
			function (cb) {
				me.connect ({system: 1}, cb);
			},
			function (cb) {
				me.query ("create role " + me.project.dbUsername + " noinherit login password '" + me.project.dbPassword + "'", cb);
			},
			function (cb) {
				me.query ("create tablespace " + me.project.code + " owner " + me.project.dbUsername + " location '" + me.project.dbDir + "'", cb);
			},	
			function (cb) {
				me.query ("create database " + me.project.code + " owner " + me.project.dbUsername + " encoding 'utf8' tablespace " + me.project.code, cb);
			},
			function (cb) {
				me.disconnect ();
				me.connect (null, cb);
			},
			function (cb) {
				me.query ("create schema " + me.project.code + " authorization " + me.project.dbUsername, cb);
			},
			function (cb) {
				async.eachSeries (["tables.sql", "indexes.sql", "data.sql"], function (filename, cb) {
					fs.readFile (__dirname + "/" + filename, "utf8", function (err, data) {
						if (err) {
							cb (new VError (err, "Failed loading file %s", filename));
						} else {
							me.query (_.template (data)(me.tags), function (err) {
								cb (err ? new VError (err, "Failed query:\n%s", _.template (data)(me.tags)) : null);
							});
						};
					});
				}, cb);
			}
		], function (err) {
			me.disconnect ();
			cb (err ? new VError (err, "Failed to create database %s", me.project.code) : null);
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
				me.query ("drop schema " + me.project.code + " cascade", function () {
					cb ();
				});
			},
			function (cb) {
				me.disconnect ();
				me.connect ({system: 1}, cb);
			},
			function (cb) {
				me.query ("drop database " + me.project.code, function () {
					cb ();
				});
			},
			function (cb) {
				me.query ("drop tablespace " + me.project.code, function () {
					cb ();
				});
			},
			function (cb) {
				me.query ("drop role " + me.project.dbUsername, function () {
					cb ();
				});
			}
		], function (err) {
			me.disconnect ();
			cb ();
		});
	}
});
module.exports = Postgres;
