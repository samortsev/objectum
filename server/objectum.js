//
//	Copyright (C) 2015 Samortsev Dmitry (samortsev@gmail.com). All Rights Reserved.
//
var Backbone = require ("backbone");
var _ = require ("underscore");
var assert = require ("assert");
var VError = require ("verror");
var async = require ("async");
var Objectum = Backbone.Model.extend (/** @lends Objectum.prototype */{
	/**
	 * @class Objectum
	 * @augments Backbone.Model
	 * @constructs Objectum
	 **/
	initialize: function () {
		var me = this;
		me.Project = require (__dirname + "/project"),
		me.Projects = Backbone.Collection.extend ({
			model: me.Project
		});
		me.projects = new me.Projects ();
		me.Session = require (__dirname + "/session"),
		me.Sessions = Backbone.Collection.extend ({
			model: me.Session
		});
		me.sessions = new me.Sessions ();
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
		var app = require ("express")();
		app.get ("/", function (req, res) {
			res.sendFile (__dirname + "/html/index.html");
		});
		var server = require ("http").Server (app);
		var io = require ("socket.io")(server);
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
		server.listen (port, cb);
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
	processCmd: function (socket, data, cb) {
		var clients = {};
		async.mapSeries (data, function (cmd, cb) {
			if (typeof (data) == "object") {
				var project = me.projects.get (cmd.pid);
				if (project) {
					cmd.sid = socket.request.headers.cookie;
					clients [cmd.pid] = clients [cmd.pid] || project.createClient ();
					project.processCmd (clients [cmd.pid], cmd, cb);
				} else {
					cb (new VError ("Invalid pid: %s", cmd.pid));
				};
			} else {
				cb (new VError ("Invalid cmd: %s", JSON.stringify (data)));
			};
		}, function (err, results) {
			_.each (clients, function (client) {
				client.disconnect ();
			});
			cb (err ? new VError (err, "objectum.processCmd error") : results);
		});
	}
});
module.exports = new Objectum ();
