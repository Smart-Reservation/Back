var express = require('express');
var router = express.Router();
var db = require('../database');


//가게 리스트
router.get('/list', function (req, res, next) {
  db.query('SELECT Store.id, store_name as storeName, c.name as category,location,deposit, imgUrl FROM Store JOIN Category as c on c.id=Store.category_id', (err, results) => {
    if (err) throw err;
    res.send(results);
  });
});

//가게 정보
router.get('/:id', function (req, res) {
  db.query(
    'SELECT id, store_name as storeName, Category.name as category,location,deposit, imgUrl FROM Store JOIN Category as c on c.id=Store.category_id where id=?', [req.params.id], (err, result) => {
      if (err) throw err;
      console.log('Store ', req.params.id, " :", result);
      res.send(result[0]);
    })
});

module.exports = router;
