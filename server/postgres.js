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
	 * Defaults
	 **/
	defaults: {
		rootDir: null,
		host: null,
		port: null,
		dbaUsername: null,
		dbaPassword: null,
		dbUsername: null,
		dbPassword: null,
		dbDir: null,
		connection: null,
		adminConnection: null,
		inTransaction: false
	},
	/**
	 * @class Postgres
	 * @augments Backbone.Model
	 * @constructs Postgres
	 */
	initialize: function (opts) {
		assert (opts);
		assert.equal (typeof (opts.pid), "string");
		assert.equal (typeof (opts.rootDir), "string");
		assert.equal (typeof (opts.host), "string");
		assert.equal (typeof (opts.port), "number");
		assert.equal (typeof (opts.dbaUsername), "string");
		assert.equal (typeof (opts.dbaPassword), "string");
		assert.equal (typeof (opts.dbUsername), "string");
		assert.equal (typeof (opts.dbPassword), "string");
		assert.equal (typeof (opts.dbDir), "string");
		var me = this;
		me.set ({
			connection: "tcp://" + me.get ("dbUsername") + ":" + me.get ("dbPassword") + "@" + me.get ("host") + ":" + me.get ("port") + "/" + me.get ("id"),
			adminConnection: "tcp://" + me.get ("dbaUsername") + ":" + me.get ("dbaPassword") + "@" + me.get ("host") + ":" + me.get ("port") + "/postgres"
		});
		me.tags = {
			schema: me.get ("pid") + ".",
			tablespace: "tablespace " + me.get ("pid"),
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
		var connection = opts.system ? me.get ("adminConnection") : me.get ("connection");
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
	startTransaction: function (description, cb) {
		var me = this;
		me.query ("begin", function (err) {
			if (err) {
				cb (err);
			} else {
				me.set ({inTransaction: true});
				cb ();
			};
		});
	},
	commitTransaction: function (cb) {
		var me = this;
		me.query ("commit", function (err) {
			me.set ({inTransaction: false});
			cb (err);
		});
	},
	rollbackTransaction: function (cb) {
		var me = this;
		me.query ("rollback", function (err) {
			me.set ({inTransaction: false});
			cb (err);
		});
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
				fs.exists (me.get ("dbDir"), function (exists) {
					if (exists) {
						cb ();
					} else {
						fs.mkdir (me.get ("dbDir"), function (err) {
							if (err) {
								cb (new VError (err, "Failed mkdir %s", me.get ("dbDir")));
							} else {
								fs.chown (me.get ("dbDir"), userid.uid ("postgres"), userid.gid ("postgres"), function (err) {
									cb (err ? new VError (err, "Failed chown postgres:postgres on %s", me.get ("dbDir")) : null);
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
				me.query ("create role " + me.get ("dbUsername") + " noinherit login password '" + me.get ("dbPassword") + "'", cb);
			},
			function (cb) {
				me.query ("create tablespace " + me.get ("pid") + " owner " + me.get ("dbUsername") + " location '" + me.get ("dbDir") + "'", cb);
			},	
			function (cb) {
				me.query ("create database " + me.get ("pid") + " owner " + me.get ("dbUsername") + " encoding 'utf8' tablespace " + me.get ("pid"), cb);
			},
			function (cb) {
				me.disconnect ();
				me.connect (null, cb);
			},
			function (cb) {
				me.query ("create schema " + me.get ("pid") + " authorization " + me.get ("dbUsername"), cb);
			},
			function (cb) {
				async.eachSeries (["tables.sql", "indexes.sql", "data.sql"], function (filename, cb) {
					fs.readFile (__dirname + "/sql/" + filename, "utf8", function (err, data) {
						if (err) {
							cb (new VError (err, "Failed loading file %s", filename));
						} else {
							me.query (_.template (data)(me.tags), function (err) {
								cb (err ? new VError (err, "Failed query:\n%s", _.template (data)(me.get ("tags"))) : null);
							});
						};
					});
				}, cb);
			}
		], function (err) {
			me.disconnect ();
			cb (err ? new VError (err, "Failed to create database %s", me.get ("pid")) : null);
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
				me.query ("drop schema " + me.get ("pid") + " cascade", function () {
					cb ();
				});
			},
			function (cb) {
				me.disconnect ();
				me.connect ({system: 1}, cb);
			},
			function (cb) {
				me.query ("drop database " + me.get ("pid"), function () {
					cb ();
				});
			},
			function (cb) {
				me.query ("drop tablespace " + me.get ("pid"), function () {
					cb ();
				});
			},
			function (cb) {
				me.query ("drop role " + me.get ("dbUsername"), function () {
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
