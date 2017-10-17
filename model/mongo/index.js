const mongoose = require('mongoose');

// Establish mongoose connection
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/reminder_hero', {
  useMongoClient: true
});

const Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;
 
const ReminderSchema = new Schema({
    name      : { type: String, required: true },
    date      : {
      year: { type: Number, default: null },
      month: { type: Number, required: true},
      day: { type: Number, required: true }
    }
});

const ReminderModel = mongoose.model('reminders', ReminderSchema);

module.exports = {
  ReminderModel
}