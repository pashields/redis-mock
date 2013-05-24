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

var randomIndex = function(list) {
  return Math.floor(Math.random() * list.length) % list.length;
};

/**
 * Spop
 */
exports.spop = function(mockInstance, key, callback) {
  var val = null;
  if (mockInstance.storage[key] && mockInstance.storage[key].list.length > 0) {
    list = mockInstance.storage[key].list;
    i = randomIndex(list);
    val = list[i];
    list.splice(i, 1);
  }
  callCallback(callback, null, val);
};

/**
 * Srem
 */
exports.srem = function(mockInstance, key, members, callback) {
  var val = 0;
  
  if (mockInstance.storage[key]) {
    var list = mockInstance.storage[key].list;
    for (var i in members) {
      var member = members[i];

      for (var j = 0; j < list.length; j++) {
        var cur = list[j];
        if(cur == member) {
          val = 1;
          list.splice(j, 1);
          break;
        }
      }
    }
  }
  callCallback(callback, null, val);
};

/**
 * Smembers
 */
exports.smembers = function(mockInstance, key, callback) {
  var val;
  if (mockInstance.storage[key]) {
    val = mockInstance.storage[key].list;
  } else {
    val = [];
  }
  callCallback(callback, null, val);
};

/**
 * Sadd
 */
exports.sadd = function(mockInstance, key, members, callback) {
  var val = 0;

  if (!mockInstance.storage[key]) {
    mockInstance.storage[key] = new Item();
  }

  for (var i in members) {
    var member = members[i];
    if(mockInstance.storage[key].list.every(function(el) {return el != member;})) {
      mockInstance.storage[key].list.push(member);
      val = val + 1;
    }
  }

  callCallback(callback, null, val);
};