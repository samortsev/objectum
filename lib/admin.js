//
//	Copyright (C) 2015 Samortsev Dmitry (samortsev@gmail.com). All Rights Reserved.
//
var Backbone = require ("backbone");
var _ = require ("underscore");
var assert = require ("assert");
var VError = require ("verror");
var Admin = Backbone.Model.extend (/** @lends Admin.prototype */{
	/**
	 * @class Admin
	 * @augments Backbone.Model
	 * @constructs Admin
	 */
	initialize: function (opts) {
		assert (opts);
		var me = this;
	}
});
module.exports = Admin;


