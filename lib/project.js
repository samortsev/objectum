//
//	Copyright (C) 2015 Samortsev Dmitry (samortsev@gmail.com). All Rights Reserved.
//
var Backbone = require ("backbone");
var _ = require ("underscore");
var assert = require ("assert");
var VError = require ("verror");
var async = require ("async");
var Session = require (__dirname + "/session");
var Postgres = require (__dirname + "/postgres");
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
	initialize: function () {
		var me = this;
		assert.equal (typeof (me.get ("rootDir")), "string");
		assert.equal (typeof (me.id), "string");
		assert.equal (typeof (me.get ("dbaPassword")), "string");
		me.set ({
			dbUsername: me.get ("dbUsername") || me.id,
			dbPassword: me.get ("dbPassword") || me.id,
			dbDir: me.get ("dbDir") || (me.get ("rootDir") + "/db")
		});
		me.methodFn = {
			"create": "create",
			"read": "get",
			"update": "update",
			"delete": "remove"
		};
		me.Provider = require (__dirname + "/provider");
		me.provider = new me.Provider ({pid: me.id});
	},
	/**
	 * Create database client
	 * @return {Object} Client object
	 **/
	createClient: function () {
		var me = this;
		var attrs = {
			pid: me.id,
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
			var client = new Postgres (attrs);
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
	 * @param {Object} cmd - Command for execute.
	 * @param {Callback} cb - Callback function.
	 **/
	auth: function (cmd, cb) {
		var me = this;
		if (me.collection.session.get (cmd.sid)) {
			cb (null, {sid: cmd.sid});
			return;
		};
		if (cmd.username == "admin" && cmd.password == me.get ("adminPassword")) {
			var attrs = {
				id: require ("crypto").createHash ("sha1").update (cmd.username + Math.random ()).digest ("hex"),
				username: "admin",
				userId: null,
				roleId: null,
				pid: me.id
			};
			me.provider.createRsc ({rid: "session", attrs: attrs}, function (err, session) {
				if (err) {
					return cb (new VError (err, "Project.auth error"));
				};
				cb (null, {sid: session.id});
				console.log (session.id);
			});
		} else {
			cb (new VError ("Invalid username or password."));
		};
	},
	createRsc: function (opts, cb) {
		var me = this;
	},
	removeRsc: function (opts, cb) {
		var me = this;
	},
	updateRsc: function (opts, cb) {
		var me = this;
	},
	// Загружает ресурс id и зависимые ресурсы
	getRsc: function (opts, cb) {
		assert (opts);
		assert (opts.session instanceof Session);
		assert.equal (typeof (opts.rid), "string");
		assert.equal (typeof (opts.id), "number");
		var me = this;
		var session = opts.session;
		var rid = opts.rid;
		var id = opts.id;
		async.waterfall ([
			function getRsc (cb) {
				me.provider.getRsc ({session: session, rid: rid, filter: {id: id}, rscFormat: true}, function (err, opts) {
					cb (err, opts);
				});
			},
			function getAttrs (opts, cb) {
				if (rid == "class") {
					me.provider.getRsc ({session: session, rid: "classAttr", filter: {classId: id}, rscFormat: true, source: opts.source}, function (err, _opts) {
						opts.data = opts.data.concat (_opts.data);
						cb (err, opts);
					});
				} else
				if (rid == "query") {
					me.provider.getRsc ({session: session, rid: "queryAttr", filter: {queryId: id}, source: opts.source, rscFormat: true}, function (err, _opts) {
						opts.data = opts.data.concat (_opts.data);
						cb (err, opts);
					});
				} else
				if (rid == "object") {
					me.getRsc ({session: session, rid: rid, id: opts.data [0].data.classId}, function (err, _opts) {
						me.provider.getRsc ({session: session, rid: "objectAttr", filter: {objectId: id}}, function (err, _opts) {
							_.each (_opts.data, function (attrs) {
								var ca = me.project.collection ["classAttr"].get (attrs.classAttrId);
								opts.data [0].data [ca.get ("code")] = attrs ["time"] || attrs ["string"] || attrs ["number"];
							});
							cb (err, opts);
						});
					});
				} else {
					cb (null, opts);
				};
			},
			function getParent (opts, cb) {
				if (opts.data [0].data.parentId) {
					me.getRsc ({session: session, rid: rid, id: opts.data [0].data.parentId}, function (err, _opts) {
						opts.data = opts.data.concat (_opts.data);
						cb (null, opts);
					});
				} else {
					cb (null, opts);
				};
			}
		], function (err, opts) {
			cb (err ? new VError (err, "Project.getRsc error") : null, opts ? opts.data : null);
		});
	},
	/**
	 * Processing cmd
	 * @param {Client} client - Client of database.
	 * @param {Object} cmd - Command for execute.
	 * @param {Callback} cb - Callback function.
	 **/
	onCmd: function (session, cmd, cb) {
		assert (session instanceof Session);
		assert.equal (typeof (cmd), "object");
		assert.equal (typeof (cmd.data), "object");
		assert.equal (typeof (cb), "function");
		var me = this;
		if (cmd.rid == "project" && cmd.method == "auth") {
			me.auth (cmd.data, function (err, data) {
				if (err) {
					cb (new VError (err, "processCmd error"));
				} else {
					cb (null, data);
				};
			});
		} else {
			if (["class", "classAttr", "object", "view", "query", "queryAttr", "action"].indexOf (cmd.rid) > -1) {
				if (cmd.method == "create") {
					me.createRsc ({session: session, rid: cmd.rid, attrs: cmd.data}, function (err, data) {
						if (err) {
							return cb (new VError (err, "Project.onCmd error"));
						};
						cb (null, data);
					});
				} else
				if (cmd.method == "read") {
					me.getRsc ({session: session, rid: cmd.rid, id: cmd.data.id}, function (err, data) {
						if (err) {
							return cb (new VError (err, "Project.onCmd error"));
						};
						cb (null, data);
					});
				} else
				if (cmd.method == "update") {
					me.updateRsc ({session: session, rid: cmd.rid, attrs: cmd.data}, function (err, data) {
						if (err) {
							return cb (new VError (err, "Project.onCmd error"));
						};
						cb (null, data);
					});
				} else
				if (cmd.method == "delete") {
					me.removeRsc ({session: session, rid: cmd.rid, id: cmd.data.id}, function (err, data) {
						if (err) {
							return cb (new VError (err, "Project.onCmd error"));
						};
						cb (null, data);
					});
				};
			} else {
				me.getRsc (session, "class", cmd.rid, function (err, opts) {
					if (err) {
						return cb (new VError (err, "Project.onCmd error"));
					};
					if (!opts.data.length) {
						return cb (new VError ("Unknown class: %s", cmd.rid));
					};
					var fn = opts.data [0][cmd.method];
					if (!fn) {
						return cb (new VError ("Unknown method: %s.%s", cmd.rid, cmd.method));
					};
					//fn (cmd.data, function (err, opts) {
					//});
				});
			};
		};
	}
});
module.exports = Project;
