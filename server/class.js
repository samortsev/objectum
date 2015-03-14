//
//	Copyright (C) 2015 Samortsev Dmitry (samortsev@gmail.com). All Rights Reserved.
//
var Backbone = require ("backbone");
var _ = require ("underscore");
var assert = require ("assert");
var VError = require ("verror");
var Class = Backbone.Model.extend (/** @lends Class.prototype */{
	/**
	 * Defaults
	 **/
	defaults: {
		id: null,
		parent_id: null,
		name: null,
		code: null,
		description: null,
		namespace: false,
		opts: null,
		start_id: null,
		end_id: null,
		project_id: null,
		record_id: null
	},
	/**
	 * @class Class
	 * @augments Backbone.Model
	 * @constructs Class
	 */
	initialize: function (opts) {
		assert (opts);
		var me = this;
	}
});
module.exports = Class;
