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
        it("should not return any value for an empty pop", function(done) {
            var r = redismock.createClient("", "", "");

            r.spop(testKey, function(err, result) {
                should.not.exist(result);

                r.end();

                done();
            });
        });

        it("should not delete any elements in a remove", function(done) {
            var r = redismock.createClient("", "", "");

            r.srem(testKey, testElem, function(err, result) {
                result.should.equal(0);

                r.end();

                done();
            });
        });

        it("should have an empty members list", function(done) {
            var r = redismock.createClient("", "", "");

            r.smembers(testKey, function(err, result) {
                result.should.be.empty;

                r.end();

                done();
            });
        });

        it("should be updated by an add", function(done) {
            var r = redismock.createClient("", "", "");

            r.sadd(testKey, testElem, function(err, result) {
                result.should.equal(1);

                r.end();

                done();
            });
        });
    });

    describe("any non-empty set", function() {
        it("should not contain two copies of the same elem", function(done) {
            var r = redismock.createClient("", "", "");

            r.sadd(testKey, testElem, function(err, result) {
                result.should.equal(1);

                r.sadd(testKey, testElem, function(err, result) {
                    result.should.equal(0);

                    r.end();

                    done();
                });
            });
        });

        it("should be able to contain two different items", function(done) {
            var r = redismock.createClient("", "", "");

            r.sadd(testKey, testElem, function(err, result) {
                result.should.equal(1);

                r.sadd(testKey, testElem2, function(err, result) {
                    result.should.equal(1);

                    r.smembers(testKey, function(err, result) {
                        result.should.have.lengthOf(2);
                        result.should.include(testElem);
                        result.should.include(testElem2);

                        r.end();

                        done();
                    });
                });
            });
        });

        it("should be able to have an item removed from it", function(done) {
            var r = redismock.createClient("", "", "");

            r.sadd(testKey, testElem, function(err, result) {
                result.should.equal(1);

                r.srem(testKey, testElem, function(err, result) {
                    result.should.equal(1);

                    r.smembers(testKey, function(err, result) {
                        result.should.be.empty;

                        r.end();

                        done();
                    });
                });
            });
        });
    });
});
