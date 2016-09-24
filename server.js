// MEAN Stack RESTful API Tutorial - Contact List App

var express = require('express');
var app = express();
var mongojs = require('mongojs');
var db = mongojs('openhouse', ['openhouse']);
var bodyParser = require('body-parser');

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());

app.get('/openhouse', function (req, res) {
  console.log('I received a GET request');

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
      bathrooms: req.body.bathrooms, satisfied: req.body.satisfied, food: req.body.food,
      schools: req.body.schools, community: req.body.community, : req.body.nightlife,
      chools: req.body.schools
    }},
    new: true}, function (err, doc) {
      res.json(doc);
    }
  );
});

app.listen(3000);
console.log("Server running on port 3000");