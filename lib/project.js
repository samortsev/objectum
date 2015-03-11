//
//	Copyright (C) 2015 Samortsev Dmitry (samortsev@gmail.com). All Rights Reserved.
//
var Backbone = require ("backbone");
var _ = require ("underscore");
var assert = require ("assert");
var VError = require ("verror");
var async = require ("async");
var Project = Backbone.Model.extend (/** @lends Project.prototype */{
	/**
	 * @class Project
	 * @augments Backbone.Model
	 * @constructs Project
	 */
	initialize: function (opts) {
		assert (opts);
		assert.equal (typeof (opts.rootDir), "string");
		assert.equal (typeof (opts.code), "string");
		assert.equal (typeof (opts.dbaPassword), "string");
		var me = this;
		me.Postgres = require (__dirname + "/postgres");
		_.extend (me, opts);
		_.defaults (me, {
			adminPassword: "d033e22ae348aeb5660fc2140aec35850c4da997",
			anonymous: 1,
			database: "postgres",
			host: "127.0.0.1",
			port: 5432,
			dbaUsername: "postgres",
			dbUsername: opts.code,
			dbPassword: opts.code,
			dbDir: me.rootDir + "/db"
		});
	},
	/**
	 * Create database client
	 * @return {Object} Client object
	 **/
	createClient: function () {
		var me = this;
		if (me.database == "postgres") {
			var client = new me.Postgres ({project: me});
			return client;
		};
		throw new VError ("Unsupported database %s", me.database);
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
	}
});
module.exports = Project;
