var learningRate = 0.05;
var normalGenerator = d3.random.normal();
var weights = { x: normalGenerator(), y: normalGenerator() };
var height = 600;
var width = 600;
var svg = d3.select("#display").append("svg").attr("height", height).attr("width", width);
var xScale = d3.scale.linear().domain([-5, 5]).range([0, width]);
var yScale = d3.scale.linear().domain([-5, 5]).range([height, 0]);
var inverseXScale = d3.scale.linear().domain([0, width]).range([-5, 5]);
var fill = function(point) { if (point.label > 0) { return "#88c"; } else { return "#c88"; } };
var stroke = function(point) {
  var prediction = point.x * weights.x + point.y * weights.y;
  if (prediction * point.label > 0) { return "none"; } else { return "black"; }
};

// Axes
svg.append("line").attr("x1", xScale(0)).attr("x2", xScale(0))
  .attr("y1", 0).attr("y2", height)
  .style("stroke", "#cccccc");

svg.append("line").attr("y1", yScale(0)).attr("y2", yScale(0))
  .attr("x1", 0).attr("x2", width)
  .style("stroke", "#cccccc");

var classifier = svg.append("line")
  .attr("x1", xScale(0)).attr("y1", yScale(0))
  .attr("x2", xScale(weights.x)).attr("y2", yScale(weights.y))
  .attr("stroke", "black").attr("stroke-width", 3);

var separator = svg.append("line")
  .attr("x1", 0).attr("x2", width)
  .attr("y1", yScale( -weights.x * inverseXScale(0) / weights.y ))
  .attr("y2", yScale( -weights.x * inverseXScale(width) / weights.y ))
  .style("stroke", "#aaa");

var points;

var generate_random_points = function() {
  var normal = d3.random.normal();
  var points = [];
  for (var i = 0; i < 20; i++) {
    points.push({ x: normal() - 1.0, y: normal() + 1.0, label: 1 });
  }
  for (var i = 0; i < 20; i++) {
    points.push({ x: normal() + 1.0, y: normal() - 1.0, label: -1 });
  }
  return points;
};

var trainingData = generate_random_points();

points = svg.selectAll("circle").data(trainingData).enter().append("circle")
 .attr("cx", function(point) { return xScale(point.x); })
 .attr("cy", function(point) { return yScale(point.y); })
 .attr("r", 5)
 .style("stroke-width", 2)
 .style("fill", fill)
 .style("stroke", stroke);

// Perceptron update rule:
var update = function(point) {
  var prediction = point.x * weights.x + point.y * weights.y;
  console.log(prediction);
  
  if (prediction * point.label <= 0) {
   weights.x += learningRate * point.label * point.x;
   weights.y += learningRate * point.label * point.y;
 }

// generate misclassification data.
var misclassification_data = function() {
  
}

points.data(trainingData).transition()
 .style("fill", fill)
 .style("stroke", stroke);

classifier.transition()
  .attr("x2", xScale(weights.x)).attr("y2", yScale(weights.y));

separator.transition()
  .attr("y1", yScale( -weights.x * inverseXScale(0) / weights.y ))
  .attr("y2", yScale( -weights.x * inverseXScale(width) / weights.y ));
};

points.on("click", update);
