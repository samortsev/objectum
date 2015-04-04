var Backbone = require ("backbone");
var _ = require ("underscore");
var assert = require ("assert");
var VError = require ("verror");
var async = require ("async");
var fs = require ("fs");
var path = require ("path");
var Objectum = Backbone.Model.extend (/** @lends Objectum.prototype */{
	/**
	 * @class Objectum
	 * @augments Backbone.Model
	 * @constructs Objectum
	 **/
	initialize: function () {
		var me = this;
		me.Project = require (__dirname + "/project");
		me.Projects = Backbone.Collection.extend ({
			model: me.Project
		});
		me.collection = {
			"project": new me.Projects ()
		};
		me.app = require ("express")();
		me.app.get ("/", function (req, res) {
			res.send ("It works!");
		});
	},
	addProject: function (data) {
		var me = this;
		me.collection.project.add (data);
		me.app.get ("/" + data.id, function (req, res) {
			res.sendFile (path.join (data.rootDir, "client/index.html"));
		});
		_.each (["js", "css", "images"], function (folder) {
			me.app.get ("/" + data.id + "/" + folder + "/*", function (req, res) {
				res.sendFile (path.join (data.rootDir, "/client/" + folder + "/" + req.url.substring (req.url.lastIndexOf ("/") + 1)));
			});
		});
	},
	/**
	 * Called after doing asynchronous stuff.
	 * @name Callback
	 * @function
	 * @param {Error} err - Information about the error.
	 * @param {Object} opts - Object with results.
	 **/
	/**
	 * Start web server
	 * @param {Number} port - Web server port.	
	 * @param {Callback} cb - Callback function.
	 **/
	start: function (port, cb) {
		assert.equal (typeof (port), "number");
		assert.equal (typeof (cb), "function");
		var me = this;
		me.server = require ("http").Server (me.app);
		var io = require ("socket.io")(me.server);
		io.on ("connection", function (socket) {
			socket.on ("cmd", function (data, cb) {
				if (typeof (data) == "object") {
					data = _.isArray (data) ? data : [data];
					me.onCmd (socket, data, cb);
				} else {
					cb (new VError ("Invalid cmd: %s", JSON.stringify (data)));
				};
			});
		});
		me.server.listen (port, cb);
	},
	/**
	 * Called after processing request.
	 * @name Socket-Callback
	 * @function
	 * @param {Object} res - Object with response.
	 * @param {Object} res.err - Error in processing request.
	 **/
	/**
	 * Processing commands to project
	 * @param {Object} data - Queue of commands.
	 * @param {Socket-Callback} cb - Callback function.
	 **/
	onCmd: function (socket, data, cb) {
		var me = this;
		console.log (data);
		var pid = data [0].pid;
		var project = me.collection.project.get (pid);
		if (!project) {
			return cb (new VError ("Invalid pid: %s", pid));
		};
		var sid = null;
		var tokens = socket.request.headers.cookie.match ("(^|;) ?" + pid + "-sid=([^;]*)(;|$)");
		if (tokens) {
			sid = unescape (tokens [2]);
		};
		project.rm.getRsc ({rid: "session", filter: {id: sid}}, function (err, opts) {
			if (err) {
				return cb (new VError (err, "Objectum.onCmd error"));
			};
			if (!opts.data.length) {
				return cb (new VError (err, "Invalid sid: %s", sid));
			};
			var session = opts.data [0];
			session.project = project;
			async.mapSeries (data, function (cmd, cb) {
				if (typeof (cmd) == "object" && cmd.rid && cmd.method && cmd.data) {
					if (cmd.pid != pid) {
						return cb (new VError ("Different pid in one queue"));
					};
					project.onCmd (session, cmd, cb);
				} else {
					cb (new VError ("Invalid cmd: %s", JSON.stringify (data)));
				};
			}, function (err, results) {
				async.series ([
					function (cb) {
						if (session.client && session.client.get ("inTransaction")) {
							if (err) {
								session.client.rollbackTransaction (function (err) {
									cb ();
								});
							} else {
								session.client.commitTransaction (function (err) {
									cb ();
								});
							};
						} else {
							cb ();
						};
					}
				], function (err) {
					session.disconnectClient ();
					cb (err ? new VError (err, "objectum.onCmd error") : results);
				});
			});
		});
	}
});
module.exports = new Objectum ();
