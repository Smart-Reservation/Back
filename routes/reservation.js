var express = require('express');
var router = express.Router();
var db = require('../database');


const periodList = [10, 11, 12, 13, 14, 15, 16, 17];

//가게 예약 리스트
router.get('/list/:storeId', function (req, res) {
    const reservationList = [];
    db.query(
        'SELECT address,time as reservation_date,number FROM Reservation WHERE store_id=?', req.params.storeId, (err, reservationTimeList) => {
            if (err) throw err;
            reservationTimeList.forEach((reservationTime) => {
                const date = new Date(reservationTime.reservation_date)
                const dateObj = {
                    year: date.getFullYear(),
                    month: date.getMonth() + 1,
                    day: date.getDate(),
                }
                const reserveDate = reservationList.find((reservation) => JSON.stringify(reservation.date) === JSON.stringify(dateObj));
                if (reservationList.length > 0 && reserveDate) {
                    reserveDate.reservedList = reserveDate.reservedList.concat({
                        index: periodList.indexOf(date.getHours()),
                        numbers: reservationTime.number,
                        address: reservationTime.address
                    })
                } else {
                    reservationList.push(
                        {
                            storeId: Number(req.params.storeId),
                            date: dateObj,
                            impossibleIdxList: [],
                            reservedList: [
                                {
                                    index: periodList.indexOf(date.getHours()),
                                    numbers: reservationTime.number,
                                    address: reservationTime.address
                                }
                            ]
                        }
                    );
                }
            })
            db.query(
                'SELECT time FROM UnavailableTime where store_id=?', [req.params.storeId], (err, unavailableList) => {
                    if (err) throw err;
                    unavailableList.forEach((unavailable) => {
                        const date = new Date(unavailable.time)
                        const dateObj = {
                            year: date.getFullYear(),
                            month: date.getMonth() + 1,
                            day: date.getDate(),
                        }
                        const unavailableDate = reservationList.find((reservation) => JSON.stringify(reservation.date) === JSON.stringify(dateObj));
                        if (reservationList.length > 0 && unavailableDate) {
                            unavailableDate.impossibleIdxList = unavailableDate.impossibleIdxList.concat(periodList.indexOf(date.getHours()))
                        } else {
                            reservationList.push(
                                {
                                    storeId: Number(req.params.storeId),
                                    date: dateObj,
                                    impossibleIdxList: [periodList.indexOf(date.getHours())],
                                    reservedList: []
                                }
                            );
                        }
                    })
                    res.send(reservationList)
                })
        }
    )

});

//유저의 예약 리스트
router.get('/list/personal/:address', function (req, res) {
    db.query(
        'SELECT store_id as id, time,number FROM Reservation WHERE address=?', req.params.address, (err, result) => {
            if (err) throw err;
            const reservationlist = result.map((data) => {
                const date = new Date(data.time)
                return {
                    storeId: data.id,
                    date: {
                        year: date.getFullYear(),
                        month: date.getMonth() + 1,
                        day: date.getDate()
                    },
                    numbers: data.number,
                    index: periodList.indexOf(date.getHours())
                }
            })
            res.send(reservationlist);
        }
    )
})

//예약 불가능 리스트 추가
router.post('/unavailable/add', function (req, res) {
    //예약 불가능 리스트에 이미 있는지 확인
    db.query(
        'SELECT * FROM UnavailableTime WHERE store_id=? and time=?', [req.body.storeId, req.body.time], (err, result) => {
            if (err) throw err;
            if ((result === undefined || result.length === 0)) {
                db.query(
                    'INSERT INTO UnavailableTime(store_id,time) VALUES(?,?)', [req.body.storeId, req.body.time], (err, result) => {
                        if (err) throw err;
                        res.send("Success");
                    })
            }
            else {
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
                        db.query(
                            'SELECT * FROM Reservation JOIN Store on Reservation.store_id=Store.id WHERE Store.id=? and time=?', [req.body.data.storeId, req.body.data.time], (err, data) => {
                                res.send({
                                    id: data[0].id,
                                    ownerAddress: data[0].owner,
                                    deposit: data[0].deposit * data[0].number
                                });
                            }
                        )
                    })
            }
            else {
                res.status(400).send("Failed");
            }
        });
})


//예약 취소
router.post('/cancel', function (req, res) {
    //off-chain에 예약기록 있는지 확인
    db.query('SELECT * FROM Reservation where store_id=? and address=? and time=? ', [req.body.storeId, req.body.address, req.body.time], (err, result) => {
        if (err) throw err;
        if (!(result === undefined || result.length === 0)) {
            /**
             * @todo on-chain에 송금 기록 있는지 확인
             * */
            db.query(
                'DELETE FROM Reservation where store_id=? and address=? and time=?', [req.body.storeId, req.body.address, req.body.time], (err) => {
                    if (err) throw err;
                    console.log('delete: ', req.body.storeId, req.body.address, req.body.time);
                    /**@todo chain에 예약 취소 송금요청 */
                    res.send("Success");
                })
        } else {
            res.status(400).send("Failed");
        }
    })
})


//예약 정상 처리
router.post('/showUp', function (req, res) {
    //off-chain에 예약기록 있는지 확인
    db.query('SELECT * FROM Reservation where store_id=? and address=? and time=? ', [req.body.storeId, req.body.address, req.body.time], (err, result) => {
        if (err) throw err;
        if (!(result === undefined || result.length === 0)) {

            /**
             * @todo on-chain에 송금 기록 있는지 확인
             * */

            db.query(
                'DELETE FROM Reservation where store_id=? and address=? and time=?', [req.body.storeId, req.body.address, req.body.time], (err) => {
                    if (err) throw err;
                    console.log('delete: ', req.body.storeId, req.body.address, req.body.time,);

                    /**
                     * @todo chain에 정상처리 송금요청
                     * */

                    res.send("Success");
                })
        } else {
            res.status(400).send("Failed");
        }
    })
})



module.exports = router;
