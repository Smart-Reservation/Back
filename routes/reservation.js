var express = require('express');
var router = express.Router();
var db = require('../database');

router.get('/list/:storeId', function (req, res) {
    db.query(
        'SELECT time,number FROM Reservation WHERE store_id=?', req.params.storeId, (err, result) => {
            if (err) throw err;
            res.send(result);
        }
    )
});

router.get('/list/personal/:address',function(req,res){
    db.query(
        'SELECT Store.store_name, time,number FROM Reservation natural join Store WHERE address=?', req.params.address, (err, result) => {
            if (err) throw err;
            res.send(result);
        }
    )
})

router.post('/reservate', function (req, res) {
    db.query(
        'SELECT * FROM Reservation WHERE store_id=? and time=?', [req.body.data.storeId, req.body.data.time], (err, result) => {
            if (err) throw err;
            if ((result === undefined || result.length === 0)) {
                db.query(
                    'INSERT INTO Reservation(store_id, address, time,number) VALUE(?,?,?,?)', [req.body.data.storeId, req.body.data.address, req.body.data.time, req.body.data.number], (err) => {
                        console.log('insert: ', req.body.data.storeId, req.body.data.address, req.body.data.time, req.body.data.number);
                        // 체인에 송금 요청 req.body.data.address
                        res.send("예약되었습니다.");
                    })
            }
            else {
                res.status(400).send("예약자가 이미 존재합니다.");
            }
        });
})




module.exports = router;
