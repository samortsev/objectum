//
//	Copyright (C) 2015 Samortsev Dmitry (samortsev@gmail.com). All Rights Reserved.
//
var Backbone = require ("backbone");
var _ = require ("underscore");
var assert = require ("assert");
var VError = require ("verror");
var Session = Backbone.Model.extend (/** @lends Session.prototype */{
	/**
	 * @class Session
	 * @augments Backbone.Model
	 * @constructs Session
	 */
	initialize: function (opts) {
		assert (opts);
		var me = this;
	}
});
module.exports = Session;

