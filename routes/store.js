var express = require('express');
var router = express.Router();
var db=require('../database');



let data= [{
  store_id : 1,
  imgUrl : "/img/1"
},
{
  store_id : 2,
  imgUrl : "/img/2"
},
];
/* GET users listing. */
router.get('/list', function(req, res, next) {
  db.query('SELECT id, imgUrl from Store',(err,results)=>{
    if(err) throw err;
    console.log('StoreList : ',results);
    res.send(results);
  });
});

router.get('/:id',function(req,res){
  db.query(
    'SELECT s.id, s.store_name, s.information, s.location,c.name,s.deposit from Store as s join Category as c on s.category_id=c.id where s.id=?',[req.params.id],(err,result)=>{
    if(err) throw err;
    console.log('Store ',req.params.id," :",result);
    res.send(result[0]);
  })
});

module.exports = router;
