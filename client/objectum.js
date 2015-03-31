Objectum = Backbone.Model.extend ({
	initialize: function (opts) {
		var o = this;
		o.socket = opts.socket;
		o.socket.on ("cmd", o.onCmd);
		o.Resource = Backbone.Model.extend ({
			initialize: function (opts) {
				var me = this;
				me.serverMethods = [];
			},
			sync: function (method, model, opts) {
				var me = this;
				o.socket.emit ("cmd", {
					pid: me.id,
					rid: model.rid,
					method: method,
					data: _.extend ({id: model.id || model.cid}, model.changed)
				}, function (cmd) {
					var m = o.createModel (cmd.rid, cmd.data);
					me.collection [cmd.rid].add (m, {merge: true});
					opts.success (m, cmd);
				});
			},
			on: function (event, cb, context) {
				var me = this;
				if (me.id) {
					o.socket.emit ("cmd", {
						pid: me.pid,
						rid: model.rid,
						method: "on",
						data: {
							id: me.id
						}
					});
				};
				Backbone.Model.prototype.on.apply (me, arguments);
			},
			off: function (event, callback, context) {
				var me = this;
				if (me.id) {
					o.socket.emit ("cmd", {
						pid: me.pid,
						rid: model.rid,
						method: "off",
						data: {
							id: me.id
						}
					});
				};
				Backbone.Model.prototype.off.apply (me, arguments);
			}
		});
		o.Class = o.Resource.extend ({
			initialize: function (opts) {
				this.rid = "class";
			}
		});
		o.ClassAttr = o.Resource.extend ({
			initialize: function (opts) {
				this.rid = "classAttr";
			}
		});
		o.Object = o.Resource.extend ({
			initialize: function (opts) {
				this.rid = "object";
			}
		});
		o.View = o.Resource.extend ({
			initialize: function (opts) {
				this.rid = "view";
			}
		});
		o.Query = o.Resource.extend ({
			initialize: function (opts) {
				this.rid = "query";
			}
		});
		o.QueryAttr = o.Resource.extend ({
			initialize: function (opts) {
				this.rid = "queryAttr";
			}
		});
		o.Action = o.Resource.extend ({
			initialize: function (opts) {
				this.rid = "action";
			}
		});
		o.Classes = Backbone.Collection.extend ({
			model: o.Class
		});
		o.ClassAttrs = Backbone.Collection.extend ({
			model: o.ClassAttr
		});
		o.Objects = Backbone.Collection.extend ({
			model: o.Object
		});
		o.Views = Backbone.Collection.extend ({
			model: o.View
		});
		o.Queries = Backbone.Collection.extend ({
			model: o.Query
		});
		o.QueryAttrs = Backbone.Collection.extend ({
			model: o.QueryAttr
		});
		o.Actions = Backbone.Collection.extend ({
			model: o.Action
		});
		o.checkData: function (data, cb, next) {
			if (!data) {
				return cb (new Error ("data not exists"));
			};
			if (data.jse_summary) {
				return cb (new Error (data));
			};
			next (data);
		},
		o.Project = Backbone.Model.extend ({
			initialize: function (opts) {
				var me = this;
				me.collection = {
					"class": new o.Classes (),
					"classAttr": new o.ClassAttrs (),
					"object": new o.Objects (),
					"view": new o.Views (),
					"query": new o.Queries (),
					"queryAttr": new o.QueryAttrs (),
					"action": new o.Actions ()
				};
			},
			connect: function (cb) {
				var me = this;
				o.socket.emit ("cmd", {
					pid: me.id,
					rid: "project",
					method: "auth",
					data: {
						username: me.get ("username"),
						password: me.get ("password")
					}
				}, o.checkData (data, cb, function (data) {
					me.setSessionId (opts.id, data.sid);
					cb ();
				}));
			},
			setSessionId: function (pid, sid) {
				var cookieString = pid + "-sid=" + sid;
				var expires = new Date ();
				expires.setDate (expires.getDate () + 30);
				cookieString += "; expires=" + expires.toGMTString ();
				document.cookie = cookieString;
			},
			getSessionId: function (pid) {
				var results = document.cookie.match ("(^|;) ?" + pid + "-sid=([^;]*)(;|$)");
				if (results) {
					return (unescape (results [2]));
				} else {
					return null;
				};
			},
			removeSessionId: function (pid) {
				var cookieDate = new Date ();
				cookieDate.setTime (cookieDate.getTime () - 1);
				document.cookie = pid + "-sid=; expires=" + cookieDate.toGMTString ();
			},
			createModel: function (rid, data) {
				var m;
				data.pid = this.id;
				switch (rid) {
					case "class":
						m = new o.Class (data);
						break;
					case "classAttr":
						m = new o.ClassAttr (data);
						break;
					case "object":
						m = new o.Object (data);
						break;
					case "view":
						m = new o.View (data);
						break;
					case "query":
						m = new o.Query (data);
						break;
					case "queryAttr":
						m = new o.QueryAttr (data);
						break;
					case "action":
						m = new o.Action (data);
						break;
				};
				return m;
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
			getRsc: function (rid, id, cb) {
				var me = this;
				if (me.queue && cb) {
					cb ("Commands are collecting.");
					return;
				};
				var m = me.collection [rid].get (id);
				if (m) {
					cb (null, m);
				} else {
					o.socket.emit ("cmd", [{
						pid: me.id,
						rid: rid,
						method: "read",
						data: {
							id: id
						}
					}], function (data) {
						me.loadData (data);
						me.getRsc (rid, id, cb);
					});
				};
			},
			removeRsc: function (rid, id, cb) {
				var me = this;
				if (me.queue && cb) {
					cb ("Commands are collecting.");
					return;
				};
				var m = me.collection [rid].get (id);
				if (m) {
					m.destroy ({wait: true, success: function (model, response) {
						cb ();
					}});
				} else {
					o.socket.emit ("cmd", [{
						pid: me.id,
						rid: rid,
						method: "delete",
						data: {
							id: id
						}
					}], function (data) {
						cb ();
					});
				};
			},
			createRsc: function (rid, data, cb) {
				var me = this;
				if (me.queue && cb) {
					cb ("Commands are collecting.");
					return;
				};
				var m = me.createModel (rid, data);
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
					rid: "session",
					method: "multi",
					data: {
						description: description
					}
				}];
			},
			exec: function (cb) {
				var me = this;
				o.socket.emit ("cmd", me.queue, function (data) {
					me.loadData (data);
					cb ();
				});
			},
			discard: function () {
				this.queue = null;
			}
		});
		o.Projects = Backbone.Collection.extend ({
			model: o.Project
		});
		o.collection = {
			project: new o.Projects ()
		};
	},
	connect: function (opts, cb) {
		var o = this;
		var p = new o.Project (opts);
		p.connect (function (err) {
			if (err) {
				return cb (new Error (err));
			};
			o.collection.project.add (p);
			cb ();
		});
	},
	onCmd: function (data) {
		var me = this;
		data = _.isArray (data) ? data : [data];
		_.each (data, function (data) {
			var project = o.collection.project.get (data.pid);
			if (!project) {
				throw new Error ("Unknown project: " + data.pid);
			};
			project.loadData (data);
		});
		me.loadData (data);
	}
});


