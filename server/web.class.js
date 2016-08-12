/**
 *  Node Muse
 *  Web Gui example
 *
 *  This example starts a http server at port 8080
 *  ---------------------------------------------------
 *  @package    node-muse
 *  @author     Jimmy Aupperlee <j.aup.gt@gmail.com>
 *  @license    GPLv3
 *  @version    1.0.0
 *  @since      File available since Release 0.1.0
 */

'use strict';

/*
 |--------------------------------------------------------------------------
 | Required modules
 |--------------------------------------------------------------------------
 */

var express = require('express'),
    path = require('path');

var MongoClient = require('mongodb').MongoClient; // mongodb api
var assert = require('assert'); // for testing
var url = 'mongodb://localhost:27017/test'; // type of server, location, what port, and specific location
MongoClient.connect(url, function(err, db) {
  assert.equal(null, err); // if err is null, then continue. if error is not null, then freak out
  console.log("Connected correctly to Mongo server.");
  db.close();
});    

var insertDocument = function(db, callback) {
   db.collection('restaurants').insertOne( {
      "address" : {
         "street" : "2 Avenue",
         "zipcode" : "10075",
         "building" : "1480",
         "coord" : [ -73.9557413, 40.7720266 ]
      },
      "borough" : "Manhattan",
      "cuisine" : "Italian",
      "grades" : [
         {
            "date" : new Date("2014-10-01T00:00:00Z"),
            "grade" : "A",
            "score" : 11
         },
         {
            "date" : new Date("2014-01-16T00:00:00Z"),
            "grade" : "B",
            "score" : 17
         }
      ],
      "name" : "Vella",
      "restaurant_id" : "41704620"
   }, function(err, result) {
    assert.equal(err, null);
    console.log("Inserted a document into the restaurants collection.");
    callback();
  });
};

insertDocument();
var MongoClient = {
    connect: function(url, callback){
        tell the MongoClient to connect to `url`
        once connected, returns either a database connection or error msg
        var error = null;
        if db connects: store database connection in variable `gotData`
        if error exists: rewite store `error` variable with error message  
        if (typeof callback === "function"){
            callback(error, gotData);
        } else {
            console.log("error: callback should be a function")
        }
            
    }
}
/*
 |--------------------------------------------------------------------------
 | The 'constructor'
 |--------------------------------------------------------------------------
 |
 | Instantiate some variables and use the options object to merge the
 | default options above with the parameters in the 'constructor'
 |
 */
var webClass = function(muse) {

    // Set the muse as a 'class' variable
    this.app = null;
    this.io = null;
    this.muse = muse;
    this.museDataPathsRequested = {};
};

/*
 |--------------------------------------------------------------------------
 | Initialize
 |--------------------------------------------------------------------------
 |
 | Start the html and socket server
 |
 */

webClass.prototype.init = function(config) {

    var self = this;

    // Insert the server objects into the 'class' variables
    this.app = express();
    this.server  = require('http').Server(this.app);
    this.io   = require('socket.io')(this.server);

    // Set the client path
    this.app.use(express.static( path.resolve( __dirname + '/../client' ) ) );

    this.app.get('/', function (req, res) {
        res.sendfile( 'index.html');
    });

    this.io.on('connection', function (socket) {

        // Let the client know, he's welcome
        socket.emit('connected', {
            "connected": self.muse.connected,
            "config": self.muse.config
        });

        self.museDataPathsRequested[socket.id] = { 
            "socket" : socket,
            "paths" : {}
        }

        // Send an array containing all paths the client wishes to receive
        socket.on('setPaths', function(data){
            self.refreshListeners(socket.id, data);
        });

        socket.on('disconnect', function(){
            self.refreshListeners(socket.id, []);
        });
    });

    // To keep it clean, it's in a seperate function
    this.setDefaultListeners();

    // Start the server, it's okay
    this.server.listen(config.port);
    console.log("HTTP server started and available on port: " + config.port);
};

/*
 |--------------------------------------------------------------------------
 | Set default listeners
 |-------------------------------------------------------------------------
 */

webClass.prototype.setDefaultListeners = function() {

    var self = this;

    this.muse.on('connected', function(){
        self.io.emit('muse_connected', {
            "connected": self.muse.connected,
            "config": self.muse.config
        });
    });

    this.muse.on('uncertain', function(){
        self.io.emit('muse_uncertain');
    })

    this.muse.on('disconnected', function(){
        self.io.emit('muse_disconnected');
    });
};

/*
 |--------------------------------------------------------------------------
 | Refresh listeners
 |-------------------------------------------------------------------------
 |
 | We simply remove all the listeners currently available and add the new
 | ones as requested
 |
 */

 webClass.prototype.refreshListeners = function(id, arr) {

    var self = this;

    // Loop through to delete
    if(self.museDataPathsRequested[id]) {
        for(var x in self.museDataPathsRequested[id]["paths"]) {
            self.muse.removeListener(x, self.museDataPathsRequested[id]["paths"][x]);
        }
    }

    // If it got disconnected or doesn't want data anymore, then we can
    // stop here and remove the connection
    if(arr.length == 0) {
        delete self.museDataPathsRequested[id];
        return false;
    }

    self.museDataPathsRequested[id]["paths"] = {};

    // Now add the new ones
    for(var path in arr) {
        self.museDataPathsRequested[id]["paths"][arr[path]] = (function() {
            return function(object) {
                self.museDataPathsRequested[id]["socket"].emit(object.path, object);
            }
        })();
        // Set the listener in the muse class
        self.muse.on(arr[path], self.museDataPathsRequested[id]["paths"][arr[path]]);
    }
 };

// Export the module!
module.exports = webClass;