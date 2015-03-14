//
//	Copyright (C) 2015 Samortsev Dmitry (samortsev@gmail.com). All Rights Reserved.
//
var Backbone = require ("backbone");
var _ = require ("underscore");
var assert = require ("assert");
var VError = require ("verror");
var async = require ("async");
var crypto = require ("crypto");
var shasum = crypto.createHash ("sha1");
var Project = Backbone.Model.extend (/** @lends Project.prototype */{
	/**
	 * Defaults
	 **/
	defaults: {
		id: null,
		rootDir: null,
		adminPassword: "d033e22ae348aeb5660fc2140aec35850c4da997",
		anonymous: 1,
		database: "postgres",
		host: "127.0.0.1",
		port: 5432,
		dbaUsername: "postgres",
		dbaPassword: null,
		dbUsername: null,
		dbPassword: null,
		dbDir: null
	},
	/**
	 * @class Project
	 * @augments Backbone.Model
	 * @constructs Project
	 */
	initialize: function (opts) {
		assert (opts);
		assert.equal (typeof (opts.rootDir), "string");
		assert.equal (typeof (opts.id), "string");
		assert.equal (typeof (opts.dbaPassword), "string");
		var me = this;
		me.Postgres = require (__dirname + "/postgres");
		me.set ({
			dbUsername: me.get ("dbUsername") || opts.id,
			dbPassword: me.get ("dbPassword") || opts.id,
			dbDir: opts.rootDir + "/db"
		});
		me.Session = require (__dirname + "/session"),
		me.Sessions = Backbone.Collection.extend ({
			model: me.Session
		});
		me.resources = ["class"];
		me.actionFn = {
			"create": "create",
			"read": "get",
			"update": "update",
			"delete": "remove"
		};
	},
	/**
	 * Create database client
	 * @return {Object} Client object
	 **/
	createClient: function () {
		var me = this;
		var opts = {
			pid: me.get ("id"),
			rootDir: me.get ("rootDir"),
			host: me.get ("host"),
			port: me.get ("port"),
			dbaUsername: me.get ("dbaUsername"),
			dbaPassword: me.get ("dbaPassword"),
			dbUsername: me.get ("dbUsername"),
			dbPassword: me.get ("dbPassword"),
			dbDir: me.get ("dbDir")
		};
		if (me.get ("database") == "postgres") {
			var client = new me.Postgres (opts);
			return client;
		};
		throw new VError ("Unsupported database %s", me.get ("database"));
	},
	/**
	 * Create database
	 * @param {Callback} cb - Callback function.
	 **/
	createDatabase: function (cb) {
		assert.equal (typeof (cb), "function");
		var me = this;
		var client = me.createClient ();
		client.createDatabase (cb);
	},
	/**
	 * Remove database
	 * @param {Callback} cb - Callback function.
	 **/
	removeDatabase: function (cb) {
		assert.equal (typeof (cb), "function");
		var me = this;
		var client = me.createClient ();
		client.removeDatabase (cb);
	},
	/**
	 * Authenticate user
	 * @param {Client} client - Client of database.
	 * @param {Object} cmd - Command for execute.
	 * @param {Callback} cb - Callback function.
	 **/
	auth: function (client, cmd, cb) {
		var me = this;
		if (cmd.username == "admin" && cmd.password == me.get ("adminPassword")) {
			shasum.update (cmd.username + me.id + Math.random ());
			var session = new me.Session ({
				id: shasum.digest ("hex"),
				username: "admin"
			});
			me.sessions.add (session);
			cb (new VError ("Invalid username or password."));
		} else {
			cb (new VError ("Invalid username or password."));
		};
	},
	/**
	 * Get a class
	 * @param {String} id - Class id.
	 * @param {Callback} cb - Callback function.
	 **/
	getClass: function (id, cb) {
		var me = this;

	},
	/**
	 * Read resource
	 * @param {Client} client - Client of database.
	 * @param {Object} cmd - Command for execute.
	 * @param {Callback} cb - Callback function.
	 **/
	read: function (client, cmd, cb) {
		var me = this;
		var resource = cmd.resource;
		if (me.resources.indexOf (resource) == -1) {
			cb (new VError ("Invalid resource: %s", resource));
			return;
		};
		async.waterfall ([
			function (cb) {

			}
		], function (err, result) {

		});
	},
	/**
	 * Processing cmd
	 * @param {Client} client - Client of database.
	 * @param {Object} cmd - Command for execute.
	 * @param {Callback} cb - Callback function.
	 **/
	processCmd: function (client, cmd, cb) {
		assert.equal (typeof (cmd), "object");
		assert.equal (typeof (cb), "function");
		var me = this;
		if (cmd.resource == "project" && cmd.action == "auth") {
			me.auth (client, cmd.data, function (err, data) {
				cb (err: new VError (err, "processCmd error: %s" JSON.stringify (cmd)) : data);
			});
		};
		if (cmd.resource == "class" && cmd.action == "read") {
			me.getClass (client, cmd.data, function (err, data) {
				cb (err: new VError (err, "processCmd error: %s" JSON.stringify (cmd)) : data);
			});
		};
	}
});
module.exports = Project;
