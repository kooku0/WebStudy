# Elasticsearch and Node.js

> Elasticsearch 와 Node.js를 연동(?)해본다.
>
> [링크](https://www.compose.com/articles/getting-started-with-elasticsearch-and-node/) 를 참고하여 적었다.
>
> connection 전에는 elasticsearch를 실행해야하는 것을 명심하자
>
> elasticsearch에 대한 내용은 [링크](../Elastic/README.md)에서 확인할 수 있다.

## 1. Setting up your Node environment

먼저 `elasticsearch`와 `get-json`을 설치해준다.

주의해야할 사항이 있다면 상위 폴더 이름이 'elasticsearch'이면 제대로 설치가 이루어 지지 않는다.

```shell
npm install elasticsearch get-json
```

## 2. Referring to your deployment in Node

```javascript
// connection.js

var elasticsearch=require('elasticsearch');

var client = new elasticsearch.Client( {  
  hosts: [
    'http://[username]:[password]@[server]:[port]/',
    'http://[username]:[password]@[server]:[port]/'
  ]
});

module.exports = client;  
```

> Node의 주소를 적을때 'https'로 적으니 제대로 연결이 되지 않는 경우가 발생하였으나 'http'로 바꾸니 제대로 작동하였다.

```javascript
//info.js

var client = require('./connection.js');

client.cluster.health({},function(err,resp,status) {  
  console.log("-- Client Health --",resp);
});

```

위의 코드를 실행시켜 현재 clustering된 node들의 상태를 살펴보자

```javascript
-- Client Health -- { cluster_name: 'el-petitions',
  status: 'green',
  timed_out: false,
  number_of_nodes: 3,
  number_of_data_nodes: 3,
  active_primary_shards: 0,
  active_shards: 0,
  relocating_shards: 0,
  initializing_shards: 0,
  unassigned_shards: 0,
  delayed_unassigned_shards: 0,
  number_of_pending_tasks: 0,
  number_of_in_flight_fetch: 0 }
```

*status* 를 확인하면 된다.

## 3. Indexing

### 3.1 index 생성

예시로 gov' index를 만들어 보겠다. 어떠한 index를 만들어도 상관없다.

```javascript
//create.js

var client = require('./connection.js');

client.indices.create({  
  index: 'gov'
},function(err,resp,status) {
  if(err) {
    console.log(err);
  }
  else {
    console.log("create",resp);
  }
});
```

다음과 같은 화면을 볼 수 있을 것이다.

```shell
create { acknowledged: true }  
```

### 3.2 index 삭제

이번에는 index를 삭제하는 것을 해보겠다.

```javascript
//delete.js

var client = require('./connection.js');

client.indices.delete({index: 'gov'},function(err,resp,status) {  
  console.log("delete",resp);
});
```

결과

```shell
delete { acknowledged: true }  
```

### 3.3  document 삽입

이제 제대로된 데이터를 저장해보도록 하겠다.

```javascript
//document_add.js

var client = require('./connection.js');

client.index({  
  index: 'gov',
  id: '1',
  type: 'constituencies',
  body: {
    "ConstituencyName": "Ipswich",
    "ConstituencyID": "E14000761",
    "ConstituencyType": "Borough",
    "Electorate": 74499,
    "ValidVotes": 48694,
  }
},function(err,resp,status) {
    console.log(resp);
});
```

결과

```javascript
{ _index: 'gov',
  _type: 'constituencies',
  _id: '1',
  _version: 1,
  created: true }
```

index의 값과 version등이 나오게  된다.

 

> 이번에는 `info.js` 에 코드를 한줄 추가해 보
>
>```javascript
>...
>client.count({index: 'gov',type: >'constituencies'},function(err,resp,status) {  
>  console.log("constituencies",resp);
>});
>```
>
> 이제 info.js를 실행해보면 
>
> 생성된 constituency 하나를 볼 수 있다.



### 3.4 document  삭제

삽입한 document를 삭제해보자.

```javascript
//document_del.js

var client = require('./connection.js');

client.delete({  
  index: 'gov',
  id: '1',
  type: 'constituencies'
},function(err,resp,status) {
    console.log(resp);
});
```

결과

```shell
{ found: true,
  _index: 'gov',
  _type: 'constituencies',
  _id: '1',
  _version: 3 }
```

>  여기서 info.js를 실행해보면 document count가 이제 0이 된 것을 알 수 있다.



### 3.5 bulk - 다중 삽입

만약 많은 document를 동시에 삽입하고 싶다면  `bulk`를 이용하여 쉽게 삽입할 수 있다.

index format과 유사하며 index 와 document의 id, type을 하는 object 와 하나의 body를 전송하게 된다. 예제 코드는 다음과 같다.

```javascript
var client = require('./connection.js');
var inputfile = require("./constituencies.json");
var bulk = [];

var makebulk = function(constituencylist,callback){
  for (var current in constituencylist){
    bulk.push(
      { index: {_index: 'gov', _type: 'constituencies', _id: constituencylist[current].PANO } },
      {
        'constituencyname': constituencylist[current].ConstituencyName,
        'constituencyID': constituencylist[current].ConstituencyID,
        'constituencytype': constituencylist[current].ConstituencyType,
        'electorate': constituencylist[current].Electorate,
        'validvotes': constituencylist[current].ValidVotes,
        'regionID': constituencylist[current].RegionID,
        'county': constituencylist[current].County,
        'region': constituencylist[current].Region,
        'country': constituencylist[current].Country
      }
    );
  }
  callback(bulk);
}

var indexall = function(madebulk,callback) {
  client.bulk({
    maxRetries: 5,
    index: 'gov',
    type: 'constituencies',
    body: madebulk
  },function(err,resp,status) {
      if (err) {
        console.log(err);
      }
      else {
        callback(resp.items);
      }
  })
}

makebulk(inputfile,function(response){
  console.log("Bulk content prepared");
  indexall(response,function(response){
    console.log(response);
  })
});
```

## 4. Searching

우리가 가장 원하는 searching은 다음과 같다.

```javascript
//search.js

var client = require('./connection.js');

client.search({  
  index: 'gov',
  type: 'constituencies',
  body: {
    query: {
      match: { "constituencyname": "Harwich" }
    },
  }
},function (error, response,status) {
    if (error){
      console.log("search error: "+error)
    }
    else {
      console.log("--- Response ---");
      console.log(response);
      console.log("--- Hits ---");
      response.hits.hits.forEach(function(hit){
        console.log(hit);
      })
    }
});
```

