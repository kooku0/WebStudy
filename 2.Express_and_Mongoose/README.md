# 2. Express and Mongoose

> 책 `Node.js 교과서`를 참고하여 작성하였습니다.

![mongoDB](./img/mongoDB.png)

몽고디비의 특징 중 하나는 자바스크립트 문법을 사용한다는 것이다. 노드도 자바스크립트를 사용하므로 데이터베이스마저 몽고디비를 사용한다면 생산성을 높힐 수 있다.

> **SQL vs NoSQL** 
>
> |       SQL(MySQL)        |    NoSQL(mongoDB)    |
> | :---------------------: | :------------------: |
> | 규칙에 맞는 데이터 입력 | 자유로운 데이터 입력 |
> | 테이블 간 JOIN 지원 | 컬렉션 간 JOIN 미지원 |
> | 트랜잭션 지원 | 트랜잭션 미지원 |
> | 안정성, 일관성 | 확장성, 가용성 |
> | 용어(table, row, colum) | 용어(collection, document, field) |
>
> 많은 기업에서 SQL과 NoSQL을 동시에 사용하는데, 예약 시스템의 경우 모든 항공사에 일관성 있게 전달해야 하므로 MySQL을 하용하고, 핵심 기능 외의 빅데이터, 메시징의 경우 MongoDB를 많이 사용한다.

몽고디비 설치: [윈도우(Windows)에 MongoDB 설치하기](http://solarisailab.com/archives/1605) 

우선 몽고디비를 설치하자.

node.js의 경우 편하게 `Express-generator` 를 사용하겠습니다.

```shell
$ npm i express-generator
$ express learn-mongoose --view=pug
```

`--view=pug` 는 jade가 default이기에 pug로 바꾸어주기 위해서 입니다.

프로젝트 명은 `learn-mongoose` .

완료 후 learn-mongoose 폴더로 이동해 npm 패키지들을 설치한다.

```shell
$ cd learn-mongoose
$ npm install
```

## 몽고디비 연결하기

이제 몽구스를 설치한다.

```shell
$ npm i mongoose
```

몽고디비는 주소를 사용해 연결되는데, 주소형식은 `mongodb://[username:password@]host[:port][/[database][?options]]` 과 같습니다.

[] 부분은 있어도 되고 없어도 됨을 의미합니다.

우선 다음과 같이 디렉터리와 파일을 만들어준다.

```shell

│  app.js
│  package-lock.json
│  package.json
│
├─bin
│      www
│
├─public
│  ├─images
│  ├─javascripts
│  │      mongoose.js
│  │
│  └─stylesheets
│          style.css
│
├─routes
│      comments.js
│      index.js
│      users.js
│
├─schemas
│      comment.js
│      index.js
│      user.js
│
└─views
        error.pug
        index.pug
        layout.pug
        mongoose.pug
```



접속을 시도하는 데이터베이스는 admin이지만, 실제로 사용할 데이터베이스는 nodejs이므로  두 번째 인자로 dbName 옵션을 주어 nodejs 데이터베이스를 사용하게 했습니다. 마지막 인자로 주어진 콜백 함수를 통해 연결 여부를 확인합니다. mongoose connection에 이벤트 리스너를 달아, 에러 발생 시 에러내용을 기록하고, 연결 종료 시 재연결을 시도합니다.

```javascript
//schemas/index.js

const mongoose = require('mongoose');

module.exports = () => {
  const connect = () => {

    if (process.env.NODE_ENV !== 'production') {    
    mongoose.set('debug', true);
  }
    mongoose.connect('mongodb://localhost:27017/admin', {  
    dbName:'nodejs',
  }, (error) => {
      if (error) {
        console.log('몽고디비 연결 에러', error);
      } else {
        console.log('몽고디비 연결 성공');
      }
    });
  };
  connect();
  mongoose.connection.on('error', (error) => {
  console.error('몽고디비 연결 에러', error);
});
mongoose.connection.on('disconnected', () => {
  console.error('몽고디비 연결이 끊겼습니다. 연결을 재시도합니다.');
  connect();
  });
    //User 스키마와 Comment 스키마를 연결하는 부분입니다.
    require('./user');
    require('./comment');
};
```

schemas/index.js를 app.js와 연결하여 노드 실행 시 mongoose.connect 부분도 실행되도록하겠습니다.

```javascript
//app.js

...
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var commentsRouter = require('./routes/comments');
var connect = require('./schemas');

var app = express();
connect();
...
```



## 스키마 정의하기

mongoose 스키마를 만들어봅시다.

마지막에 몽구스의 model 메서드로 스키마와 몽고디비 컬렉션을 연결하는 모델을 만듭니다.

```javascript
//schemas/user.js

const mongoose = require('mongoose');

const { Schema } = mongoose;
const userSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  age: {
    type: Number,
    required: true,
  },
  married: {
    type: Boolean,
    required: true,
  },
  comment: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('User', userSchema);
```

댓글 스키마도 만들어봅시다.

```javascript
const mongoose = require('mongoose');

const { Schema } = mongoose;
const { Types: { ObjectId } } = Schema;
const commentSchema = new Schema({
  commenter: {
    type: ObjectId,
    required: true,
    ref:'User',
  },
  comment: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Comment', commentSchema);

```

commenter 속성만 보

