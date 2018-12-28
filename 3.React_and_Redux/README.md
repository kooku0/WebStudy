# 3. React and Redux

> Redux를 통한 React 어플리케이션 상태 관리
>
> 해당내용은 [Redux 를 통한 React 어플리케이션 상태 관리 :: 1장. 카운터 만들기](https://velopert.com/3346)를 참고하여 만들었습니다.



<img src='./img/logo.png' width='800pt'> </img>




### 1 작업환경 설정

create-react-app을 통하여 프로젝트를 생성하고, redux와 react-redux를 설치합니다.

```shell
$ create-react-app redux-counter
$ cd redux-counter
$ yarn add redux react-redux
```

#### 프로젝트 초기화

다음 파일들을 제거합니다.

* App.css
* App.js
* App.test.js
* logo.svg

#### 디렉토리 생성

src 디렉토리 내부에 다음과 같은 데렉토리를 만들어주세요.

* actions: 액션타입, 액션생성자 파일이 저장됩니다.
* components: 뷰만을 담당하는 `presenttional` 컴포넌트들이 저장됩니다.
* containers: store에 접근이 닿는 `container` 컴포넌트들이 저장됩니다.
* reducers: 스토어의 기본상태와, 상태의 업데이트를 담당하는 리듀서 파일들이 저장됩니다.
* utils: 일부 컴포넌트들에서 공용되는 파일이 저장됩니다.



### 2 Presentational 컴포넌트와 Container 컴포넌트

프리젠테이셔널 컴포넌트와 컨테이너 컴포넌트는, 리덕스를 사용하는 프로젝트에서 자주 사용되는 구조입니다.

#### Presentational component

프리젠테이셔널 컴포넌트는 오직 뷰만을 담당하는 컴포넌트입니다. 이 안에는 DOM 엘리먼트, 그리고 스타일을 갖고 있으며, 프리젠테이셔널 컴포넌트나 컨테이너 컴포넌트를 가지고 있을 수도 있습니다. 하지만, 리덕스의 스토어에는 직접적인 접근 권한이 없으며 오직 props 로만 데이터를 가져올수 있습니다. 또한, 대부분의 경우 state 를 갖고있지 않으며, 갖고있을 경우엔 데이터에 관련된것이 아니라 UI 에 관련된것이어야 합니다.

주로 함수형 컴포넌트로 작성되며, state 를 갖고있어야하거나, 최적화를 위해 LifeCycle 이 필요해질때 클래스형 컴포넌트로 작성됩니다.

#### Container component

이 컴포넌트는 프리젠테이셔널 컴포넌트들과 컨테이너 컴포넌트들을 관리하는것을 담당합니다. 주로 내부에 DOM 엘리먼트가 직접적으로 사용되는 경우는 없습니다. 사용되는 경우는 감싸는 용도일때만 사용 됩니다. 또한, 스타일을 가지고있지 않아야합니다. 스타일들은 모두 프리젠테이셔널 컴포넌트에서 정의되어야 합니다. 상태를 가지고 있을 때가 많으며, 리덕스에 직접적으로 접근 할 수 있습니다.

#### 이 구조의 장점

UI쪽과 Data 쪽이 분리되어 프로젝트를 이해하기가 쉬워지며, 컴포넌트의 재사용률도 높여줍니다.

#### 어떤걸 컴테이너로 만들어야할까?

- 페이지
- 리스트
- 헤어
- 사이드바
- 내부의 컴포넌트 때문에 props가 여러 컴포넌트를 거쳐야 하는 경우

### 3. 기본적인 틀 만들기

containers 디렉토리에 비어있는 App 컴포넌트를 만듭니다.

```javascript
//src/containers/App.js

import React, { Component } from 'react';

class App extends Component {
    render() {
        return (
        	<div>
        		Counter
        	</div>
        );
    }
}
export default App;
```

그 다음엔, 이를 src/index 파일에서 반영합니다.

```javascript
//src/index.js

import React from 'react';
import ReactDOM from 'react-dom';
import App from './containers/App';
import './index.css';

ReactDOM.render(
  <App/>,
  document.getElementById('root')
);
```

이제 프로젝트의 개발서버를 실행해봅니다.

`yarn start`

### 4. Counter 컴포넌트 만들기

먼저 만들 컴포넌트는 숫자, 색상값과, 더하기, 빼기, 그리고 색상변경 함수 3개를  props로 전달받는 컴포넌트입니다.

```javascript
//src/components/Counter.js

import React from 'react';
import PropTypes from 'prop-types';
import './Counter.css';

const Counter = ({number, color, onIncrement, onDecrement, onSetColor}) => {
    return (
        <div 
            className="Counter" 
            onClick={onIncrement} 
            onContextMenu={
                (e) => { 
                    e.preventDefault(); 
                    onDecrement();
                }
            } 
            onDoubleClick={onSetColor}
            style={{backgroundColor: color}}>
                {number}
        </div>
    );
};

Counter.propTypes = {
    number: PropTypes.number,
    color: PropTypes.string,
    onIncrement: PropTypes.func,
    onDecrement: PropTypes.func,
    onSetColor: PropTypes.func
};

Counter.defaultProps = {
    number: 0,
    color: 'black',
    onIncrement: () => console.warn('onIncrement not defined'),
    onDecrement: () => console.warn('onDecrement not defined'),
    onSetColor: () => console.warn('onSetColor not defined')
};

export default Counter;
```

`onContextMenu`는 우클릭을 하여 메뉴가 열리는 이벤트를 의마하는데, 이 함수가 실행될때, `e.preventDefault()`를 실행하면 메뉴가 열리지 않게 됩니다.

카운터의 기본 숫자는 0, 기본색사은 검정색으로 설정하였습니다.

디자인도 추가합니다.

```css
//src/components/Counter.css

.Counter {
    /* 레이아웃 */
    width: 10rem;
    height: 10rem;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 1rem;

     /* 색상 */
    color: white;

    /* 폰트 */
    font-size: 3rem;

    /* 기타 */
    border-radius: 100%;
    cursor: pointer;
    user-select: none;
    transition: background-color 0.75s;
}
```

컴포넌트를 동그랑미 모양으로, 숫자는 가운데에 위치 시키고 흰색으로 설정하였습니다.

이 컴포넌트가 어떻게 보여지는지 확인하기 위하여, App.js 에서 임시로 불러와서 렌더링해보세요. 그리고 왼쪽클릭, 오른쪽클릭, 더블클릭을 해서 우리가 각 이벤트에 지정한 기본 함수가 제대로 실행 되는지 확인하세요.

<img src='./img/button.png' width='300pt'> </img>



### 5. Actions 만들기

#### Action Types 준비하기

이제 드디어 Redux 스러운것을 할 차례입니다. 이번에는 액션을 정의할건데, action은 하나의 객체로 모든 액션 객체는 `type`이라는 값을 지니고 있어야 합니다.

```javascript
{
    type: "INCREMENT"
}
```

만약에 액션과 함께 전달해야 할 값이 있을 경우엔 추가해서 만들어주면 된다.

```javascript
{
    type: "SET_COLOR",
    color: "black"
}
```

여기서 `type`은 액션의 이름으로 나중에 리듀서가 액션을 전달 받으면 이 값에 따라서 다른 작업을 합니다.

그런데, 이 값을 사용할 때 마다 모두 그냥 문자열로 사용한다면 관리하기 조금 힘들어질 수 있기에 따로 파일을 만들어서 저장하면 조금 편리해집니다.

우선, actions 디렉토리에 `ActionTypes.js`라는 폴더를 만들어서 다음을 추가합니다.

```javascript
 //src/actions/ActionTypes.js
 
 /* 
 Action 의 종류들을 선언합니다.
 앞에 export 를 붙임으로서, 나중에 이것들을 불러올 때, 
 import * as types from './ActionTypes' 를 할 수 있어요.
*/

export const INCREMENT = 'INCREMENT';
export const DECREMENT = 'DECREMENT';
export const SET_COLOR = 'SET_COLOR';
```

액션을 선언할때에는 위와 같이 대문자로 선언합니다.

#### 액션 생성자 만들기

액션을 만들때마다 객체를 만들면 힘들기에 액션을 만드는 함수를 만듭니다. 이를 **액션 생성자**라고 부릅니다.

```javascript
//src/actions/index.js

/*
    action 객체를 만드는 액션 생성자들을 선언합니다. (action creators)
    여기서 () => ({}) 은, function() { return { } } 와 동일한 의미입니다.
    scope 이슈와 관계 없이 편의상 사용되었습니다.
*/

import * as types from './ActionTypes';

export const increment = () => ({
    type: types.INCREMENT
});

export const decrement = () => ({
    type: types.DECREMENT
});

// 다른 액션 생성자들과 달리, 파라미터를 갖고있습니다
export const setColor = (color) => ({
    type: types.SET_COLOR,
    color
});
```

`increment` 와 `decrement` 는 어짜피 1씩 더하고 빼는거니까, 따로 필요한 값이 없어서 `type` 만 지정이 된 객체를 만들어줍니다.

하지만 `setColor`의 경우는 색상을 지정해주는거여서, 파라미터로 color값을 받고 이 값을 객체안에 넣어줍니다.

### 6. 리듀서 만들기

이제 리듀서를 만들어봅니다. 리듀서는 액션의 `type`에 따라 변화를 일으키는 함수입니다. 그래고 리듀서 파일은 최초변화를 일으키기전 지니고 있어야 할 **초기상태**를 정의해야합니다.

우선, reducers 디렉토리에 `index.js`파일을 생성하고, 액션 타입들을 불러온 다음에 초기상태를 선언합니다.

```javascript
 //src/reducers/index.js

import * as types from '../actions/ActionTypes';

// 초기 상태를 정의합니다.
const initialState = {
    color: 'black',
    number: 0
};

```

이 리듀서의 초기상태로는 color값과 number 값이 있습니다.

리듀서 함수는 `state` 와  `action` 을 파라미터로 가지는 함수이며, 그 내부에서 `switch` 문을 통하여 `action.type` 에 따라 상태에 따른 변화를 일으키면 됩니다.

여기서 주의할점은 `state` 를 직접 수정하면 안되고, 기존 state 값에 덮어쓴채 상태객체를 만드는 방식으로 해야합니다.

```javascript
 //src/reducers/index.js

import * as types from '../actions/ActionTypes';

// 초기 상태를 정의합니다
const initialState = {
    color: 'black',
    number: 0
};

/* 
    리듀서 함수를 정의합니다. 리듀서는 state 와 action 을 파라미터로 받습니다.
    state 가 undefined 일때 (스토어가 생성될때) state 의 기본값을 initialState 로 사용합니다.
    action.type 에 따라 다른 작업을 하고, 새 상태를 만들어서 반환합니다.
    이 때 주의 할 점은 state 를 직접 수정하면 안되고,
    기존 상태 값에 원하는 값을 덮어쓴 새로운 객체를 만들어서 반환해야합니다.
*/

function counter(state = initialState, action) {
    switch (action.type) {
        case types.INCREMENT: 
            return {
                ...state,
                number: state.number + 1
            };
        case types.DECREMENT:
            return {
                ...state,
                number: state.number - 1
            };
        case types.SET_COLOR:
            return {
                ...state,
                color: action.color
            };
        default:
            return state;
    }
};

export default counter;
```

### 7. Store 만들기

store는 리덕스에서 가장 핵심적인 인스턴스입니다. 이 안에 현재 상태를 내장하고 있고, 구독(subscribe)중인 함수들이 상태가 업데이트 될 때 마다 다시 실행되게 해줍니다.

Store를 만드는건 생각보다 간단합니다.

redux에서 `createStore` 를 불러온 다음에 해당 함수의 파라미터로 우리가 아까 만든 리듀서를 넣어주면 됩니다.

src 디렉토리의 `index.js` 에서 한번 스토어를 생성하겠습니다.

```javascript
//src/index.js

import React from 'react';
import ReactDOM from 'react-dom';
import App from './containers/App';
import './index.css';

// Redux 관련 불러오기
import { createStore } from 'redux'
import reducers from './reducers';

// 스토어 생성
const store = createStore(reducers);

ReactDOM.render(
  <App />,
  document.getElementById('root')
);
```

### 8. Provider 컴포넌트를 사용하여 리액트 앱에 store 연동하기

`Provider`는 `react-redux` 라이브러리에 내장되어있는, 리액트 앱에 store를 손쉽게 연동 할 수 있도록 도와주는 컴포넌트입니다.

이 컴포넌트를 불러온 다음에 연동 할 컴포넌트를 감싸준다음에  `Provider` 컴포넌트의 props로 `store` 값을 설정해주면 됩니다.

```javascript
//src/index.js

import React from 'react';
import ReactDOM from 'react-dom';
import App from './containers/App';
import './index.css';

// Redux 관련 불러오기
import { createStore } from 'redux'
import reducers from './reducers';
import { Provider } from 'react-redux';

// 스토어 생성
const store = createStore(reducers);

ReactDOM.render(
    <Provider store={store}>
        <App />
    </Provider>,
    document.getElementById('root')
);
```

이제 App 컴포넌트가 store에 연동되었습니다. 

이제 컨테이너 컴포넌트만 만들면 카우터 기능이 구현완료됩니다.

### 9. Counter Container 컴포넌트 만들기

컨테이너 컴포넌트를 만들어 봅니다. 컨테이너 컴포넌트를  store에 연결을 시켜주려면 `react-redux` 의 `connect` 함수를 사용해야하는데, 이 함수의 파라미터로 컴포넌트에 연결시킬 상태와, 액션함수들을 전달해주면, 컴포넌트를 리덕스 스토어에 연결시키는 또 다른 함수르 ㄹ반환합니다. 이 과정에서 리턴된 함수 안에, 프리젠테이션 컴포넌트를 파라미터로 전달해주면 리덕스 스토어에 연결된 컴포넌트가 새로 만들어집니다.

컴포넌트에 연결시킬 상태와 액션함수를 정의할땐 각각 함수를 만들어줘야하는데, 상태를 연결시킬땐 state, 액션함수를 연결시킬땐 dispatch를 파라미터로 전달받는 함수를 만들어서 객체를 반환하면 이를 props로 사용할 수 있게 됩니다.

```javascript
//src/containers/CounterContainer.js

import Counter from '../components/Counter';
import * as actions from '../actions';
import { connect } from 'react-redux';

// store 안의 state 값을 props 로 연결해줍니다.
const mapStateToProps = (state) => ({
    color: state.color,
    number: state.number
});


/* 
    액션 생성자를 사용하여 액션을 생성하고,
    해당 액션을 dispatch 하는 함수를 만들은 후, 이를 props 로 연결해줍니다.
*/

const mapDispatchToProps = (dispatch) => ({
    onIncrement: () => dispatch(actions.increment()),
    onDecrement: () => dispatch(actions.decrement()),
    onSetColor: () => {
        const color = 'black'; // 임시
        dispatch(actions.setColor(color));
    }
});

// Counter 컴포넌트의 Container 컴포넌트
// Counter 컴포넌트를 어플리케이션의 데이터 레이어와 묶는 역할을 합니다.

const CounterContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(Counter);


export default CounterContainer;
```

상태를 연결시키는 함수는 mapStateToProps로, 액션함수를 연결시키는 함수는 mapDispatchToProps로 만들어서, 이를 connect에 전달해주고, 그렇게 전달받은 함수에 우리가 아까 만든 Counter 컴포넌트를 전달하여 이를 내보냈습니다.

현재 랜덤 색상을 만드는 함수를 아직 만들지 않았는데 이 함수를 util 디렉토리의 `index.js` 안에 정의해줍니다.

```javascript
//src/utils/index.js

export function getRandomColor() {
    const colors = [
        '#495057',
        '#f03e3e',
        '#d6336c',
        '#ae3ec9',
        '#7048e8',
        '#4263eb',
        '#1c7cd6',
        '#1098ad',
        '#0ca678',
        '#37b24d',
        '#74b816',
        '#f59f00',
        '#f76707'
    ];

    // 0 부터 12까지 랜덤 숫자
    const random = Math.floor(Math.random() * 13);

    // 랜덤 색상 반환
    return colors[random];
}
```

이 함수를 불러온 다음에 아까 mapDispatchToProps 에서 임시로 호출합니다.

```javascript
//src/containers/CounterContainer.js

import Counter from '../components/Counter';
import * as actions from '../actions';
import { connect } from 'react-redux';
import { getRandomColor } from '../utils';

// store 안의 state 값을 props 로 연결해줍니다.
const mapStateToProps = (state) => ({
    color: state.color,
    number: state.number
});


/* 
    액션 생성자를 사용하여 액션을 생성하고,
    해당 액션을 dispatch 하는 함수를 만들은 후, 이를 props 로 연결해줍니다.
*/
const mapDispatchToProps = (dispatch) => ({
    onIncrement: () => dispatch(actions.increment()),
    onDecrement: () => dispatch(actions.decrement()),
    onSetColor: () => {
        const color = getRandomColor();
        dispatch(actions.setColor(color));
    }
});

// Counter 컴포넌트의 Container 컴포넌트
// Counter 컴포넌트를 어플리케이션의 데이터 레이어와 묶는 역할을 합니다.
const CounterContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(Counter);


export default CounterContainer;
```

컨테이너 컴포넌트도 다 만들었습니다!

이제 이걸 `App.js` 에서 불러와 렌더링해주면 기능이 작동합니다.

### 10. 서브 리듀서 만들기

기존 리듀서를 색상 리듀서, 그리고 숫자 리듀서로 분리를 시킨다음에, `conbineReducers`를 통해 이를 합쳐서 루트 리듀서로 만드는 방법을 알아보겠습니다.

우선, `reducers` 디렉토리에 `color.js` 와 `number.js` 파일을 다음과 같이 만드세요

```javascript
//src/reducers/color.js

import * as types from '../actions/ActionTypes';

const initialState = {
    color: 'black'
};

const color = (state = initialState, action) => {
    switch(action.type) {
        case types.SET_COLOR:
            return {
                color: action.color
            };
        default:
            return state;
    }
}

export default color;
```

```javascript
//src/reducers/number.js

import * as types from '../actions/ActionTypes';

const initialState = {
    number: 0
};

const number = (state = initialState, action) => {
    switch(action.type) {
        case types.INCREMENT: 
            return {
                number: state.number + 1
            };
        case types.DECREMENT:
            return {
                number: state.number - 1
            };
        default:
            return state;
    }
}

export default number;
```

그 다음에 `reducers` 디렉토리의 `index.js` 에서 redux의 `combineReducers` 를 불러온뒤 다음과 같이 호출하세요.

```javascript
//src/reducers/index.js

import number from './number';
import color from './color';

import { combineReducers } from 'redux';

/*
    서브 리듀서들을 하나로 합칩니다.
    combineReducers 를 실행하고 나면, 나중에 store의 형태가 파라미터로 전달한 객체의 모양대로 만들어집니다.
    지금의 경우:
    {
        numberData: {
            number: 0
        },
        colorData: {
            color: 'black'
        }
    }
    로 만들어집니다.
*/



const reducers = combineReducers({
    numberData: number,
    colorData: color
});

export default reducers;
```

`combineReducers` 는 여러개의 서브리듀서를 하나로 합쳐줍니다. 이 과정에서 함수에 객체를 전달하게 되는데, 이 객체의 구조에 따라 합쳐진 리듀서의 상태의 구조가 만들어집니다.

따라서 지금의 구조대로라면 기존 프로젝트가 작동하지 않습니다.

그럼, `CounterContainer` 컴포넌트의 `mapStateToProps` 함수를 조금 수정해줍니다.

```javascript
//src/containers/CounterContainer.js

import Counter from '../components/Counter';
import * as actions from '../actions';
import { connect } from 'react-redux';
import { getRandomColor } from '../utils';

// store 안의 state 값을 props 로 연결해줍니다.
const mapStateToProps = (state) => ({
    color: state.colorData.color,
    number: state.numberData.number
});


/* 
    액션 생성자를 사용하여 액션을 생성하고,
    해당 액션을 dispatch 하는 함수를 만들은 후, 이를 props 로 연결해줍니다.
*/
const mapDispatchToProps = (dispatch) => ({
    onIncrement: () => dispatch(actions.increment()),
    onDecrement: () => dispatch(actions.decrement()),
    onSetColor: () => {
        const color = getRandomColor();
        dispatch(actions.setColor(color));
    }
});

// Counter 컴포넌트의 Container 컴포넌트
// Counter 컴포넌트를 어플리케이션의 데이터 레이어와 묶는 역할을 합니다.
const CounterContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(Counter);


export default CounterContainer;
```





