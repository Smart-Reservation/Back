var express = require('express');
var router = express.Router();

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
router.get('/storeList', function(req, res, next) {
  res.send(data);
});

router.get('/${id}',function(req,res){
  
});

module.exports = router;
