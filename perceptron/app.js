
var express = require("express");
var d3 = require("d3");

var app = express();

app.use(express.static(__dirname + "/public"));

app.use("/randompoints", function (request, response) {
		var normal = d3.random.normal();
		var points = [];
		for (var i = 0; i < 20; i++) {
			points.push({ x: normal() - 1.0, y: normal() + 1.0, label: 1 });
		}
		for (var i = 0; i < 20; i++) {
			points.push({ x: normal() + 1.0, y: normal() - 1.0, label: -1 });
		}
		response.send(points);
	});

app.use(function (request, response) { 
		response.send("file not found");
	});

app.listen(8000);
