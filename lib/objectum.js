//
//	Copyright (C) 2015 Samortsev Dmitry (samortsev@gmail.com). All Rights Reserved.
//
var Backbone = require ("backbone");
var _ = require ("underscore");
var assert = require ("assert");
var VError = require ("verror");
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
	}
});
module.exports = Objectum;
