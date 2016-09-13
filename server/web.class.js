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
var ObjectId = require('mongodb').ObjectID;

var leapjs = require('leapjs');
var controller  = new leapjs.Controller({enableGestures: true});

controller.on('connect', function() {
  console.log("Successfully connected.");
});

controller.on('deviceConnected', function() {
  console.log("A Leap device has been connected.");
});

controller.on('deviceDisconnected', function() {
  console.log("A Leap device has been disconnected.");
});

controller.on('deviceFrame', function(frame) {
  var numberOfFingers = frame.fingers.length;
  console.log(numberOfFingers);
});

controller.connect();

var url = 'mongodb://localhost:27017/test'; // type of server, location, what port, and specific location
    
var collectionName = 'thoughtObjects';

var bodyParser = require('body-parser');

var insertDocument = function(db, userObject, callback) {
   userObject.timeCreated = new Date(); 
   var collection = db.collection(collectionName).insertOne( userObject, function(err, result) {
    assert.equal(err, null);
    console.log("Inserted a document into the", collectionName, "collection.");
    callback();
  });
};


// var getDocument = function(db, query, callback){
//    var cursor = db.collection(collectionName).find( query );
//    cursor.each(function(err, doc) {
//       assert.equal(err, null);
//       if (doc !== null) {
//          callback(doc);
//       }
//    });




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
    this.app.use(bodyParser.json()); // for parsing application/json
    this.app.use(bodyParser.urlencoded({ extended: true }));
    this.app.use('/assets', express.static( path.resolve( __dirname + '/../client/assets' ) ) );
    this.app.use('/lib', express.static( path.resolve( __dirname + '/../client/lib' ) ) );
    this.app.use('/vendor', express.static( path.resolve( __dirname + '/../client/vendor' ) ) );

    this.app.get('/', function (req, res) {
      var findFunction;
      var cursor;
        // TODO: define queryParam based on request
        // if req is json pass in json

        // console.log(req);
        console.log(req.xhr)
        if (req.xhr) {
            // get json from Mongo

            if (req.query.hasOwnProperty('getBy') && req.query.getBy === 'most recent time stamp') {
                // request for recent
                findFunction = function(db) {

                    return db.collection(collectionName).find().sort({"timeCreated": -1}).limit(20); 
                }
            }
            MongoClient.connect(url, function(err, db) {
              assert.equal(null, err); // if err is null, then continue. if error is not null, then freak out
              console.log("Connected correctly to Mongo server.");
              // TODO: define getDocument function with 3 parameters; user insertDocument as template
              // getDocument(db, queryParam, function(data){
              //   db.close();
              //   res.send(data);
              // });
                var cursor = findFunction(db);
                cursor.toArray(function(err, docs) {
                  assert.equal(err, null);
                  if (docs !== null) {
                     res.send(docs);
                  }
                });

               
            });
        } else  {

            res.sendFile( path.resolve( __dirname + '/../client/index.html' ) );
        }
        // else
        
    });

    this.app.post('/', function(req, res){
        // TODO: define userObject based on req
        var userObject = req.body; 
        console.log('entire request', req);
        console.log('about to save to mongo:', userObject)
        // save req data to mongo
        MongoClient.connect(url, function(err, db) {
          assert.equal(null, err); // if err is null, then continue. if error is not null, then freak out
          console.log("Connected correctly to Mongo server.");
          insertDocument(db, userObject, function(){
            db.close();
            res.send('Object saved!')
          });
        });
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