var objectum = require (__dirname + "/objectum");
objectum.addProject ({
	rootDir: "f:/p1",
	id: "p1",
	dbaPassword: "12345"
});
objectum.start (9000, function (err) {
	err ? console.error (err) : console.log ("objectum started.");
});
