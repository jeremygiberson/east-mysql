/**
 * adapter
 */

"use strict";


/* Node modules */
var path = require("path");


/* Third-party modules */
var chai = require("chai");
var sinon = require("sinon");

chai.use(require("sinon-chai"));

var expect = chai.expect;


/* Files */
var Adapter = require("../../lib/adapter");


describe("adapter test", function () {


    describe("instantiation tests", function () {

        it("should throw an error if URL not set", function () {

            var fail = false;

            try {
                var obj = new Adapter();
            } catch (err) {
                fail = true;

                expect(err).to.be.instanceof(Error);
                expect(err.message).to.be.equal("Connect params should be set");
            } finally {
                expect(fail).to.be.true;
            }

        });

        it("should set the config params", function () {

            var obj = new Adapter({
                url: "some url"
            });

            expect(obj.config).to.be.an("object")
                .to.be.eql({
                    migrationFile: "migrationTemplate.js",
                    migrationTable: "_migrations"
                });

        });

    });


    describe("methods", function () {

        describe("#connect", function () {

        });

        describe("post-connection", function () {

            var obj;
            beforeEach(function () {

                obj = new Adapter({
                    url: "some url"
                });

                obj.db = {
                    end: sinon.stub(),
                    query: sinon.stub()
                };

            });

            describe("#disconnect", function () {

                it("should disconnect from the database", function () {

                    var cb = sinon.spy();

                    obj.disconnect(cb);

                    expect(cb).to.be.calledOnce
                        .calledWithExactly();

                    expect(obj.db.end).to.be.calledOnce
                        .calledWithExactly();

                });

            });

            describe("#getExecutedMigrationNames", function () {

                afterEach(function () {
                    expect(obj.db.query).to.be.calledOnce
                        .calledWith("SELECT name FROM _migrations");
                });

                it("should handle a query error", function () {

                    var cb = sinon.spy();

                    obj.db.query.yields("err");

                    obj.getExecutedMigrationNames(cb);

                    expect(cb).to.be.calledOnce
                        .calledWith("err");

                });

                it("should handle no data in the table", function () {

                    var cb = sinon.spy();

                    obj.db.query.yields(null, null);

                    obj.getExecutedMigrationNames(cb);

                    expect(cb).to.be.calledOnce
                        .calledWithExactly(null, []);

                });

                it("should handle one piece of data in the table", function () {

                    var cb = sinon.spy();

                    obj.db.query.yields(null, [{
                        name: "3_file"
                    }]);

                    obj.getExecutedMigrationNames(cb);

                    expect(cb).to.be.calledOnce
                        .calledWithExactly(null, [
                            "3_file"
                        ]);

                });

                it("should handle multiple pieces of data in the table", function () {

                    var cb = sinon.spy();

                    obj.db.query.yields(null, [{
                        name: "3_file"
                    }, {
                        name: "4_file"
                    }]);

                    obj.getExecutedMigrationNames(cb);

                    expect(cb).to.be.calledOnce
                        .calledWithExactly(null, [
                            "3_file",
                            "4_file"
                        ]);

                });

            });

            describe("#getTemplatePath", function () {

                it("should get the default template path", function () {

                    var dirname = path.normalize(path.join(__dirname, "../../lib/", obj.config.migrationFile));

                    expect(obj.getTemplatePath()).to.be.equal(dirname);

                });

                it("should get the set template path", function () {

                    obj.config.migrationFile = "someotherfile.js";

                    var dirname = path.normalize(path.join(__dirname, "../../lib/", obj.config.migrationFile));

                    expect(obj.getTemplatePath()).to.be.equal(dirname);

                });

            });

            describe("#markExecuted", function () {

                it("should mark the migration as executed", function () {

                    var cb = sinon.spy();

                    obj.db.query.yields(null);

                    obj.markExecuted("2_file", cb);

                    expect(cb).to.be.calledOnce
                        .calledWithExactly();

                    expect(obj.db.query).to.be.calledOnce
                        .calledWith("INSERT INTO _migrations SET ?", {
                            name: "2_file"
                        });

                });

                it("should handle an insert error", function () {

                    var cb = sinon.spy();

                    obj.db.query.yields("err");

                    obj.markExecuted("2_file", cb);

                    expect(cb).to.be.calledOnce
                        .calledWithExactly("err");

                    expect(obj.db.query).to.be.calledOnce
                        .calledWith("INSERT INTO _migrations SET ?", {
                            name: "2_file"
                        });

                });

            });

            describe("#unmarkExecuted", function () {

                it("should mark the migration as executed", function () {

                    var cb = sinon.spy();

                    obj.db.query.yields(null);

                    obj.unmarkExecuted("2_file", cb);

                    expect(cb).to.be.calledOnce
                        .calledWithExactly();

                    expect(obj.db.query).to.be.calledOnce
                        .calledWith("DELETE FROM _migrations WHERE name = ?", [
                            "2_file"
                        ]);

                });

                it("should handle an insert error", function () {

                    var cb = sinon.spy();

                    obj.db.query.yields("err");

                    obj.unmarkExecuted("2_file", cb);

                    expect(cb).to.be.calledOnce
                        .calledWithExactly("err");

                    expect(obj.db.query).to.be.calledOnce
                        .calledWith("DELETE FROM _migrations WHERE name = ?", [
                            "2_file"
                        ]);

                });

            });

        });

    });


});
