const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

app.use(cors());
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

const createNewUser = require('./myApp.js').createNewUser;
const findUser = require('./myApp.js').findUser;
const addExercise = require('./myApp.js').addExercise;
const findAllUsers = require('./myApp.js').findAllUsers;
const filterExercises = require('./myApp.js').filterExercises;
const removeDocs = require('./myApp.js').removeDocs;

app.post('/api/users', (req, res) => {
  createNewUser(req.body.username, (err, user) => {
    if (err) return console.err(error);
    res.json({username: user.username, _id: user._id});
  });
});

app.get('/api/users', (req, res) => {
  findAllUsers((err, data) => {
    res.json(data)
  });
});

app.post('/api/users/:_id/exercises', (req, res) => {
  findUser(req.params._id, (err, doc) => {
    if (err) return console.err(error);
    addExercise(
      req.body.description,
      req.body.duration,
      req.body.date,
      doc, (err, data) => {
      if (err) return console.err(error);
      const exercises = data.log[data.log.length - 1];
      res.json({
        username: data.username,
        description: exercises.description,
        duration: exercises.duration,
        date: new Date(exercises.date).toDateString(),
        _id: data._id
      });
    });
  });
});

app.get('/api/users/:id/logs', (req, res) => {
  const from = req.query['from'];
  const to = req.query['to'];
  const limit = Number(req.query['limit']);
  findUser(req.params.id, (err, doc) => {
    if (err) return console.error(err);
    if (Date.parse(from) || Date.parse(to)) {
      doc.log = doc.log.filter(item => {
        if (item.date >= from && item.date <= to) return item;
        if (item.date >= from) return item;
        if (item.date <= to) return item;
      });
    }
    doc.log.map(item => item.date = new Date(item.date).toDateString());
    if (limit) doc.log = doc.log.slice(0, limit);
    res.json(doc);
  });
});
  /*filterExercises(req.params.id, from, to, limit, (err, data) => {
    if (err) return console.error(err);
    if(data === null) return next();
    res.json(data);
  });
}, (req, res) => {
  findUser(req.params.id, (err, data) => {
    if (err) return console.error(err);
    data.log.map(item => item.date = new Date(item.date).toDateString());
    res.json(data);
  });
});*/

app.get('/delete', (req, res) => {
  removeDocs((err, docs) => {
    if (err) return console.err(error);
    res.json(docs);
  });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
});
