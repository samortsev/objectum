var Backbone = require ("backbone");
var _ = require ("underscore");
var assert = require ("assert");
var VError = require ("verror");
var async = require ("async");
var Resource = Backbone.Model.extend ({
	sync: function (method, model, opts) {
		var me = this;
	},
	on: function (event, cb, context) {
		var me = this;
		if (me.id) {
		};
		Backbone.Model.prototype.on.apply (me, arguments);
	},
	off: function (event, callback, context) {
		var me = this;
		if (me.id) {
		};
		Backbone.Model.prototype.off.apply (me, arguments);
	},
	toJSON: function () {
		var me = this;
		var r = Backbone.Model.prototype.toJSON.apply (me, arguments);
		r.id = me.id;
		return {
			pid: me.project.id,
			rid: me.rid,
			data: r
		};
	}
});
var Class = Resource.extend ({
	initialize: function (opts) {
		this.rid = "class";
		this.project = opts.project;
	},
	getAttrs: function () {
		var me = this;
		var attrs = me.project.collection ["classAttr"].where ({classId: me.id});
		if (me.get ("parentId")) {
			var cls = me.project.collection ["class"].get (me.get ("parentId"));
			attrs = attrs.concat (cls.getAttrs ());
		};
		return attrs;
	}
});
var ClassAttr = Resource.extend ({
	initialize: function (opts) {
		this.rid = "classAttr";
	}
});
var Object = Resource.extend ({
	initialize: function (opts) {
		this.rid = "object";
	}
});
var View = Resource.extend ({
	initialize: function (opts) {
		this.rid = "view";
	}
});
var Query = Resource.extend ({
	initialize: function (opts) {
		this.rid = "query";
	}
});
var QueryAttr = Resource.extend ({
	initialize: function (opts) {
		this.rid = "queryAttr";
	}
});
var Action = Resource.extend ({
	initialize: function (opts) {
		this.rid = "action";
	}
});
var ResourceManager = Backbone.Model.extend ({
	initialize: function (opts) {
		var me = this;
		me.project = opts.project;
		me.collection = {
			"class": new Classes (),
			"classAttr": new ClassAttrs (),
			"view": new Views (),
			"query": new Queries (),
			"queryAttr": new QueryAttrs (),
			"action": new Actions (),
			"session": new Sessions (),
			"project": new Projects (),
			"session": new Sessions ()
		};
		me.redis = require ("redis").createClient ();
		me.redisPub = require ("redis").createClient ();
		me.redisSub = require ("redis").createClient ();
		me.redisSub.on ("cmd", me.onCmd);
		me.ridTable = {
			"class": "_class",
			"classAttr": "_class_attr",
			"object": "_object",
			"objectAttr": "_object_attr",
			"view": "_view",
			"query": "_query",
			"queryAttr": "_query_attr",
			"action": "_action"
		};
		me.ridFields = {
			"class": {
				"id": "_id",
				"parentId": "_parent_id",
				"name": "_name",
				"code": "_code",
				"description": "_description",
				"namespace": "_namespace"
			},
			"classAttr": {
				"id": "_id",
				"classId": "_class_id", 
				"name": "_name",
				"code": "_code",
				"description": "_description",
				"typeId": "_type_id",
				"notNull": "_opts",
				"secure": "_opts",
				"removeRule": "_opts",
				"index": "_opts"
			},
			"object": {
				"id": "_id",
				"classId": "_class_id"
			},
			"objectAttr": {
				"id": "_id",
				"objectId": "_object_id",
				"classAttrId": "_class_attr_id",
				"string": "_string",
				"number": "_number",
				"time": "_time"
			},
			"view": {
				"id": "_id",
				"parentId": "_parent_id", 
				"name": "_name",
				"code": "_code",
				"description": "_description",
				"layout": "_layout",
				"iconCls": "_icon_cls"
			},
			"query": {
				"id": "_id",
				"parentId": "_parent_id", 
				"name": "_name",
				"code": "_code",
				"description": "_description",
				"query": "_query"
			},
			"queryAttr": {
				"id": "_id",
				"queryId": "_query_id", 
				"name": "_name",
				"code": "_code",
				"description": "_description",
				"classId": "_class_id",
				"classAttrId": "_class_attr_id",
				"order": "_order",
				"area": "_area",
				"width": "_width"
			},
			"action": {
				"id": "_id",
				"classId": "_class_id", 
				"name": "_name",
				"code": "_code",
				"description": "_description",
				"body": "_body"
			}
		};
	},
	loadData: function (data) {
		var me = this;
		data = _.isArray (data) ? data : [data];
		_.each (data, function (cmd) {
			var m = me.createModel (cmd.rid, cmd.data);
			if (cmd.method == "delete") {
				me.collection [cmd.rid].remove (m);
			} else {
				me.collection [cmd.rid].add (m, {merge: true});
			};
		});
	},
	onCmd: function (channel, msg) {
		var me = this;
		if (channel != me.project.id) {
			return;
		};
		var data = JSON.parse (msg);
		me.loadData (data);
	},
	createModel: function (rid, data) {
		var me = this;
		var m;
		data.pid = me.project.id;
		switch (rid) {
			case "class":
				m = new Class (data);
				break;
			case "classAttr":
				m = new ClassAttr (data);
				break;
			case "object":
				m = new Object (data);
				break;
			case "view":
				m = new View (data);
				break;
			case "query":
				m = new Query (data);
				break;
			case "queryAttr":
				m = new QueryAttr (data);
				break;
			case "action":
				m = new Action (data);
				break;
			case "session":
				m = new Session (data);
				break;
			default:
				// class objects
		};
		return m;
	},
	createRsc: function (opts, cb) {
		var me = this;
		var session = opts.session;
		var rid = opts.rid;
		var attrs = opts.attrs;
		async.series ([
			function (cb) {
				if (rid == "session") {
					me.collection ["session"].add (attrs);
					redis.hset (me.project.id + "-" + rid, {id: data.id}, attrs, cb);
				} else {
					cb ();
				};
			}
		], function (err) {
			cb (err ? new VError (err, "ResourceManager.createRsc error") : null);
		});
	},
	// Загружает ресурсы удовлетворяющие условию filter ({id: id}, {classId: classId}, {queryId: queryId})
	getRsc: function (opts, cb) {
		var me = this;
		var session = opts.session;
		var rid = opts.rid;
		var filter = opts.filter;
		var source = opts.source;
		var rscFormat = opts.rscFormat;
		async.waterfall ([
			function (cb) {
				if (me.collection [rid]) {
					var data = me.collection [rid].where (filter);
					if (data.length || source == "local") {
						cb (null, {
							source: "local", data: data
						});
					} else {
						cb (null, {});
					};
				} else {
					cb (null, {});
				};
			},
			function (opts, cb) {
				if (opts.source) {
					cb (null, opts);
				} else {
					me.redis.hget (me.project.id + "-" + rid, filter, function (err, result) {
						cb (err, result ? {
							source: "cache", data: JSON.parse (result)
						} : {});
					});
				};
			},
			function (opts, cb) {
				if (opts.source) {
					return cb (null, opts);
				};
				if (rid == "session") {
					return cb ("Unknown sid");
				};
				var filterStr = _.map (filter, function (value, attr) {
					return me.ridFields [rid][attr] + "=" + value;
				}).join ("and");
				session.getClient ().query (
					"select * from " + me.ridTable [rid] + " where " + filterStr + " and _end_id is null"
				, function (err, result) {
					if (err) {
						cb (err);
					} else {
						var data = [];
						_.each (result.rows, function (row) {
							var rsc = {}, opts = row.opts ? JSON.parse (row.opts) : {};
							_.each (me.ridFields [rid], function (field, attr) {
								if (field == "_opts") {
									if (opts [attr]) {
										rsc [attr] = opts [attr];
									};
								} else {
									if (row [field]) {
										rsc [attr] = row [field];
									};
								};
							});
							data.push ({
								pid: me.project.id,
								rid: rid,
								data: rsc
							});
						});
						cb (null, {source: "db", data: data});
					};
				});
			},
			function (opts, cb) {
				if (me.collection [rid] && opts.source != "local") {
					me.collection [rid].add (opts.data);
				};
				if (opts.source == "db") {
					redis.hset (me.project.id + "-" + rid, filter, opts.data, function (err) {
						cb (err, opts);
					});
				} else {
					cb (null, opts);
				};
			}
		], function (err, opts) {
			if (!_.isArray (opts.data)) {
				opts.data = [opts.data];
			};
			if (rscFormat) {
				opts.data = _.map (opts.data, function (attrs) {
					return {rid: rid, data: attrs};
				});
			};
			cb (err ? new VError (err, "ResourceManager.getRsc error") : null, opts);
		});
	},
	removeRsc: function (opts, cb) {
		var me = this;
	},
	updateRsc: function (opts, cb) {
		var me = this;
	}
});
module.exports = ResourceManager;

