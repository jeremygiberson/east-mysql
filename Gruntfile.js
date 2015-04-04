/**
 * Gruntfile
 *
 * Handles the building of the application.
 *
 * @param grunt
 */

/* Node modules */
var semver = require("semver");


module.exports = function (grunt) {

    "use strict";

    /* Load all grunt tasks */
    require("load-grunt-tasks")(grunt);
    require("grunt-timer").init(grunt);

    var pkg = grunt.file.readJSON("package.json");

    grunt.initConfig({
        config: {
            build: "build",
            coverage: "coverage",
            docs: "doc",
            src: "lib",
            test: "test"
        },
        pkg: pkg,
        clean: {
            build: [
                "./<%= config.build %>"
            ],
            coverage: [
                "./<%= config.coverage %>"
            ],
            docs: [
                "./<%= config.docs %>"
            ]
        },
        copy: {
            src: {
                cwd: "./<%= config.src %>",
                dest: "./<%= config.build %>/",
                expand: true,
                src: "**/*.js"
            }
        },
        codeclimate: {
            options: {
                file: "./<%= config.coverage %>/lcov.info",
                token: "704eb25dd7e4075de3617c454ddce846548208c4ee0a204d36d234669497b67b"
            }
        },
        coveralls: {
            push: {
                src: "./<%= config.coverage %>/lcov.info"
            }
        },
        jscs: {
            options: {
                config: ".jscsrc"
            },
            src: {
                files: {
                    src: [
                        "Gruntfile.js",
                        "./<%= config.src %>/**/*.js"
                    ]
                }
            },
            test: {
                files: {
                    src: [
                        "./<%= config.test %>/**/*.js"
                    ]
                }
            }
        },
        jsdoc: {
            dist : {
                src: [
                    "<%= config.src %>/**/*.js",
                    "<%= config.test %>/**/*.js"
                ],
                options: {
                    destination: "<%= config.docs %>"
                }
            }
        },
        jshint: {
            options: {
                bitwise: true,
                camelcase: true,
                curly: true,
                eqeqeq: true,
                esnext: true,
                globals: {
                },
                immed: true,
                noarg: true,
                node: true,
                newcap: true,
                quotmark: "double",
                regexp: true,
                strict: true,
                trailing: true,
                undef: true,
                unused: false
            },
            src: {
                files: {
                    src: [
                        "Gruntfile.js",
                        "./<%= config.src %>/**/*.js"
                    ]
                }
            }
        },
        jsonlint: {
            src: {
                src: [
                    "./*.json",
                    "./<%= config.src %>/**/*.json",
                    "./<%= config.test %>/**/*.json"
                ]
            }
        },
        "mocha_istanbul": {
            checkCoverage: {
                options: {
                    check: {
                        branches: 100,
                        functions: 100,
                        lines: 100,
                        statements: 100
                    },
                    coverage: true,
                    recursive: true,
                    root: "./<%= config.src %>"
                },
                src: "./<%= config.test %>/unit"
            }
        },
        mochaTest: {
            options: {
                reporter: "spec",
                ui: "bdd"
            },
            unittest: {
                src: [
                    "./<%= config.test %>/**/*.test.js"
                ]
            }
        },
        prompt: {
            npmVersion: {
                options: {
                    questions: [{
                        choices: [{
                            value: "build",
                            name:  "Build:  " + (pkg.version + "-?").yellow + " Unstable, betas, and release candidates."
                        }, {
                            value: "patch",
                            name:  "Patch:  " + semver.inc(pkg.version, "patch").yellow + "   Backwards-compatible bug fixes."
                        }, {
                            value: "minor",
                            name:  "Minor:  " + semver.inc(pkg.version, "minor").yellow + "   Add functionality in a backwards-compatible manner."
                        }, {
                            value: "major",
                            name:  "Major:  " + semver.inc(pkg.version, "major").yellow + "   Incompatible API changes."
                        }, {
                            value: "custom",
                            name:  "Custom: " + "?.?.?".yellow + "   Specify version..."
                        }
                        ],
                        config: "bump.increment",
                        message: "What sort of increment would you like?",
                        type: "list"
                    }, {
                        config: "bump.version",
                        message: "What specific version would you like",
                        type: "input",
                        when: function (answers) {
                            return answers["bump.increment"] === "custom";
                        },
                        validate: function (value) {
                            var valid = semver.valid(value) && true;
                            return valid || "Must be a valid semver, such as 1.2.3-rc1. See " +
                                "http://semver.org/".blue.underline + " for more details.";
                        }
                    }]
                }
            }
        },
        shell: {
            addDocs: {
                command: "git add --all -f <%= config.docs %>/"
            },
            gitPush: {
                command: "git push"
            },
            gitPushTags: {
                command: "git push origin --tags"
            },
            npmVersion: {
                command: function () {
                    var bump = {
                        increment: grunt.config.get("bump.increment"),
                        version: grunt.config.get("bump.version")
                    };

                    var script = bump.increment;

                    if (script === "custom") {
                        script = bump.version;
                    }

                    return "npm version " + script;
                }
            }
        },
        watch: {
            options: {
                atBegin: true,
                dateFormat: function (time) {
                    grunt.log.writeln("The task finished in " + time + "ms");
                    grunt.log.writeln("Waiting for more changes…");
                }
            },
            coverage: {
                files: [
                    "Gruntfile.js",
                    "<%= config.src %>/**/*.js",
                    "<%= config.src %>/**/*.json",
                    "<%= config.test %>/**/*.js",
                    "<%= config.test %>/**/*.json"
                ],
                tasks: [
                    "mocha_istanbul"
                ]
            },
            test: {
                files: [
                    "Gruntfile.js",
                    "<%= config.src %>/**/*.js",
                    "<%= config.src %>/**/*.json",
                    "<%= config.test %>/**/*.js",
                    "<%= config.test %>/**/*.json"
                ],
                tasks: [
                    "test"
                ]
            }
        }
    });

    grunt.registerTask("build", "Build the package", [
        "clean",
        "test",
        "dist"
    ]);

    grunt.registerTask("ci", "Runs the continuous integration tests", [
        "test",
        "coverage"
    ]);

    grunt.registerTask("coverage", "Runs the coverage tests", [
        "mocha_istanbul:checkCoverage"
    ]);

    grunt.registerTask("default", [
        "build"
    ]);

    grunt.registerTask("dist", "Create the distributable files", [
        "copy:src"
    ]);

    grunt.registerTask("lint", "Run the lint tests", [
        "jshint:src",
        "jsonlint:src",
        "jscs:src",
        "jscs:test" /* Run JSCS on tests to ensure readability */
    ]);

    grunt.registerTask("tag", "Tag a new release", [
        "prompt:npmVersion",
        "shell:npmVersion",
        "shell:gitPush",
        "shell:gitPushTags"
    ]);

    grunt.registerTask("test", "Perform tests on the codebase", [
        "lint",
        "unittest"
    ]);

    grunt.registerTask("unittest", "Run the unit tests", [
        "mochaTest:unittest"
    ]);

    grunt.registerTask("watchcoverage", "Runs the coverage tests and watch for changes", [
        "watch:coverage"
    ]);

    grunt.registerTask("watchtest", "Perform tests on the codebase and watch for changes", [
        "watch:test"
    ]);

};
