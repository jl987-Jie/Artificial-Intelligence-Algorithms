var KMeans = {

    // Compute the Euclidean distance between two points.
    euclid_distance: function(p1, p2){
        return Math.pow(p1[0] - p2[0], 2)
            + Math.pow(p1[1] - p2[1], 2);
    },

    // finding nearest centroid for each of the observations
    getNearestCentroid: function(centroids, observation) {
        var distances = centroids.map(function(centroid) {
            return KMeans.euclid_distance(centroid, observation);
        })
        return distances.indexOf(Math.min.apply(Math, distances));
    },

    // Recompute the centroid given the clusters.
    recomputeCentroid: function(observations, centroids) {
        var clusters = centroids.map(function(){ return [];});
        observations.forEach(function(observation){
            clusters[KMeans.getNearestCentroid(centroids, observation)].push(observation);
        });
        return clusters;
    },

    // centering clusters finally and checking for convergence
    centerClusters: function(clusters, maxValue) {

        return clusters.map( function(cluster){
            if(cluster.length > 0) {
                return cluster.reduce( function(previousValue, currentValue) {
                    return [previousValue[0]+currentValue[0],previousValue[1]+currentValue[1]]
                }).map( function(x) { return x / cluster.length });
            } else {
                var observations = clusters.reduce( function(previousValue, currentValue) {
                    return previousValue.concat(currentValue);
                });
                return KMeans.Utility.selectRandomPoints(1, observations)[0];
            }
        });
    },

    //checking convergence 
    isConverged: function(c1, c2){
        return (c1.join('') == c2.join(''));
    }
}

//function to generate the initial data points.
KMeans.Utility = {

    // return a random number.
    randomNumber: function(ceiling) {
        return Math.random() * ceiling;
    },

    // return a random point.
    randomPoint: function(ceiling) {
        return [KMeans.Utility.randomNumber(ceiling), KMeans.Utility.randomNumber(ceiling)];
    },

    // generate a Gaussian distribution of the points.
    generateGaussian: function(point, range, ceiling) {
        var v1, v2, s, x, y;
        do {
            do {
                v1 = 2 * Math.random() - 1;   // between -1.0 and 1.0
                v2 = 2 * Math.random() - 1;   // between -1.0 and 1.0
                s = v1 * v1 + v2 * v2;
            } while (s >= 1 || s == 0);
            var multiplier = Math.sqrt(-2 * Math.log(s)/s);
            x = point[0] + (v2 * multiplier * range);
            y = point[1] + (v1 * multiplier * range);
        } while (x < 0 || y < 0 || x > ceiling || y > ceiling);
        return [x, y];
    },

    // generate points according to the generatePointFunction function.
    generatePoints: function(n, generatePointFunction) {
        var points = [];
        for(var i = 0; i < n; i++) {
            points[i] = generatePointFunction();
        }
        return points;
    },

    // create random points using the generatePoints function.
    createRandomPoints: function(n, ceiling) {
        return KMeans.Utility.generatePoints(n, function(){
            return KMeans.Utility.randomPoint(ceiling);
        })
    },

    // create Gaussian points.
    createGaussianPoints: function(n, centers, ceiling) {
        return KMeans.Utility.generatePoints(n, function() {
            var randomIndex = Math.floor(KMeans.Utility.randomNumber(centers.length));
            var center = centers[randomIndex];
            return KMeans.Utility.generateGaussian(center, 0.5, ceiling);
        })
    },

    // select random points.
    selectRandomPoints: function(n, points) {
        var indexes = [];
        for(var i = 0; i < n; i++){
            var r;
            do {
               r = Math.floor(KMeans.Utility.randomNumber(points.length));
            } while ( indexes.indexOf(r) > 0 )
            indexes.push(r);
        }
        return indexes.map(function(i) {
            return points[i];
        });
    }
}

KMeans.Demo = {}

