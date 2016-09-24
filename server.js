// MEAN Stack RESTful API Tutorial - Contact List App

var express = require('express');
var app = express();
var mongojs = require('mongojs');
var db = mongojs('openhouse', ['openhouse']);
var userdb = mongojs('users', ['users']);
var bodyParser = require('body-parser');

var morgan      = require('morgan');
var mongoose    = require('mongoose');
var passport  = require('passport');
var config      = require('./public/config/database'); // get db config file
var User        = require('./public/models/user'); // get the mongoose model
var jwt         = require('jwt-simple');


// get our request parameters
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());

// Use the passport package in our application
app.use(passport.initialize());

// connect to database
mongoose.connect(config.database);

// pass passport for configuration
require('./public/config/passport')(passport);

app.post('/register', function(req, res) {
  if (!req.body.username || !req.body.password) {
    res.json({success: false, msg: 'Please pass name and password.'});
  } else {
    var newUser = new User({
      email: req.body.email,
      username: req.body.username,
      password: req.body.password
    });
    // save the user
    newUser.save(function(err) {
      if (err) {
        return res.json({success: false, msg: 'Username already exists.'});
      }
      res.json({success: true, msg: 'Successful created new user.', user: newUser});
    });
  }
});

// route to authenticate a user (POST http://localhost:8080/api/authenticate)
app.post('/authenticate', function(req, res) {
  User.findOne({
    username: req.body.username
  }, function(err, userprofile) {
    if (err) throw err;
    console.log(userprofile)
    if (!userprofile) {
      res.send({success: false, msg: 'Authentication failed. User not found.'});
    } else {
      // check if password matches
      userprofile.comparePassword(req.body.password, function (err, isMatch) {
        if (isMatch && !err) {
          // if user is found and password is right create a token
          var token = jwt.encode(userprofile, config.secret);
          // return the information including token as JSON
          res.json({success: true, token: 'JWT ' + token, user: userprofile});
        } else {
          res.send({success: false, msg: 'Authentication failed. Wrong password.'});
        }
      });
    }
  });
});

app.get('/users', function (req, res) {
  console.log('I received a GET request updated');
  db.users.find(function (err, docs) {
    console.log(docs);
    res.json(docs);
  });
});

app.get('/appartmentsByName/:name', function (req, res) {
  var name = req.params.name;
  console.log('I received a GET request for appartments with name: ' + name);
  db.openhouse.find({username: name}, function (err, doc) {
    res.json(doc);
  });
});

app.get('/pullAppartmentsAggreatesByName/:name', function (req, res) {
  var name = req.params.name;
  console.log('I received a GET request for appartments aggregates with name: ' + name);

  db.openhouse.aggregate([
    { $group: { _id: "$username", averageCost: { $avg: "$cost" } } }
  ], function(err, doc) {
    res.json(doc[0]);
  });
});

app.get('/openhouse', function (req, res) {
  console.log('I received a GET request updated');
  db.openhouse.find(function (err, docs) {
    console.log(docs);
    res.json(docs);
  });
});

app.post('/openhouse', function (req, res) {
  console.log(req.body);
  db.openhouse.insert(req.body, function(err, doc) {
    res.json(doc);
  });
});

app.delete('/openhouse/:id', function (req, res) {
  var id = req.params.id;
  console.log(id);

  db.openhouse.remove({_id: mongojs.ObjectId(id)}, function (err, doc) {
    res.json(doc);
  });

});

app.get('/openhouse/:id', function (req, res) {
  var id = req.params.id;
  console.log(id);
  db.openhouse.findOne({_id: mongojs.ObjectId(id)}, function (err, doc) {
    res.json(doc);
  });
});

app.put('/openhouse/:id', function (req, res) {
  var id = req.params.id;
  console.log(req.body.name);
  db.openhouse.findAndModify({
    query: {_id: mongojs.ObjectId(id)},
    update: {$set: {cost: req.body.cost, unitType: req.body.unitType, bedrooms: req.body.bedrooms,
      bathrooms: req.body.bathrooms, landlord: req.body.landlord, satisfied: req.body.satisfied,  food: req.body.food,
      schools: req.body.schools, community: req.body.community, nightlife: req.body.nightlife,
      transit: req.body.transit
    }},
    new: true}, function (err, doc) {
      res.json(doc);
    }
  );
});

app.listen(3000);
console.log("Server running on port 3000");
