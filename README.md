# east mysql

MySQL adapter for [east](https://github.com/okv/east) which uses the [MySQL](https://github.com/felixge/node-mysql)
driver

All executed migrations names will be stored at `_migrations` collection in the current database. Object with 
following properties will be passed to `migrate` and `rollback` functions:

 - `db` - instance of the database driver

## Installation

    npm install -g east east-mysql
    
alternatively you could install it locally

## Usage

Go to project dir and run

    east init

create `.eastrc` file at current directory

    {
        "adapter": "east-mysql",
        "url": "mysql://user:password@host/dbname"
    }

where `url` is url of database which you want to migrate in [MySQL URL format](http://dev.mysql.com/doc/connector-j/en/connector-j-reference-configuration-properties.html)

now we can create some migrations

    east create users
    
create files will look like this one
 
    "use strict";
    
    exports.migrate = function (client, done) {
        var db = client.db;
        done();
    };
    
    exports.rollback = function (client, done) {
        var db = client.db;
        done();
    };
    
Inside the `migrations` and `rollback` functions you can create the scripts to migrate up to that version
and to rollback from it, eg

    exports.migrate = function(client, done) {
        var db = client.db;
    
        var sql = "CREATE TABLE users ( id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY, firstname VARCHAR(30) NOT NULL, lastname VARCHAR(30) NOT NULL, email VARCHAR(50), reg_date TIMESTAMP)";
    
        db.query(sql, function (err, rows, fields) {
    
            done(err);
    
        });
    };
    
    exports.rollback = function(client, done) {
        var db = client.db;
    
        var sql = "DROP TABLE users";
    
        db.query(sql, function (err, rows, fields) {
    
            done(err);
    
        });
    };

to execute the migrations

    east migrate

to rollback the migration

    east rollback

## Running tests

Clone this repo and run `npm test`. You can also check code coverage by running `grunt coverage`
   
## License

MIT
