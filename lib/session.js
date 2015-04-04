//
//	Copyright (C) 2015 Samortsev Dmitry (samortsev@gmail.com). All Rights Reserved.
//
var Backbone = require ("backbone");
var _ = require ("underscore");
var assert = require ("assert");
var VError = require ("verror");
var Session = Backbone.Model.extend (/** @lends Session.prototype */{
	/**
	 * Defaults
	 **/
	defaults: {
		id: null,
		ip: null,
		username: null
	},
	/**
	 * @class Session
	 * @augments Backbone.Model
	 * @constructs Session
	 */
	initialize: function () {
		assert (opts);
		var me = this;
		me.proxy = {};
	},
	getClient: function () {
		var me = this;
		me.client = me.client || me.project.createClient ();
		return me.client;
	},
	disconnectClient: function () {
		var me = this;
		if (me.client) {
			me.client.disconnect ();
		};
	},
	getProjectContext: function (pid) {
		/*
		var me = this;
		var project = me.
		var c = _.clone (me);
		var fns = ["getObject", "getClass", ""];
		_.each (fns, function (f) {
			c [f] = function (opts, cb) {
				opts.session = me;
				project [f].call (this, opts, cb);
			};
		});
		return c;
		*/
	}
});
module.exports = Session;

