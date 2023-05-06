var express = require('express');
var router = express.Router();
var db = require('../database');


/* GET users listing. */
router.get('/list', function (req, res, next) {
  db.query('SELECT id, store_name, location,deposit, imgUrl from Store', (err, results) => {
    if (err) throw err;
    console.log('StoreList : ', results);
    res.send(results);
  });
});

router.get('/:id', function (req, res) {
  db.query(
    'SELECT s.id, s.store_name, s.information, s.location,c.name,s.deposit from Store as s join Category as c on s.category_id=c.id where s.id=?', [req.params.id], (err, result) => {
      if (err) throw err;
      console.log('Store ', req.params.id, " :", result);
      res.send(result[0]);
    })
});

module.exports = router;