KMeans.Demo.createVisualization = function(selector, maxValue) {

    var colors = ["red","green","blue","yellow","orange","grey", "pink"];
    var vizPadding = 0.5;
    var animationDuration = 750;

    var visualizationSvg;
    var vizDimension;
    var linearScale;

    // animation for the lines.
    var addLineAnimation = function(lineSelection, point) {
        return lineSelection
            .attr("x1", function (d) { return linearScale(d[0]); })
            .attr("y1", function (d) { return linearScale(d[1]); })
            .attr("x2", function (d) { return linearScale(d[0]); })
            .attr("y2", function (d) { return linearScale(d[1]); })
            .transition()
                .duration(animationDuration)
                .attr("x2", linearScale(point[0]))
                .attr("y2", linearScale(point[1]));
    }

    var setUpVisualization = function() {
        vizDimension = $(selector).width();
        linearScale = d3.scale.linear()
            .domain([-vizPadding, maxValue + vizPadding])
            .range([0, vizDimension]);
        visualizationSvg = d3.select(selector).append("svg")
            .attr("width", vizDimension)
            .attr("height", vizDimension)
            .style("display", "block")
            .style("margin", "0 auto")
            .style("background-color", "#ffffff");
    }

    var updatePoints = function(points, klass, color) {

        var pointSelection = visualizationSvg.selectAll("circle." + klass)
            .data(points);

        pointSelection.transition()
            .duration(animationDuration)
            .attr("cx", function (d) { return linearScale(d[0]); })
            .attr("cy", function (d) { return linearScale(d[1]); });

        pointSelection.enter()
            .append("circle")
            .attr("class", klass)
            .attr("cx", function (d) { return linearScale(d[0]); })
            .attr("cy", function (d) { return linearScale(d[1]); })
            .attr("r", 5)
            .style("fill", color)
            .style("fill-opacity", 1e-6)
            .transition()
                .duration(750)
                .attr("y", 0)
                .style("fill-opacity", 1);

        pointSelection.exit().remove();
    };

    return {
        init: function() {

            setUpVisualization();

            $(window).resize(function() {
                visualizationSvg.remove();
                setUpVisualization();
            });
        },

        clearCentroids: function() {
            visualizationSvg.selectAll("line").remove();
            visualizationSvg.selectAll("circle.centroids").remove();
        },

        clearClusters: function() {
            visualizationSvg.selectAll("line").remove();
        },

        updateObservations: function(observations) {
            updatePoints(observations, "data", "black");
        },

        updateCentroids: function(centroids) {
            updatePoints(centroids, "centroids", function(d,i){ return colors[i]; });
        },

        // update the clusters.
        updateClusters: function(clusters, centroids) {
            clusters.forEach( function(points, index){
                var lineSelection = visualizationSvg.selectAll("line.centroid" + index)
                    .data(points);

                var lineAnimation = addLineAnimation(lineSelection, centroids[index]);

                lineAnimation = addLineAnimation(
                    lineSelection.enter().append("line")
                        .attr("class", "centroid" + index)
                        .attr("stroke-width", 2)
                        .attr("stroke", colors[index]), centroids[index]);

                lineSelection.exit().remove();
            });
        },

        updateClusterCentroids: function(clusters, centroids) {
            clusters.forEach( function(points, index){
                var lineSelection = visualizationSvg.selectAll("line.centroid" + index)
                    .data(points);

                lineSelection
                    .transition()
                    .duration(650)
                    .attr("x2", linearScale(centroids[index][0]))
                    .attr("y2", linearScale(centroids[index][1]));
            });
        }
    };
};

//initializations here
KMeans.Demo.Application = (function() {

    var that; //reference for callbacks
    var visualization;

    var observations = [];
    var centroids = [];

    var maxValue = 10;
    var numObservations = 200;
    var numCentroids = 5;
    var iterationDelay = 400;
    var counter = 0; // keep track of number of iterations.

    return {
        init: function() {
            that = this;
            $(document).ready(function() {

                visualization = KMeans.Demo.createVisualization("#visualization", maxValue);
                visualization.init();

                $("#inputNumObservations")
                    .val(numObservations)
                    .change( function() {
                    numObservations = parseInt($(this).val(),10);
                });

                $("#inputNumCentroids")
                    .val(numCentroids)
                    .change( function() {
                    numCentroids = parseInt($(this).val(),10);
                });

                var buttonGenerate = $("#buttonGenerate");
                buttonGenerate.click(that.generateData);

                var buttonCluster = $("#buttonCluster");
                buttonCluster.click(that.cluster);
            });
        },

        cluster: function() {
            visualization.clearClusters();
            counter = 0;
            that.setCentroids(KMeans.Utility.selectRandomPoints(numCentroids, observations));
            setTimeout(function() { that.updateCentroids(); }, iterationDelay);
            return false;
        },

        setObservations: function(points) {
            observations = points;
            visualization.clearClusters();
            visualization.updateObservations(observations);
        },

        setCentroids: function(points) {
            centroids = points;
            visualization.updateCentroids(centroids);
        },
        generateData: function() {
           var centers = KMeans.Utility.createRandomPoints(numCentroids, maxValue);
           that.setObservations(KMeans.Utility.createGaussianPoints(numObservations, centers, maxValue));
        },
        updateCentroids: function() {
            var clusters = KMeans.recomputeCentroid(observations, centroids);
            visualization.updateClusters(clusters, centroids);
            
            setTimeout(function() {
                var newCentroids = KMeans.centerClusters(clusters, maxValue);
                if(!KMeans.isConverged(newCentroids,centroids)){
                    counter += 1;
                    $("#num_clusters").html(counter);
                    that.setCentroids(newCentroids);
                    visualization.updateClusterCentroids(clusters, centroids);
                    setTimeout(function() { that.updateCentroids(); }, iterationDelay);
                } else {
                    counter += 1;
                    $("#num_clusters").html(counter);
                }
            }, iterationDelay);
        }
    }
}());

KMeans.Demo.Application.init();