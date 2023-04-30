# Back

## API

**GET** `/store/list` : 가게 리스트 데이터

```json
"data" : [
	{
		"store_id" :1,
		"imgUrl" : "store/img/1"
	},
	{
		"store_id" :2,
		"imgUrl" : "store/img/2"
	},
]
```

**GET** `/store/?id` : 가게 정보

```json
"data" : {
	"store_id" : 1,
	"location" : "가게1",
	"information" : "안녕하세요. 가게 1입니다.",
	"category" : "음식점",
	"deposit" : 0.04
}
```

**POST** `/reservate` : 가게 예약

**Request Data**

```json
"reservation" : {
	"storeId" : 1,
	"resDate" : "2023/04/30",
	"timeIndex" : 3,
	"number" : 3,
}
```

**Response Data**

```json
"data" :{
	"qrImageUrl" : ""
}
```

