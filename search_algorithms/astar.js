/* 
 * Note that this site
 * http://www.briangrinstead.com/blog/astar-search-algorithm-in-javascript 
 * was able to provide the grid layout and the a star search. 
 * We implemented the Breadth First Search and Depth First Search.
 */
(function(definition) {
    /* global module, define */
    if(typeof module === 'object' && typeof module.exports === 'object') {
        module.exports = definition();
    } else if(typeof define === 'function' && define.amd) {
        define([], definition);
    } else {
        var exports = definition();
        window.astar = exports.astar;
        window.bfs = exports.bfs;
        window.dfs = exports.dfs;
        window.Graph = exports.Graph;
    }
})(function() {

/* Creates a new queue. A queue is a first-in-first-out (FIFO) data structure -
 * items are added to the end of the queue and removed from the front.
 * http://code.stephenmorley.org/javascript/queues/#download
 */
function Queue(){

  // initialise the queue and offset
  var queue  = [];
  var offset = 0;

  // Returns the length of the queue.
  this.getLength = function(){
    return (queue.length - offset);
  }

  // Returns true if the queue is empty, and false otherwise.
  this.isEmpty = function(){
    return (queue.length == 0);
  }

  /* Enqueues the specified item. The parameter is:
   *
   * item - the item to enqueue
   */
  this.enqueue = function(item){
    queue.push(item);
  }

  /* Dequeues an item and returns it. If the queue is empty, the value
   * 'undefined' is returned.
   */
  this.dequeue = function(){

    // if the queue is empty, return immediately
    if (queue.length == 0) return undefined;

    // store the item at the front of the queue
    var item = queue[offset];

    // increment the offset and remove the free space if necessary
    if (++ offset * 2 >= queue.length){
      queue  = queue.slice(offset);
      offset = 0;
    }
    // return the dequeued item
    return item;
  }

  /* Returns the item at the front of the queue (without dequeuing it). If the
   * queue is empty then undefined is returned.
   */
  this.peek = function(){
    return (queue.length > 0 ? queue[offset] : undefined);
  }

}

// return the path from the start node to the current node.
function pathTo(node){
    var curr = node;
    var path = [];
    while(curr.parent) {
        path.push(curr);
        curr = curr.parent;
    }
    return path.reverse();
}

function pathLen(node) {
    var curr = node;
    var path = [];
    var len = 0;
    while (curr.parent) {
        len += 1;
        path.push(curr);
        curr = curr.parent;
    }
    return len;
}

// depth first search: RN&N page: 84
var dfs = {
    init: function(graph) {
        for (var i = 0, len = graph.nodes.length; i < len; i++) {
            var node = graph.nodes[i];
            node.visited = false;
            node.closed = false;
            node.parent = null;
        }
    },

    search: function(graph, start, end, options) {
        var start_time = new Date().getTime();
        var iteration_num = 0;
        var path_len = 0;
        var stack = new Array();

        dfs.init(graph);
        options = options || {};
        stack.push(start);

        while (stack.length > 0) {
            iteration_num += 1;
            var currentNode = stack.pop();
            if (currentNode === end) {
                var end_time = new Date().getTime();
                var time = end_time - start_time;
                $("#fill_time_here").text(time);
                $("#num_iterations").text(iteration_num);
                $("#fill_path_len").text(pathLen(currentNode));
                return pathTo(currentNode);
            }
            currentNode.closed = true;
            var neighbors = graph.neighbors(currentNode);
            for (var i = 0; i < neighbors.length; i++) {
                var neighbor = neighbors[i];
                if (neighbor.closed || neighbor.isWall()) {
                    continue;
                }
                if (!neighbor.visited) {
                    neighbor.visited = true;
                    neighbor.parent = currentNode;
                    stack.push(neighbor);
                }
            }
        }
        return [];
    }
};

// Implementation of breadth-first search using queues.
var bfs = {
    init: function(graph) {
        for (var i = 0, len = graph.nodes.length; i < len; i++) {
            var node = graph.nodes[i];
            node.visited = false;
            node.closed = false;
            node.parent = null;
        }
    },

    search: function(graph, start, end, options) {
        var start_time = new Date().getTime();
        var iteration_num = 0;
        var path_len = 0;
        var queue = new Queue();

        bfs.init(graph);
        options = options || {};
        queue.enqueue(start);

        while (queue.getLength() > 0) {
            iteration_num += 1;
            var currentNode = queue.dequeue();
            if (currentNode === end) {
                var end_time = new Date().getTime();
                var time = end_time - start_time;
                $("#fill_time_here").text(time);
                $("#num_iterations").text(iteration_num);
                $("#fill_path_len").text(pathLen(currentNode));
                return pathTo(currentNode);
            }
            currentNode.closed = true;
            var neighbors = graph.neighbors(currentNode);
            for (var i = 0; i < neighbors.length; i++) {
                var neighbor = neighbors[i];
                if (neighbor.closed || neighbor.isWall()) {
                    continue;
                }
                if (!neighbor.visited) {
                    neighbor.visited = true;
                    neighbor.parent = currentNode;
                    queue.enqueue(neighbor);
                }
            }
        }
        return [];
    }
};

var astar = {
    init: function(graph) {
        for (var i = 0, len = graph.nodes.length; i < len; ++i) {
            var node = graph.nodes[i];
            node.f = 0;
            node.g = 0;
            node.h = 0;
            node.visited = false;
            node.closed = false;
            node.parent = null;
        }
    },

    search: function(graph, start, end, options) {
        var start_time = new Date().getTime();
        var iteration_num = 0;
        var path_len = 0;
        astar.init(graph);
        options = options || {};
        var heuristic = options.heuristic || astar.heuristics.manhattan,
            closest = options.closest || false;
        var openHeap = getHeap(),
            closestNode = start; // set the start node to be the closest if required
        start.h = heuristic(start, end);
        openHeap.push(start);
        while(openHeap.size() > 0) {
            iteration_num += 1;
            // Grab the lowest f(x) to process next.  Heap keeps this sorted for us.
            var currentNode = openHeap.pop();
            // End case -- result has been found, return the traced path.
            if(currentNode === end) {
                var end_time = new Date().getTime();
                var time = end_time - start_time;
                $("#fill_time_here").text(time);
                $("#num_iterations").text(iteration_num);
                $("#fill_path_len").text(pathLen(currentNode));
                return pathTo(currentNode);
            }
            // Normal case -- move currentNode from open to closed, process each of its neighbors.
            currentNode.closed = true;
            // Find all neighbors for the current node.
            var neighbors = graph.neighbors(currentNode);
            for (var i = 0, il = neighbors.length; i < il; ++i) {
                var neighbor = neighbors[i];
                if (neighbor.closed || neighbor.isWall()) {
                    // Not a valid node to process, skip to next neighbor.
                    continue;
                }
                // The g score is the shortest distance from start to current node.
                // We need to check if the path we have arrived at this neighbor is the shortest one we have seen yet.
                var gScore = currentNode.g + neighbor.getCost(currentNode),
                    beenVisited = neighbor.visited;
                if (!beenVisited || gScore < neighbor.g) {
                    // Found an optimal (so far) path to this node.  Take score for node to see how good it is.
                    neighbor.visited = true;
                    neighbor.parent = currentNode;
                    neighbor.h = neighbor.h || heuristic(neighbor, end);
                    neighbor.g = gScore;
                    neighbor.f = neighbor.g + neighbor.h;
                    if (closest) {
                        // If the neighbour is closer than the current closestNode or if it's equally close but has
                        // a cheaper path than the current closest node then it becomes the closest node
                        if (neighbor.h < closestNode.h || (neighbor.h === closestNode.h && neighbor.g < closestNode.g)) {
                            closestNode = neighbor;
                        }
                    }
                    if (!beenVisited) {
                        // Pushing to heap will put it in proper place based on the 'f' value.
                        openHeap.push(neighbor);
                    }
                    else {
                        // Already seen the node, but since it has been rescored we need to reorder it in the heap
                        openHeap.rescoreElement(neighbor);
                    }
                }
            }
        }
        // No result was found - empty array signifies failure to find path.
        return [];
    },

    // uses the manhattan distance as a heuristic
    heuristics: {
        manhattan: function(point_a, point_b) {
            var d1 = Math.abs(point_b.x - point_a.x);
            var d2 = Math.abs(point_b.y - point_a.y);
            return d1 + d2;
        }
    }
};

/**
* A graph memory structure
* @param {Array} gridIn 2D array of input weights
* @param {Object} [options]
* @param {bool} [options.diagonal] Specifies whether diagonal moves are allowed
*/
function Graph(gridIn, options) {
    options = options || {};
    this.nodes = [];
    this.diagonal = !!options.diagonal;
    this.grid = [];
    for (var x = 0; x < gridIn.length; x++) {
        this.grid[x] = [];

        for (var y = 0, row = gridIn[x]; y < row.length; y++) {
            var node = new GridNode(x, y, row[y]);
            this.grid[x][y] = node;
            this.nodes.push(node);
        }
    }
}

// Neighbors.
Graph.prototype.neighbors = function(node) {
    var ret = [],
        x = node.x,
        y = node.y,
        grid = this.grid;

    // West
    if(grid[x-1] && grid[x-1][y]) {
        ret.push(grid[x-1][y]);
    }

    // East
    if(grid[x+1] && grid[x+1][y]) {
        ret.push(grid[x+1][y]);
    }

    // South
    if(grid[x] && grid[x][y-1]) {
        ret.push(grid[x][y-1]);
    }

    // North
    if(grid[x] && grid[x][y+1]) {
        ret.push(grid[x][y+1]);
    }

    if (this.diagonal) {
        // Southwest
        if(grid[x-1] && grid[x-1][y-1]) {
            ret.push(grid[x-1][y-1]);
        }

        // Southeast
        if(grid[x+1] && grid[x+1][y-1]) {
            ret.push(grid[x+1][y-1]);
        }

        // Northwest
        if(grid[x-1] && grid[x-1][y+1]) {
            ret.push(grid[x-1][y+1]);
        }

        // Northeast
        if(grid[x+1] && grid[x+1][y+1]) {
            ret.push(grid[x+1][y+1]);
        }
    }

    return ret;
};

Graph.prototype.toString = function() {
    var graphString = [],
        nodes = this.grid, // when using grid
        rowDebug, row, y, l;
    for (var x = 0, len = nodes.length; x < len; x++) {
        rowDebug = [];
        row = nodes[x];
        for (y = 0, l = row.length; y < l; y++) {
            rowDebug.push(row[y].weight);
        }
        graphString.push(rowDebug.join(" "));
    }
    return graphString.join("\n");
};

function GridNode(x, y, weight) {
    this.x = x;
    this.y = y;
    this.weight = weight;
}

GridNode.prototype.toString = function() {
    return "[" + this.x + " " + this.y + "]";
};

GridNode.prototype.getCost = function() {
    return this.weight;
};

GridNode.prototype.isWall = function() {
    return this.weight === 0;
};

function getHeap() {
    return new BinaryHeap(function(node) {
        return node.f;
    });
}

function BinaryHeap(scoreFunction){
    this.content = [];
    this.scoreFunction = scoreFunction;
}

// Binary Heap implementation.
BinaryHeap.prototype = {
    push: function(element) {
        // Add the new element to the end of the array.
        this.content.push(element);

        // Allow it to sink down.
        this.sinkDown(this.content.length - 1);
    },
    pop: function() {
        // Store the first element so we can return it later.
        var result = this.content[0];
        // Get the element at the end of the array.
        var end = this.content.pop();
        // If there are any elements left, put the end element at the
        // start, and let it bubble up.
        if (this.content.length > 0) {
            this.content[0] = end;
            this.bubbleUp(0);
        }
        return result;
    },
    remove: function(node) {
        var i = this.content.indexOf(node);

        // When it is found, the process seen in 'pop' is repeated
        // to fill up the hole.
        var end = this.content.pop();

        if (i !== this.content.length - 1) {
            this.content[i] = end;

            if (this.scoreFunction(end) < this.scoreFunction(node)) {
                this.sinkDown(i);
            }
            else {
                this.bubbleUp(i);
            }
        }
    },
    size: function() {
        return this.content.length;
    },
    rescoreElement: function(node) {
        this.sinkDown(this.content.indexOf(node));
    },
    sinkDown: function(n) {
        // Fetch the element that has to be sunk.
        var element = this.content[n];

        // When at 0, an element can not sink any further.
        while (n > 0) {

            // Compute the parent element's index, and fetch it.
            var parentN = ((n + 1) >> 1) - 1,
                parent = this.content[parentN];
            // Swap the elements if the parent is greater.
            if (this.scoreFunction(element) < this.scoreFunction(parent)) {
                this.content[parentN] = element;
                this.content[n] = parent;
                // Update 'n' to continue at the new position.
                n = parentN;
            }
            // Found a parent that is less, no need to sink any further.
            else {
                break;
            }
        }
    },
    bubbleUp: function(n) {
        // Look up the target element and its score.
        var length = this.content.length,
            element = this.content[n],
            elemScore = this.scoreFunction(element);

        while(true) {
            // Compute the indices of the child elements.
            var child2N = (n + 1) << 1,
                child1N = child2N - 1;
            // This is used to store the new position of the element, if any.
            var swap = null,
                child1Score;
            // If the first child exists (is inside the array)...
            if (child1N < length) {
                // Look it up and compute its score.
                var child1 = this.content[child1N];
                child1Score = this.scoreFunction(child1);

                // If the score is less than our element's, we need to swap.
                if (child1Score < elemScore){
                    swap = child1N;
                }
            }

            // Do the same checks for the other child.
            if (child2N < length) {
                var child2 = this.content[child2N],
                    child2Score = this.scoreFunction(child2);
                if (child2Score < (swap === null ? elemScore : child1Score)) {
                    swap = child2N;
                }
            }

            // If the element needs to be moved, swap it, and continue.
            if (swap !== null) {
                this.content[n] = this.content[swap];
                this.content[swap] = element;
                n = swap;
            }
            // Otherwise, we are done.
            else {
                break;
            }
        }
    }
};

return {
    astar: astar,
    bfs: bfs,
    dfs: dfs,
    Graph: Graph
};

});
