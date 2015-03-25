//
//	Copyright (C) 2015 Samortsev Dmitry (samortsev@gmail.com). All Rights Reserved.
//
var Backbone = require ("backbone");
var _ = require ("underscore");
var assert = require ("assert");
var VError = require ("verror");
var async = require ("async");
var Session = require (__dirname + "/session");
var Sessions = Backbone.Collection.extend ({
	model: Session
});
var Postgres = require (__dirname + "/postgres");
var Resource = Backbone.Model.extend ({
	sync: function (method, model, opts) {
		var me = this;
	}
});
var Class = Resource.extend ({
	initialize: function (opts) {
		this.rsc = "class";
	}
});
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
		me.set ({
			dbUsername: me.get ("dbUsername") || opts.id,
			dbPassword: me.get ("dbPassword") || opts.id,
			dbDir: opts.rootDir + "/db"
		});
		me.collection = {
			"session": new Sessions ()
		};
		me.methodFn = {
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
	createClient: function (sid) {
		var me = this;
		var opts = {
			pid: me.id,
			sid: sid,
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
			var client = new Postgres (opts);
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
		if (me.collection.session.get (cmd.sid)) {
			cb (null, {sid: cmd.sid});
			return;
		};
		if (cmd.username == "admin" && cmd.password == me.get ("adminPassword")) {
			var session = new Session ({
				id: require ("crypto").createHash ("sha1").update (cmd.username + Math.random ()).digest ("hex"),
				username: "admin"
			});
			me.collection.session.add (session);
			cb (null, {sid: session.id});
			console.log (session.id);
		} else {
			cb (new VError ("Invalid username or password."));
		};
	},
	getClass: function (client, id, cb) {
		this.readRsc (client, "class", id, cb);
	},
	readRsc: function (client, rsc, id, cb) {
		var me = this;
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
		if (cmd.rsc == "project" && cmd.method == "auth") {
			me.auth (client, cmd.data, function (err, data) {
				if (err) {
					cb (new VError (err, "processCmd error"));
				} else {
					cb (null, data);
				};
			});
		};
		if (cmd.rsc == "class" && cmd.method == "read") {
			me.getClass (client, cmd.data.id, function (err, data) {
				if (err) {
					cb (new VError (err, "processCmd error"));
				} else {
					cb (null, data);
				};
			});
		};
	}
});
module.exports = Project;
