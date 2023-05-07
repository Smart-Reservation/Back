var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors = require('cors');

const cron = require('node-cron');

var db = require('./database');
var indexRouter = require('./routes/index');
var storeRouter = require('./routes/store');
var reservationRouter= require('./routes/reservation');
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());

app.use('/', indexRouter);
app.use('/store', storeRouter);
app.use('/reservation',reservationRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');  
});

//예약 부도
cron.schedule('*/10 * * * *', function noShow() {
  console.log("Scheduling");
  db.query('SELECT * FROM Reservation WHERE  TIMESTAMPDIFF(MINUTE,time,NOW())>=20', (err, result) => {
    if (err) {
      throw err;
    }
    console.log(result);
    
    if (result.length !== 0) {
      /**
       * @todo chain에 예약 부도 
      */
      db.query('DELETE FROM Reservation WHERE  TIMESTAMPDIFF(MINUTE,time,NOW())>=20', (err, res) => {
        if (err) {
          throw err;
        }
        console.log('DELETE Reservation By NoShow');
      });
    }
  });
});

module.exports = app;
