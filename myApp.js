const mongoose = require('mongoose');
const { Schema } = mongoose;
const mySecret = process.env['URI'];

mongoose.connect(mySecret, { useNewUrlParser: true, useUnifiedTopology: true });

const logSubsSchema = new Schema({
  description: String,
  duration: Number,
  date: String,
}, {_id: false});

const userSchema = new Schema({
  username: String,
  count: Number,
  _id: mongoose.ObjectId,
  log: [logSubsSchema]
}, {versionKey: 'count'});

const Users = mongoose.model('Users', userSchema);

const createNewUser = (name, done) => {
  Users.create({
    username: name,
    count: 0,
    _id: new mongoose.Types.ObjectId(),
    log: []
    }, (err, doc) => {
    if (err) return console.error(err);
    doc.save((err, data) => {
      if (err) return console.error(err);
      done(null, data);
    });
  });
};

const addExercise = (desc, dur, date, doc, done) => {
  if(new Date(date) == "Invalid Date") date = new Date().toISOString().slice(0,10);
  doc.log.push({
      description: desc,
      duration: dur,
      date: date,
    });
  doc.save((err, data) => {
    if (err) return console.error(err);
    done(null, data);
  });
};

const findUser = (id, done) => {
  Users.findById(mongoose.Types.ObjectId(id), (err, doc) => {
    if (err) return console.error(err);
    done(null, doc);
  });
};

const findAllUsers = (done) => {
  Users.find({}).select('username _id').exec((err, docs) => {
    if (err) return console.error(err);
    done(null, docs);
  });
};

const removeDocs = (done) => {
  Users.deleteMany({}, (err, docs) => {
    done(null, docs);
  });
} 

const filterExercises = (id, from, to, limit, done) => {
  Users.findById(mongoose.Types.ObjectId(id), (err, doc) => {
    if (err) return console.error(err);
    if (doc === null) return done(null, null);
    doc.log = doc.log.filter(item => {
      if (item.date >= from && item.date <= to) {
        item.date = new Date(item.date).toDateString();
        return item;
      };
    });
    doc = Object.assign({
      from: new Date(from).toDateString(),
      to: new Date(to).toDateString()
      }, doc._doc);
    doc.log = doc.log.slice(0, limit);
    done(null, doc);
  });
};

exports.createNewUser = createNewUser;
exports.findUser = findUser;
exports.addExercise = addExercise;
exports.findAllUsers = findAllUsers;
exports.filterExercises = filterExercises;
exports.removeDocs = removeDocs;