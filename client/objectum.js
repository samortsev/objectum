Objectum = {};
Objectum.Resource = Backbone.Model.extend ({
	initialize: function (opts) {
		var me = this;
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
Objectum.Classes = Backbone.Collection.Extend ({
	model: Objectum.Class
});
Objectum.ClassAttrs = Backbone.Collection.Extend ({
	model: Objectum.ClassAttr
});
Objectum.Objects = Backbone.Collection.Extend ({
	model: Objectum.Object
});
Objectum.Project = Backbone.Model.extend ({
	initialize: function (opts) {
		var me = this;
		me.socket = opts.socket;
		me.collection = {
			"class": new Objectum.Classes (),
			"classAttr": new Objectum.ClassAttrs (),
			"object": new Objectum.Objects ()
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
				default:
					throw new Error ("Unknown resource: %s in cmd: %s", cmd.rsc, cmd);
			};
			me.collection [cmd.rsc].add (o, {merge: true});
		});
	},
	getClass: function (id, cb) {
		var me = this;
		var o = me.rsc ["class"].get (id);
		if (o) {
			cb (null, o);
		} else {
			me.socket.emit ("cmd", [{
				pid: me.id,
				rsc: "class",
				action: "read",
				data: {
					id: id
				}
			}], function (data) {
				me.loadData (data);
				me.getClass (id, cb);
			});
		};
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
