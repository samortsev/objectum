Objectum = {};
Objectum.Resource = Backbone.Model.extend ({
	initialize: function (opts) {
		var me = this;
	},
	sync: function (method, model, opts) {
		console.log (method, model, opts);
	},
	fetch: function (opts) {
		console.log (opts);
	},
	save: function (attrs, opts) {
		console.log (attrs, opts);
	}
});
Objectum.Class = Objectum.Resource.extend ({
	initialize: function (opts) {
		var me = this;
	}
});
Objectum.ClassAttr = Objectum.Resource.extend ({
	initialize: function (opts) {
		var me = this;
	}
});
Objectum.Object = Objectum.Resource.extend ({
	initialize: function (opts) {
		var me = this;
	}
});
Objectum.View = Objectum.Resource.extend ({
	initialize: function (opts) {
		var me = this;
	}
});
Objectum.Query = Objectum.Resource.extend ({
	initialize: function (opts) {
		var me = this;
	}
});
Objectum.QueryAttr = Objectum.Resource.extend ({
	initialize: function (opts) {
		var me = this;
	}
});
Objectum.Action = Objectum.Resource.extend ({
	initialize: function (opts) {
		var me = this;
	}
});
Objectum.Classes = Backbone.Collection.Extend ({
	model: Objectum.Class
});
Objectum.ClassAttrs = Backbone.Collection.Extend ({
	model: Objectum.ClassAttr
});
Objectum.Objects = Backbone.Collection.Extend ({
	model: Objectum.Object
});
Objectum.Views = Backbone.Collection.Extend ({
	model: Objectum.View
});
Objectum.Queries = Backbone.Collection.Extend ({
	model: Objectum.Query
});
Objectum.QueryAttrs = Backbone.Collection.Extend ({
	model: Objectum.QueryAttr
});
Objectum.Actions = Backbone.Collection.Extend ({
	model: Objectum.Action
});
Objectum.Project = Backbone.Model.extend ({
	initialize: function (opts) {
		var me = this;
		me.socket = opts.socket;
		me.collection = {
			"class": new Objectum.Classes (),
			"classAttr": new Objectum.ClassAttrs (),
			"object": new Objectum.Objects (),
			"view": new Objectum.Views (),
			"query": new Objectum.Queries (),
			"queryAttr": new Objectum.QueryAttrs (),
			"action": new Objectum.Actions ()
		};
		me.socket.emit ("cmd", {
			pid: opts.id,
			resource: "project",
			action: "auth",
			data: {
				username: opts.username,
				password: opts.password
			}
		}, function (data) {

			console.log (data);
		});
	},
	loadData: function (data) {
		var me = this;
		data = _.isArray (data) ? data : [data];
		_.each (data, function (cmd) {
			var o = null;
			switch (cmd.rsc) {
				case "class":
					o = new Objectum.Class (cmd);
					break;
				case "classAttr":
					o = new Objectum.ClassAttr (cmd);
					break;
				case "object":
					o = new Objectum.Object (cmd);
					break;
				case "view":
					o = new Objectum.View (cmd);
					break;
				case "query":
					o = new Objectum.Query (cmd);
					break;
				case "queryAttr":
					o = new Objectum.QueryAttr (cmd);
					break;
				case "action":
					o = new Objectum.Action (cmd);
					break;
			};
			me.collection [cmd.rsc].add (o, {merge: true});
		});
	},
	getRsc: function (rsc, id, cb) {
		var me = this;
		var o = me.rsc [rsc].get (id);
		if (o) {
			cb (null, o);
		} else {
			me.socket.emit ("cmd", [{
				pid: me.id,
				rsc: rsc,
				action: "read",
				data: {
					id: id
				}
			}], function (data) {
				me.loadData (data);
				me.getRsc (rsc, id, cb);
			});
		};
	},
	removeRsc: function (rsc, id, cb) {
		var me = this;
		var o = me.collection [rsc].get (id);
		if (o) {
			o.destroy ({wait: true, success: function (model, response) {
				cb ();
			}});
		} else {
			me.socket.emit ("cmd", [{
				pid: me.id,
				rsc: rsc,
				action: "delete",
				data: {
					id: id
				}
			}], function (data) {
				cb ();
			});
		};
	},
	getClass: function (id, cb) {
		this.getRsc ("class", id, cb);
	},
	getClassAttr: function (id, cb) {
		this.getRsc ("classAttr", id, cb);
	},
	getObject: function (id, cb) {
		this.getRsc ("object", id, cb);
	},
	getView: function (id, cb) {
		this.getRsc ("view", id, cb);
	},
	getQuery: function (id, cb) {
		this.getRsc ("query", id, cb);
	},
	getQueryAttr: function (id, cb) {
		this.getRsc ("queryAttr", id, cb);
	},
	getAction: function (id, cb) {
		this.getRsc ("action", id, cb);
	},
	removeClass: function (id, cb) {
		this.removeRsc ("class", id, cb);
	},
	removeClassAttr: function (id, cb) {
		this.removeRsc ("classAttr", id, cb);
	},
	removeObject: function (id, cb) {
		this.removeRsc ("object", id, cb);
	},
	removeView: function (id, cb) {
		this.removeRsc ("view", id, cb);
	},
	removeQuery: function (id, cb) {
		this.removeRsc ("query", id, cb);
	},
	removeQueryAttr: function (id, cb) {
		this.removeRsc ("queryAttr", id, cb);
	},
	removeAction: function (id, cb) {
		this.removeRsc ("action", id, cb);
	},
	multi: function (description) {
		var me = this;
		this.queue = [{
			pid: me.id,
			rsc: "project",
			action: "startTransaction",
			data: {
				description: description
			}
		}];
	},
	exec: function () {
		var me = this;
		this.queue.push ({
			pid: me.id,
			rsc: "project",
			action: "commitTransaction"
		});
		me.socket.emit ("cmd", me.queue, function (data) {
			cb ();
		});
	},
	discard: function () {
		this.queue = null;
	}
});
var $o = new Objectum.Project ({
	socket: socket,
	id: "prj",
	username: "admin",
	password: "d033e22ae348aeb5660fc2140aec35850c4da997"
}, function (err) {
	if (err) {
		console.error (err);
	} else {
		$o.getClass ("ose.menu", function (err, cls) {
			err ? console.error (err) : console.log (cls);
		});
	};
});
