Objectum = {};
Objectum.Resource = Backbone.Model.extend ({
	sync: function (method, model, opts) {
		var me = this;
		Objectum.socket.emit ("cmd", {
			pid: me.id,
			rsc: model.rsc,
			method: method,
			data: _.extend ({id: model.id || model.cid}, model.changed)
		}, function (cmd) {
			var m = Objectum.createModel (cmd.rsc, cmd.data);
			me.collection [cmd.rsc].add (m, {merge: true});
			opts.success (m, cmd);
		});
	}
});
Objectum.Class = Objectum.Resource.extend ({
	initialize: function (opts) {
		this.rsc = "class";
	}
});
Objectum.ClassAttr = Objectum.Resource.extend ({
	initialize: function (opts) {
		this.rsc = "classAttr";
	}
});
Objectum.Object = Objectum.Resource.extend ({
	initialize: function (opts) {
		this.rsc = "object";
	}
});
Objectum.View = Objectum.Resource.extend ({
	initialize: function (opts) {
		this.rsc = "view";
	}
});
Objectum.Query = Objectum.Resource.extend ({
	initialize: function (opts) {
		this.rsc = "query";
	}
});
Objectum.QueryAttr = Objectum.Resource.extend ({
	initialize: function (opts) {
		this.rsc = "queryAttr";
	}
});
Objectum.Action = Objectum.Resource.extend ({
	initialize: function (opts) {
		this.rsc = "action";
	}
});
Objectum.Classes = Backbone.Collection.extend ({
	model: Objectum.Class
});
Objectum.ClassAttrs = Backbone.Collection.extend ({
	model: Objectum.ClassAttr
});
Objectum.Objects = Backbone.Collection.extend ({
	model: Objectum.Object
});
Objectum.Views = Backbone.Collection.extend ({
	model: Objectum.View
});
Objectum.Queries = Backbone.Collection.extend ({
	model: Objectum.Query
});
Objectum.QueryAttrs = Backbone.Collection.extend ({
	model: Objectum.QueryAttr
});
Objectum.Actions = Backbone.Collection.extend ({
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
			rsc: "project",
			method: "auth",
			data: {
				username: opts.username,
				password: opts.password,
				sid: me.getSessionId ()
			}
		}, function (data) {
			me.setSessionId (data.sid);
			Objectum.sid = data.sid;
		});
	},
	setSessionId: function (sid) {
		var cookieString = "sid=" + sid;
		var expires = new Date ();
		expires.setDate (expires.getDate () + 30);
		cookieString += "; expires=" + expires.toGMTString ();
		document.cookie = cookieString;
	},
	getSessionId: function () {
		var results = document.cookie.match ("(^|;) ?sid=([^;]*)(;|$)");
		if (results) {
			return (unescape (results [2]));
		} else {
			return null;
		};
	},
	removeSessionId: function () {
		var cookieDate = new Date ();
		cookieDate.setTime (cookieDate.getTime () - 1);
		document.cookie = "sid=; expires=" + cookieDate.toGMTString ();
	},
	createModel: function (rsc, data) {
		var m;
		switch (rsc) {
			case "class":
				m = new Objectum.Class (data);
				break;
			case "classAttr":
				m = new Objectum.ClassAttr (data);
				break;
			case "object":
				m = new Objectum.Object (data);
				break;
			case "view":
				m = new Objectum.View (data);
				break;
			case "query":
				m = new Objectum.Query (data);
				break;
			case "queryAttr":
				m = new Objectum.QueryAttr (data);
				break;
			case "action":
				m = new Objectum.Action (data);
				break;
		};
		return m;
	},
	loadData: function (data) {
		var me = this;
		data = _.isArray (data) ? data : [data];
		_.each (data, function (cmd) {
			var m = me.createModel (cmd.rsc, cmd.data);
			me.collection [cmd.rsc].add (m, {merge: true});
		});
	},
	getRsc: function (rsc, id, cb) {
		var me = this;
		if (me.queue && cb) {
			cb ("Commands is collecting.");
			return;
		};
		var m = me.rsc [rsc].get (id);
		if (m) {
			cb (null, m);
		} else {
			me.socket.emit ("cmd", [{
				pid: me.id,
				rsc: rsc,
				method: "read",
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
		if (me.queue && cb) {
			cb ("Commands is collecting.");
			return;
		};
		var m = me.collection [rsc].get (id);
		if (m) {
			m.destroy ({wait: true, success: function (model, response) {
				cb ();
			}});
		} else {
			me.socket.emit ("cmd", [{
				pid: me.id,
				rsc: rsc,
				method: "delete",
				data: {
					id: id
				}
			}], function (data) {
				cb ();
			});
		};
	},
	createRsc: function (rsc, data, cb) {
		var me = this;
		if (me.queue && cb) {
			cb ("Commands is collecting.");
			return;
		};
		var m = me.createModel (rsc, data);
		m.save ({success: function (model, response) {
			cb (null, m);
		}});
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
	createClass: function (attrs, cb) {
		this.createRsc ("class", attrs, cb);
	},
	createClassAttr: function (attrs, cb) {
		this.createRsc ("classAttr", attrs, cb);
	},
	createObject: function (attrs, cb) {
		this.createRsc ("object", attrs, cb);
	},
	createView: function (attrs, cb) {
		this.createRsc ("view", attrs, cb);
	},
	createQuery: function (attrs, cb) {
		this.createRsc ("query", attrs, cb);
	},
	createQueryAttr: function (attrs, cb) {
		this.createRsc ("queryAttr", attrs, cb);
	},
	createAction: function (attrs, cb) {
		this.createRsc ("action", attrs, cb);
	},
	multi: function (description) {
		this.queue = [{
			pid: me.id,
			rsc: "session",
			method: "multi",
			data: {
				description: description
			}
		}];
	},
	exec: function (cb) {
		var me = this;
		me.socket.emit ("cmd", me.queue, function (data) {
			me.loadData (data);
			cb ();
		});
	},
	discard: function () {
		this.queue = null;
	}
});
