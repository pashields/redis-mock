var redismock = require("../"),
    should = require("should"),
    events = require("events");

describe("single set ops", function () {
    var testKey = "foo";
    var testElem = "bar";
    var testElem2 = "zip";

    beforeEach(function(done) {
        var r = redismock.createClient("", "", "");
        r.flushall(function () {
            done();
        });
    });

    describe("any empty set", function () {
        it("should be updated by an add", function(done) {
            var r = redismock.createClient("", "", "");

            r.zadd(testKey, 100, testElem, function(err, result) {
                result.should.equal(1);

                r.end();

                done();
            });
        });

        it("should return an empty list when asked for a range", function(done) {
            var r = redismock.createClient("", "", "");

            r.zrange(testKey, 0, -1, function(err, result) {
                result.should.have.lengthOf(0);

                r.end();

                done();
            });
        });
    });

    describe("any non-empty set", function() {
        it("should return elements in a index range query", function(done) {
            var r = redismock.createClient("", "", "");

            r.zadd(testKey, 10, testElem, function(err, result) {
                result.should.equal(1);
                r.zadd(testKey, 100, testElem2, function(err, result) {
                    result.should.equal(1);
                    r.zrange(testKey, 1, -1, function(err, result) {
                        result.should.have.lengthOf(1);
                        result.should.include(testElem2);

                        r.end();

                        done();
                    });
                });
            });
        });

        it("should be able to have elements removed by score", function(done) {
            var r = redismock.createClient("", "", "");

            r.zadd(testKey, 10, testElem, 100, testElem2, function(err, result) {
                result.should.equal(2);
                r.zremrangebyscore(testKey, 11, 100, function(err, result) {
                    result.should.equal(1);
                    r.zrange(testKey, 0, -1, function(err, result) {
                        result.should.have.lengthOf(1);
                        result.should.include(testElem);

                        r.zremrangebyscore(testKey, "-inf", "inf", function(err, result) {
                            result.should.equal(1);

                            r.end();

                            done();
                        });
                    });
                });
            });
        });
    });
});