# Redux 개념

> [Redux 공식문서](https://lunit.gitbook.io/redux-in-korean/)를 요약하였습니다.

## Read Me

Redux는 자바스크립트 앱을 위한 예측 가능한 state container입니다.

Redux는 여러분이 일관적으로 동작하고, 서로 다른 환경에서 작동하고, 테스트하기 쉬운 앱을 작성하도록 도와줍니다.

## Motivation

**많은 상태**를 자바스크립트 코드로 **관리할 필요가 생겨났습니다.** 여기에서 상태는 서버 응답, 캐시 데이터, 지역적으로 생성해서 사용하고 있지만 아직 서버에 저장되지 않은 데이터를 위미합니다.

항상 변하는 상태를 관리하기란 어렵습니다. 모델이 다른 모델을 업데이트하고, 그리고 뷰가 모델을 업데이트 할 수 있고, 이 뷰가 다시 다른 모델을 업데이트하고, 이에 따라 또 다른 뷰가 업데이트 됩니다. 결국 **상태를 언제, 왜, 어떻게 업데이트할지 제어할 수 없는 지경에 이르고 맙니다.** 

더욱 안 좋은 소식은 **프론트엔드 제품 개발에 있어 새로 갖춰야할 요건들이 늘어나고 있다는 점**입니다. 이러한 예로 Optimistic update, 서버 렌더링, 라우트가 일어나기 전에 데이터 가져오기 등이 있습니다.

이러한 복잡함은 변화(mutation)나 비동기(asyncronicity)와 같이 사람이 추론해내기 어려운 **두가지 개념을 겄어서 사용한다는 데**서 옵니다. 

## Core Concepts

*example state:*

```json
{
  todos: [{
    text: 'Eat food',
    completed: true
  }, {
    text: 'Exercise',
    completed: false
  }],
  visibilityFilter: 'SHOW_COMPLETED'
}
```

이 객체는 setters가 없는 "model"과 같습니다. 이것은 코드의 다른 부분이 상태를 임의로 변경할 수 없기 때문에 재현하기 어려운 버그가 발생합니다.

state에서 무언가를 바꾸기 위해서 action을 dispatch할 필요가 있습니다. Action은 자바스크립트 객체의 날것 그대로 입니다. 그것은 무엇이 발생했는지를 설명해 줍니다.

*example actions:*

```json
{ type: 'ADD_TODO', text: 'Go to swimming pool' }
{ type: 'TOGGLE_TODO', index: 1 }
{ type: 'SET_VISIBILITY_FILTER', filter: 'SHOW_ALL' }
```

모든 change는 action으로 간주되며 app에서 무엇이 일어나고 있는지 분명하게 해준다.

만약 무엇이 바뀌었다면 우리는 왜 바뀌었는지 알게된다. 

마지막으로 state와 actions을 연결하기 위해 reducer라는 함수를 작성합니다. 그것은 state와 action을 인자로 받아 app의 다음 상태를 반환합니다.

```javascript
function visibilityFilter(state = 'SHOW_ALL', action) {
  if (action.type === 'SET_VISIBILITY_FILTER') {
    return action.filter
  } else {
    return state
  }
}

function todos(state = [], action) {
  switch (action.type) {
    case 'ADD_TODO':
      return state.concat([{ text: action.text, completed: false }])
    case 'TOGGLE_TODO':
      return state.map(
        (todo, index) =>
          action.index === index
            ? { text: todo.text, completed: !todo.completed }
            : todo
      )
    default:
      return state
  }
}
```

그리고 우리는 대응하는 state keys에 대해 두 reducer를 호출하여 app의 완전한 state를 관리하는 또 다른 reducer를 작성합니다.

## 3가지 원칙

>  Redux의 근본적인 원칙들은 다음과 같습니다.

### 1. 진실은 하나의 소스로 부터

**어플리케이션의 모든 상태는 하나의 스토어 안에 하나의 객체 트리 구조로 저장됩니다.**
이를 통해 범용적인 어플리케이션을 쉽게 만들 수 있습니다. 서버로부터 가져온 상태는 serialized 되거나 hydrated(수화물??)되어 전달되며 클라이언트에서 추가적인 코딩 없이도 사용할 수 있습니다. 또한 하나의 상태 트리만을 가지고 있기 때문에 디버깅에도 용이할 것입니다.  빠른 개발 사이클을 위해 개발중인 어플리케이션의 상태를 저장해놓을 수도 있습니다. 하나의 상태 트리만을 가지고 있기 때문에 이전에는 굉장히 구현하기 어려웠던 기능은 실행취소/다시실행을 손쉽게 구현할 수 있습니다.

```javascript
console.log(store.getState());

{
  visibilityFilter: 'SHOW_ALL',
  todos: [{
    text: 'Consider using Redux',
    completed: true,
  }, {
    text: 'Keep all state in a single tree',
    completed: false
  }]
}
```

### 2. 상태는 읽기 전용이다.

**상태를 변화시키는 유일한 방법은 무슨 일이 벌어지는 지를 묘사하는 액션 객체를 전달하는 방법뿐입니다.**

이를 통해서 뷰나 네트워크 콜백에서 결코 상태를 직접 바꾸지 못 한다는 것을 보장할 수 있습니다. 모든 상태 변화는 중앙에서 관리되며 모든 액션은 엄격한 순서에 의해 하나하나 실행되기 때문에, 신경써서 관리해야할 미묘한 경쟁 상태는 없습니다. 액션은 그저 평범한 객체입니다. 따라서 기록을 남길 수 있고, serialized할 수 있으며, 저장할 수 있고, 이후에 테스트나 디버깅을 위해서 재현하는 것도 가능합니다.

```javascript
store.dispatch({
  type: 'COMPLETE_TODO',
  index: 1
});

store.dispatch({
  type: 'SET_VISIBILITY_FILTER',
  filter: 'SHOW_COMPLETED'
});
```

### 3. 변화는 순수 함수로 작성되어야한다.

**액션에 의해 상태 트리가 어떻게 변화하는 지를 지정하기 위해 프로그래머는 순서 리듀서를 작성해야합니다.**

리듀서는 그저 이전 상태와 액션을 받아 다음 상태를 반환하는 순수 함수입니다. 이전 상태를 변경하는 대신 새로운 상태 객체를 생성해서 반환해야한다는 사실을 기억해야 합니다. 처음에는 하나의 리듀서만으로 충분하지만, 어플리케이션이 성장해나가면 상태 트리의 특정한 부분들을 조작하는 더 작은 리듀서들로 나누는 것도 가능합니다. 리듀서는 그저 함수이기 때문에 호출되는 순서를 정하거나 추가적인 데이터를 넘길 수도 있습니다. 심지어 페이지네이션과 같이 일반적인 재사용 가능한 리듀서를 작성하는 것도 가능합니다.

```javascript
function visibilityFilter(state = 'SHOW_ALL', action) {
  switch (action.type) {
  case 'SET_VISIBILITY_FILTER':
    return action.filter;
  default:
    return state;
  }
}

function todos(state = [], action) {
  switch (action.type) {
  case 'ADD_TODO':
    return [...state, {
      text: action.text,
      completed: false
    }];
  case 'COMPLETE_TODO':
    return [
      ...state.slice(0, action.index),
      Object.assign({}, state[action.index], {
        completed: true
      }),
      ...state.slice(action.index + 1)
    ];
  default:
    return state;
  }
}

import { combineReducers, createStore } from 'redux';
let reducer = combineReducers({ visibilityFilter, todos });
let store = createStore(reducer);
```

