const root = require('node-root.pddivine');

const CronJob = require('cron').CronJob;
const twilio = require('twilio');
const { accountSid, authToken, sendingNumber, receivingNumber } = require('config').twilio;
if ([ accountSid, authToken, sendingNumber, receivingNumber ].includes(null)) { throw 'Missing configurations.'; }

const { ReminderModel } = require(root + '/model/mongo');

const client = new twilio(accountSid, authToken);

const every = '*';

const frequency = {
  atSecond: 0,
  atMinute: 0,
  atHour: 9,
  dayOfMonth: every,
  atMonths: every,
  dayOfWeek: every
};

const chronPhrase = Object.keys(frequency).reduce((acc, cur) => {
  return acc.push(frequency[cur]) && acc;
}, []).join(' ');

new CronJob(chronPhrase, executeReminders, null, true, 'America/Los_Angeles');

function executeReminders () {

  // Get reminders
  ReminderModel.find({}).exec()

  .then(reminders => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const remindersToExecute = reminders.reduce((acc, reminder) => {
      // Remind month before, week before, day before, and on day.
      const reminderDate = new Date(today.getFullYear(), reminder.date.month - 1, reminder.date.day);
      const differenceInDays = Math.floor((reminderDate.getTime() - today.getTime())/(1000 * 60 * 60 * 24));

      if ([30, 7, 1, 0].includes(differenceInDays)) {
        console.log(true, reminder.name)
        const message = `${reminder.name} is in ${differenceInDays} day(s), on ${reminder.date.month}/${reminder.date.day}.`;

        client.messages.create({
          from: sendingNumber,
          to: receivingNumber,
          body: `${message} - ReminderHero`
        })
        .then((message) => console.log(message.sid))
        .catch(e => {
          console.log('err', e);
        });
      }
    }, []);

  })

  //Handle exceptions
  .catch(e => {
    console.log('err', e)
  }); 

}

executeReminders();