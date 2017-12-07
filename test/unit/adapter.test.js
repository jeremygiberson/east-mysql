/**
 * adapter
 */

"use strict";


/* Node modules */
var path = require("path");


/* Third-party modules */
var chai = require("chai");
var proxyquire = require("proxyquire");
var sinon = require("sinon");

chai.use(require("sinon-chai"));

var expect = chai.expect;


/* Files */


describe("adapter test", function () {


    var db,
        mysql,
        Adapter;
    beforeEach(function () {

        db = {
            connect: sinon.stub(),
            end: sinon.stub(),
            query: sinon.stub()
        };

        mysql = {
            createConnection: sinon.stub()
        };

        Adapter = proxyquire("../../lib/adapter", {
            mysql: mysql
        });

    });


    describe("instantiation tests", function () {

        it("should throw an error if URL not set", function () {

            var fail = false;

            try {
                new Adapter();
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

        it("should override the config with params.config", function () {

            var obj = new Adapter({
                url: "some url",
                eastMysql: {
                    migrationFile: 'overrideMigrateTemplate.js',
                    migrationTable: '_override'
                }
            });

            expect(obj.config).to.be.an("object")
                .to.be.eql({
                migrationFile: "overrideMigrateTemplate.js",
                migrationTable: "_override"
            });

        });

    });


    describe("methods", function () {

        describe("#connect", function () {

            describe("with DB creation", function () {

                var obj;
                beforeEach(function () {
                    obj = new Adapter({
                        createDbOnConnect: true,
                        url: "mysql://user:password@10.20.30.40/dbname"
                    });
                });

                it("should create the database then successfully create a DB instance", function () {

                    var cb = sinon.spy();

                    mysql.createConnection.returns(db);

                    db.connect.yields(null);

                    db.query.yields(null);

                    obj.connect(cb);

                    expect(mysql.createConnection).to.be.calledTwice
                        .calledWith("mysql://user:password@10.20.30.40/")
                        .calledWith("mysql://user:password@10.20.30.40/dbname");

                    expect(obj.db.connect).to.be.calledTwice;

                    expect(obj.db.query).to.be.calledTwice
                        .calledWith("CREATE DATABASE IF NOT EXISTS dbname")
                        .calledWith("CREATE TABLE IF NOT EXISTS _migrations (`name` VARCHAR(50) NOT NULL, PRIMARY KEY (`name`))");

                    expect(obj.db.end).to.be.calledOnce;

                    expect(cb).to.be.calledOnce
                        .calledWithExactly(null, {
                            db: db
                        });

                });

                it("should handle an initial connection error", function () {

                    var cb = sinon.spy();

                    mysql.createConnection.returns(db);

                    db.connect.yields("err");

                    db.query.yields(null);

                    obj.connect(cb);

                    expect(mysql.createConnection).to.be.calledOnce
                        .calledWith("mysql://user:password@10.20.30.40/");

                    expect(db.connect).to.be.calledOnce;

                    expect(db.query).to.not.be.called;

                    expect(db.end).to.not.be.called;

                    expect(cb).to.be.calledOnce
                        .calledWith("err");

                });

                it("should handle a create _migrations table error", function () {

                    var cb = sinon.spy();

                    mysql.createConnection.returns(db);

                    db.connect.yields(null);

                    db.query.yields("err");

                    obj.connect(cb);

                    expect(mysql.createConnection).to.be.calledOnce
                        .calledWith("mysql://user:password@10.20.30.40/");

                    expect(db.connect).to.be.calledOnce;

                    expect(db.query).to.be.calledOnce
                        .calledWith("CREATE DATABASE IF NOT EXISTS dbname");

                    expect(db.end).to.not.be.called;

                    expect(cb).to.be.calledOnce
                        .calledWith("err");

                });

                it("should handle a connection error", function () {

                    var cb = sinon.spy();

                    mysql.createConnection.returns(db);

                    db.connect.onFirstCall().yields(null)
                        .onSecondCall().yields("err");

                    db.query.yields(null);

                    obj.connect(cb);

                    expect(mysql.createConnection).to.be.calledTwice
                        .calledWith("mysql://user:password@10.20.30.40/")
                        .calledWith("mysql://user:password@10.20.30.40/dbname");

                    expect(obj.db.connect).to.be.calledTwice;

                    expect(obj.db.query).to.be.calledOnce;

                    expect(obj.db.end).to.be.calledOnce;

                    expect(cb).to.be.calledOnce
                        .calledWithExactly("err");

                });

                it("should handle a DB create migration table error", function () {

                    var cb = sinon.spy();

                    mysql.createConnection.returns(db);

                    db.connect.yields(null);

                    db.query.onFirstCall().yields(null)
                        .onSecondCall().yields("err");

                    obj.connect(cb);

                    expect(mysql.createConnection).to.be.calledTwice
                        .calledWith("mysql://user:password@10.20.30.40/")
                        .calledWith("mysql://user:password@10.20.30.40/dbname");

                    expect(obj.db.connect).to.be.calledTwice;

                    expect(obj.db.query).to.be.calledTwice
                        .calledWith("CREATE DATABASE IF NOT EXISTS dbname")
                        .calledWith("CREATE TABLE IF NOT EXISTS _migrations (`name` VARCHAR(50) NOT NULL, PRIMARY KEY (`name`))");

                    expect(obj.db.end).to.be.calledOnce;

                    expect(cb).to.be.calledOnce
                        .calledWithExactly("err");

                });

            });

            describe("without DB creation", function () {

                var obj;
                beforeEach(function () {
                    obj = new Adapter({
                        url: "mysql://user:password@10.20.30.40/dbname"
                    });
                });

                it("should successfully create a DB instance", function () {

                    var cb = sinon.spy();

                    mysql.createConnection.returns(db);

                    db.connect.yields(null);

                    db.query.yields(null);

                    obj.connect(cb);

                    expect(mysql.createConnection).to.be.calledOnce
                        .calledWith("mysql://user:password@10.20.30.40/dbname");

                    expect(obj.db.connect).to.be.calledOnce;

                    expect(obj.db.query).to.be.calledOnce
                        .calledWith("CREATE TABLE IF NOT EXISTS _migrations (`name` VARCHAR(50) NOT NULL, PRIMARY KEY (`name`))");

                    expect(cb).to.be.calledOnce
                        .calledWithExactly(null, {
                            db: db
                        });

                });

                it("should handle a connection error", function () {

                    var cb = sinon.spy();

                    mysql.createConnection.returns(db);

                    db.connect.yields("err");

                    obj.connect(cb);

                    expect(mysql.createConnection).to.be.calledOnce
                        .calledWith("mysql://user:password@10.20.30.40/dbname");

                    expect(obj.db.connect).to.be.calledOnce;

                    expect(obj.db.query).to.not.be.called;

                    expect(cb).to.be.calledOnce
                        .calledWithExactly("err");

                });

                it("should handle a DB create migration table error", function () {

                    var cb = sinon.spy();

                    mysql.createConnection.returns(db);

                    db.connect.yields(null);

                    db.query.yields("err");

                    obj.connect(cb);

                    expect(mysql.createConnection).to.be.calledOnce
                        .calledWith("mysql://user:password@10.20.30.40/dbname");

                    expect(obj.db.connect).to.be.calledOnce;

                    expect(obj.db.query).to.be.calledOnce
                        .calledWith("CREATE TABLE IF NOT EXISTS _migrations (`name` VARCHAR(50) NOT NULL, PRIMARY KEY (`name`))");

                    expect(cb).to.be.calledOnce
                        .calledWithExactly("err");

                });

            });

        });

        describe("post-connection", function () {

            var obj;
            beforeEach(function () {

                obj = new Adapter({
                    url: "some url"
                });

                obj.db = db;

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
