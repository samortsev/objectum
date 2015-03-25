Objectum = Backbone.Model.extend ({
	initialize: function (opts) {
		var o = this;
		o.socket = opts.socket;
		o.socket.on ("cmd", o.onCmd);
		o.Resource = Backbone.Model.extend ({
			sync: function (method, model, opts) {
				var me = this;
				o.socket.emit ("cmd", {
					pid: me.id,
					rsc: model.rsc,
					method: method,
					data: _.extend ({id: model.id || model.cid}, model.changed)
				}, function (cmd) {
					var m = o.createModel (cmd.rsc, cmd.data);
					me.collection [cmd.rsc].add (m, {merge: true});
					opts.success (m, cmd);
				});
			},
			on: function (event, cb, context) {
				var me = this;
				if (me.id) {
					o.socket.emit ("cmd", {
						pid: me.pid,
						rsc: model.rsc,
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
						rsc: model.rsc,
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
				this.rsc = "class";
			}
		});
		o.ClassAttr = o.Resource.extend ({
			initialize: function (opts) {
				this.rsc = "classAttr";
			}
		});
		o.Object = o.Resource.extend ({
			initialize: function (opts) {
				this.rsc = "object";
			}
		});
		o.View = o.Resource.extend ({
			initialize: function (opts) {
				this.rsc = "view";
			}
		});
		o.Query = o.Resource.extend ({
			initialize: function (opts) {
				this.rsc = "query";
			}
		});
		o.QueryAttr = o.Resource.extend ({
			initialize: function (opts) {
				this.rsc = "queryAttr";
			}
		});
		o.Action = o.Resource.extend ({
			initialize: function (opts) {
				this.rsc = "action";
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
				o.socket.emit ("cmd", {
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
					me.trigger ("connect");
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
				data.pid = this.id;
				switch (rsc) {
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
					var m = me.createModel (cmd.rsc, cmd.data);
					if (cmd.method == "delete") {
						me.collection [cmd.rsc].remove (m);
					} else {
						me.collection [cmd.rsc].add (m, {merge: true});
					};
				});
			},
			getRsc: function (rsc, id, cb) {
				var me = this;
				if (me.queue && cb) {
					cb ("Commands are collecting.");
					return;
				};
				var m = me.rsc [rsc].get (id);
				if (m) {
					cb (null, m);
				} else {
					o.socket.emit ("cmd", [{
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
					o.socket.emit ("cmd", [{
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
		p.once ("connect", function () {
			o.collection.project.add (p);
			cb ();
		});
	},
	onCmd: function (data) {
		var me = this;
		data = _.isArray (data) ? data : [data];
		_.each (data, function (data) {
			var project = o.collection.project.get (data.pid);
			if (project) {
				project.loadData (data);
			};
		});
		me.loadData (data);
	}
});
