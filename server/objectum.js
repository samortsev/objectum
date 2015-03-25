//
//	Copyright (C) 2015 Samortsev Dmitry (samortsev@gmail.com). All Rights Reserved.
//
var Backbone = require ("backbone");
var _ = require ("underscore");
var assert = require ("assert");
var VError = require ("verror");
var async = require ("async");
var fs = require ("fs");
var Project = require (__dirname + "/project");
var Projects = Backbone.Collection.extend ({
	model: Project
});
var Objectum = Backbone.Model.extend (/** @lends Objectum.prototype */{
	/**
	 * @class Objectum
	 * @augments Backbone.Model
	 * @constructs Objectum
	 **/
	initialize: function () {
		var me = this;
		me.Project = Project;
		me.collection = {
			"project": new Projects ()
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
			res.sendFile (__dirname + "/html/index.html");
		});
		me.app.get ("/js/*", function (req, res) {
			res.sendFile (__dirname + "/public" + req.originalUrl);
		});
	},
	createProject: function (id) {
		var me = this;
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
					me.processCmd (socket, data, cb);
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
	 * Processing command to project
	 * @param {Object} data - Queue of commands.
	 * @param {Socket-Callback} cb - Callback function.
	 **/
	processCmd: function (socket, data, scb) {
		var me = this;
//		console.log ("cookie", socket.request.headers);
		console.log (data);
		var clients = {};
		async.mapSeries (data, function (cmd, cb) {
			if (typeof (data) == "object") {
				var project = me.collection.project.get (cmd.pid);
				if (project) {
					var sid = null;
					var tokens = socket.request.headers.cookie.match ("(^|;) ?sid=([^;]*)(;|$)");
					if (tokens) {
						sid = unescape (tokens [2]);
					};
					var session = project.collection.session.get (sid);
					if (session) {
						clients [cmd.pid] = clients [cmd.pid] || project.createClient (sid);
						project.processCmd (clients [cmd.pid], cmd, cb);
					} else {
						cb (new VError ("Invalid sid: %s", sid));
					};
				} else {
					cb (new VError ("Invalid pid: %s", cmd.pid));
				};
			} else {
				cb (new VError ("Invalid cmd: %s", JSON.stringify (data)));
			};
		}, function (err, results) {
			async.each (_.map (clients, function (c) {return c;}), function (client, cb) {
				if (client.get ("inTransaction")) {
					if (err) {
						client.rollbackTransaction (function (err) {
							cb ();
						});
					} else {
						client.commitTransaction (function (err) {
							cb ();
						});
					};
				} else {
					cb ();
				};
			}, function (err) {
				_.each (clients, function (client) {
					client.disconnect ();
				});
				if (results && results.length == 1) {
					results = results [0];
				};
				scb (err ? new VError (err, "objectum.processCmd error") : results);
			});
		});
	}
});
module.exports = new Objectum ();
