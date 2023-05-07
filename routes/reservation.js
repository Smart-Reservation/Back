var express = require('express');
var router = express.Router();
var db = require('../database');

//가게 예약 리스트
router.get('/list/:storeId', function (req, res) {
    db.query(
        'SELECT time,number FROM Reservation WHERE store_id=?', req.params.storeId, (err, result) => {
            if (err) throw err;
            res.send(result);
        }
    )
});

//유저의 예약 리스트
router.get('/list/personal/:address',function(req,res){
    db.query(
        'SELECT Store.store_name, time,number FROM Reservation natural join Store WHERE address=?', req.params.address, (err, result) => {
            if (err) throw err;
            res.send(result);
        }
    )
})

//가게의 예약 불가능한 시간 리스트
router.get('/unavailable/:storeId',function(req,res){
    //예약 불가능 리스트에 이미 있는지 확인
    db.query(
        'SELECT time FROM UnavailableTime where store_id=?',req.params.storeId,(err,result)=>{
            if(err)throw err;
            const timeList=result.map((data)=>data.time)
            res.send(timeList);
        }
    )
})

//예약 불가능 리스트 추가
router.post('/unavailable',function(req,res){
    //예약 불가능 리스트에 이미 있는지 확인
    db.query(
        'SELECT * FROM UnavailableTime WHERE store_id=? and time=?',[req.body.storeId, req.body.time],(err,result)=>{
            if (err) throw err;
            if ((result === undefined || result.length === 0)) {
                db.query(
                    'INSERT INTO UnavailableTime(store_id,time) VALUES(?,?)',[req.body.storeId, req.body.time],(err,result)=>{
                        if(err) throw err;
                        res.send("Success");
                    })
            }
            else{
                res.status(400).send("error");
            }
        })
})

//예약
router.post('/reservate', function (req, res) {
    //off-chain에 예약기록 있는지 확인
    db.query(
        'SELECT * FROM Reservation WHERE store_id=? and time=?', [req.body.data.storeId, req.body.data.time], (err, result) => {
            if (err) throw err;
            if ((result === undefined || result.length === 0)) {
                db.query(
                    'INSERT INTO Reservation(store_id, address, time,number) VALUE(?,?,?,?)', [req.body.data.storeId, req.body.data.address, req.body.data.time, req.body.data.number], (err) => {
                        if (err) throw err;
                        console.log('insert: ', req.body.data.storeId, req.body.data.address, req.body.data.time, req.body.data.number);
                        // 체인에 송금 요청 req.body.data.address
                        res.send("Success");
                    })
            }
            else {
                res.status(400).send("Failed");
            }
        });
})


//예약 취소
router.post('/cancel',function(req,res){
    //off-chain에 예약기록 있는지 확인
    db.query('SELECT * FROM Reservation where store_id=? and address=? and time=? ',[req.body.storeId,req.body.address, req.body.data.time],(err,result)=>{
        if(err)throw err;
        if (!(result === undefined || result.length === 0)) {
            /**
             * @todo on-chain에 송금 기록 있는지 확인
             * */
            db.query(
                'DELETE FROM Reservation where store_id=? and address=? and time=?', [req.body.data.storeId, req.body.data.address, req.body.time], (err) => {
                    if (err) throw err;
                    console.log('delete: ', req.body.data.storeId, req.body.data.address, req.body.data.time, req.body.data.number);
                    /**@todo chain에 예약 취소 송금요청 */ 
                    res.send("Success");
                })
        }else{
            res.status(400).send("Failed");
        }
    })
})


//예약 정상 처리
router.post('/showUp',function (req,res) {
    //off-chain에 예약기록 있는지 확인
    db.query('SELECT * FROM Reservation where store_id=? and address=? and time=? ',[req.body.storeId,req.body.address, req.body.data.time],(err,result)=>{
        if(err)throw err;
        if (!(result === undefined || result.length === 0)) {
            
            /**
             * @todo on-chain에 송금 기록 있는지 확인
             * */

            db.query(
                'DELETE FROM Reservation where store_id=? and address=? and time=?', [req.body.data.storeId, req.body.data.address, req.body.time], (err) => {
                    if (err) throw err;
                    console.log('delete: ', req.body.data.storeId, req.body.data.address, req.body.data.time, req.body.data.number);

                    /**
                     * @todo chain에 정상처리 송금요청
                     * */ 
                    
                    res.send("Success");
                })
        }else{
            res.status(400).send("Failed");
        }
    })
})



module.exports = router;
