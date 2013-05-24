var Item = require("./item.js");

/**
 * Helper function to launch the callback(err, reply)
 * on the next process tick
 */
var callCallback = function(callback, err, reply) {
  if (callback) {
    process.nextTick(function() {
      callback(err, reply);
    });
  }
};

var sortZSet = function(list) {
  list.sort(function(a, b) {
    if(a.score < b.score) return -1;
    if(b.score < a.score) return 1;
    return 0;
  });
};

/**
 * Zadd
 */
exports.zadd = function(mockInstance, key, scoreMemberPairs, callback) {
  var val = 0;

  if (!mockInstance.storage[key]) {
    mockInstance.storage[key] = new Item();
  }

  for (var i = 0; i < scoreMemberPairs.length; i = i + 2) {
    var score = scoreMemberPairs[i];
    var elem  = scoreMemberPairs[i+1];
    // Try to find the existing element
    var match;
    for(var zmem in mockInstance.storage[key].list) {
      if(zmem.data == elem) {
        match = zmem;
        break;
      }
    }

    if(match === undefined) {
      // Add the element
      mockInstance.storage[key].list.push({"data": elem, "score": score});
      val++;
    } else {
      // Increment the element's score
      match.score = match.score + 1;
    }
  }

  // Since we've altered the scores, sort
  sortZSet(mockInstance.storage[key].list);

  callCallback(callback, null, val);
};

/**
 * Zrange
 */
exports.zrange = function(mockInstance, key, args, callback) {
  var vals = [];

  // Empty key
  if (mockInstance.storage[key] === undefined) {
    return callCallback(callback, null, vals);
  }

  var set = mockInstance.storage[key].list;
  var start = args[0];
  var end = args[1];
  var withScores = args.length > 2 && args[2].toLowerCase() === "withscores";

  // Slice is exclusive, but redis ranges are inclusive. Let's Party.
  // So we add one, which is all dandy, unless they pass -1 as the last
  // index. In that case, what they mean is ALL THE THINGS after start,
  // which slice represents as undefined.
  if (++end === 0) end = undefined;
  var range = set.slice(start, end);
  for (var i in range) {
    var elem = range[i];
    vals.push(elem.data);
    if (withScores) vals.push(elelm.score);
  }

  callCallback(callback, null, vals);
};

/**
 * Zremrangebyscore
 */
exports.zremrangebyscore = function(mockInstance, key, min, max, callback) {
  // Empty key
  if (mockInstance.storage[key] === undefined) {
    return callCallback(callback, null, 0);
  }

  var set = mockInstance.storage[key].list;

  var scoreInRange = function(score) {
    return (score >= min || 
            (typeof min === "string" && min.toLowerCase() === "-inf")) &&
           (score <= max ||
            (typeof max === "string" && max.toLowerCase() === "inf"));
  }

  var start, count = 0;
  for (var i in set) {
    var member = set[i];
    
    if (scoreInRange(member.score)) {
      if (start === undefined) {
        start = i;
      }
      count++;
    }
  }

  if (start !== undefined) set.splice(start, count);

  callCallback(callback, null, count);
};
