# Redux 기초

> [Redux 공식문서](https://lunit.gitbook.io/redux-in-korean/)를 요약하였습니다.

## 액션

먼저 액션을 정의해봅시다.

**액션**은 어플리케이션에서 스토어로 보내는 데이터 묶음입니다. 이들이 스토어의 **유일한** 정보원이 됩니다. 여러분은 `store.dispatch()`를 통해 이들을 보낼 수 있습니다.

이것이 새 할일의 추가를 나타내는 액션의 예시입니다.

```javascript
const ADD_TODO = 'ADD_TODO'
```

```javascript
{
    type: ADD_TODO,
    text: 'Build my first Redux app'
}
```

액션은 평범한 자바스크립트 객체입니다. 액션은 반드시 어떤 형태의 액션이 실행될지 나타내는 `type` 속성을 가져야 합니다. 타입은 일반적으로 string으로 정의됩니다. 여러분의 앱이 충분히 커지면 타입들을 별도의 모듈로 분리할 수 있습니다.

```javascript
import { ADD_TODO, REMOVE_TODO } from '../actionTypes'
```

> **보일러플레이트에 대한 설명**
>
> 액션 타입 상수를 반드시 별도의 파일에 정의할 필요는 없으며, 심지어 정의하지 않아도 됩니다. 작은 프로젝트에서는 액션 타입으로 그냥 string을 쓰는게 쉬울겁니다. 하지만 코드베이스가 커지면 상수를 정의해서 얻을 수 있는 장점이 있습니다.

`type`외에 액션 객체의 구조는 여러분 마음대로입니다.

사용자가 할일을 완료했다고 체크하는 액션 하나를 더 추가합시다. 할일은 배열 안에 저장되기 때문에 우리는 특정한 할일을 `index`를 통해 참조할 수 있습니다. 진짜 앱에서는 새 할일이 만들어질때마다 유일한 ID를 부여하는게 더 좋겠죠.

```json
{
    type: COMPLETE_TODO,
    index: 5
}
```

마지막으로, 지금 보이는 할일들을 바꾸는 액션을 추가하겠습니다.

```json
{
    type: SET_VISIBILITY_FILTER,
    filter: SHOW_COMPLETED
}
```

### 1) 액션 생산자

**액션 생산자**는 액션을 만드는 함수입니다. "액션"과 "액션 생산자"는 혼용하기 쉬운 용어이니 적절하게 사용하도록 신경써야 합니다.

전통적인 Flux 구현에서 액션 생산자는 보통 불러와졌을때 액션을 보냅니다.

```javascript
function addTodoWithDispatch(text) {
    const action = {
        type: ADD_TODO,
        text
    }
    dispatch(action)
}
```

이와는 대비되게 Redux의 액션 생산자는 단지 액션을 반환합니다:

```javascript
function addTodo(text) {
  return {
    type: ADD_TODO,
    text
  }
}
```

이는 액션 생산자를 더 이식하기 좋고 테스트하기 쉽게 합니다. 실제로 액션을 보내려면 결과값을 `dispatch()`함수에 넘깁니다:

```javascript
dispatch(addTodo(text))
dispatch(completeTodo(index))
```

아니면 자동으로 액션을 보내주는 **바인드된 액션 생산자**를 만듭니다:

```javascript
const boundAddTodo = (text) => dispatch(addTodo(text))
const boundCompleteTodo = (index) => dispatch(completeTodo(index))
```

이들은 바로 호출할 수 있습니다:

```javascript
boundAddTodo(text)
boundCompleteTodo(index)
```

`dispatch()` 함수를 스토어에서 `store.dispatch()`로 바로 접근할 수 있지만, 여러분은 보통 react-redux의 `connect()`와 같은 헬퍼를 통해 접근할 것입니다. 여러 액션 생산자를 `dispatch()`에 바인드하기 위해 `bindActionCreators()`를 사용할수도 있습니다.

### 2) 소스코드

`actions.js`

```javascript
/*
 * 액션 타입
 */

export const ADD_TODO = 'ADD_TODO'
export const COMPLETE_TODO = 'COMPLETE_TODO'
export const SET_VISIBILITY_FILTER = 'SET_VISIBILITY_FILTER'

/*
 * 다른 상수
 */

export const VisibilityFilters = {
  SHOW_ALL: 'SHOW_ALL',
  SHOW_COMPLETED: 'SHOW_COMPLETED',
  SHOW_ACTIVE: 'SHOW_ACTIVE'
}

/*
 * 액션 생산자
 */

export function addTodo(text) {
  return { type: ADD_TODO, text }
}

export function completeTodo(index) {
  return { type: COMPLETE_TODO, index }
}

export function setVisibilityFilter(filter) {
  return { type: SET_VISIBILITY_FILTER, filter }
}
```



## 리듀서

> 액션은 **무언가 일어난다**는 사실을 기술하지만, 그 결과 어플리케이션의 상태가 어떻게 바뀌는지는 특정하지 않습니다. 이것은 리듀서가 할 일이죠.

### 1) 상태 설계하기

Redux에서 어플리케이션의 모든 상태는 하나의 객체에 저장됩니다. 어떤 코드건 작성하기 전에 형태를 생각해보는건 좋은 일이죠. 여러분의 앱의 상태를 객체로 만든다면 어떤 표현이 가장 단순할까요?

우리의 할일 앱을 위해 두 가지를 저장하고 싶습니다.

* 현재 선택된 필터
* 할일의 실제 목록

여러분은 종종 데이터 뿐만 아니라 UI 상태도 상태 트리에 저장해야 한다는걸 발견하실겁니다. 그래도 좋지만, 데이터는 UI 상태와 분리하도록 하세요.

```json
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

> **관계에 대한 한마디**
>
> 더 복잡한 앱에서는 각기 다른 개체들이 서로를 참조하게 만들고 싶을겁니다. 우리는 여러분이 앱의 상태를 가능한 중첩되지 않도록 정규화할것을 권합니다. 모든 개체가 ID를 키로 가지고, ID를 통해 다른 개체나 목록을 참조하도록 하세요. 앱의 상태를 데이터베이스라고 생각하시면 됩니다. 예를 들어 상태 안에 `todosById: { id -> todo}`와 `todos: array<id>` 처럼 구현하는 것이 실제 앱에서는 더 적절합니다. 하지만 예시에서는 단순하게 하겠습니다.

### 2) 액션 다루기

상태 객체가 어떻게 생겼는지 정했으니 리듀서를 작성해봅시다. 리듀서는 이전 상태와 액션을 받아서 다음 상태를 반환하는 순수 함수입니다.

```javascript
(previousState, action) => newState
```

여러분이 이 형태의 함수를 `Array.prototype.reduce(reducer, initialValue)`로 넘길 것이기 때문에 리듀서라고 부릅니다. 리듀서를 순수하기 유지하는 것은 매우 중요합니다. 여러분이 **절대로** 리듀서 내에서 하지 말아야 할 것들은:

*  인수들을 변경(mutate)하기
* API 호출이나 라우팅 전환같은 사이드 이펙트를 일으키기
* `Date.now()`나 `Math.random()` 같이 순수하지 않은 함수를 호출하기

사이드 이펙트를 어떻게 일으키는지는 심화과정에서 확인하게 될 것입니다. 지금은 리듀서가 반드시 순수해야 한다는 점만 기억하세요. **인수가 주어지면, 다음 상태를 계산해서 반환하면 됩니다. 예기치 못한 일은 없어야 합니다. 사이드 이펙트도 없어야 합니다. API 호출도 안됩니다. 변경도 안됩니다. 계산만 가능합니다.**

이 정도로 해두고, 우리가 전에 정의했던 actions을 이해하도록 천천히 리듀서를 작성해봅시다.

초기 상태를 정하는데서 시작하겠습니다. Redux는 처음에 리듀서를 `undefined` 상태로 호출합니다. 그때가 초기 상태를 반환할 기회입니다:

```javascript
import { VisibilityFilters } from './actions'

const initialState = {
  visibilityFilter: VisibilityFilters.SHOW_ALL,
  todos: []
}

function todoApp(state, action) {
  if (typeof state === 'undefined') {
    return initialState
  }

  // 지금은 아무 액션도 다루지 않고
  // 주어진 상태를 그대로 반환합니다.
  return state
}
```

더 간단하게 작성하는 방법은 ES6 default arguments 문법을 사용하는 것입니다.

```javascript
function todoApp(state = initalState, action) {
	// 지금은 아무 액션도 다루지 않고
	// 주어진 상태를 그대로 반환합니다.
    return state
}
```

이제 `SET_VISIBILITY_FILTER`를 처리합시다. 우리가 할 일은 상태에서 `visibilityFilter`를 바꾸는 것 뿐입니다.

```javascript
function todoApp(state = initialState, action) {
  switch (action.type) {
  case SET_VISIBILITY_FILTER:
    return Object.assign({}, state, {
      visibilityFilter: action.filter
    });
  default:
    return state
  }
}
```

짚고 넘어갈 점은:

1. **우리는 `state`를 변경하지 않았습니다.** `Object.assign()`을 통해 복사본을 만들었죠. `Object.assign(state, { visibilityFilter: action.filter })`이라고 써도 여전히 틀립니다. 첫번째 인수를 변경하게 되니까요. 여러분은 **반드시** 첫번째 인수로 빈 객체를 전달해야 합니다. ES7로 제안된 object spread syntax을 써서 `{ ...state, ...newState }` 로 작성할수도 있습니다.
2. **`default` 케이스에 대해 이전의 `state`를 반환했습니다.** 알 수 없는 액션에 대해서는 이전의 `state`를 반환하는것이 중요합니다.

### 3) 더 많은 액션 다루기

다룰 액션이 2개 더 있습니다! 우리의 리듀서가 `ADD_TODO`를 다룰 수 있도록 확장합시다.

```javascript
function todoApp(state = initialState, action) {
  switch (action.type) {
  case SET_VISIBILITY_FILTER:
    return Object.assign({}, state, {
      visibilityFilter: action.filter
    });
  case ADD_TODO:
    return Object.assign({}, state, {
      todos: [...state.todos, {
        text: action.text,
        completed: false
      }]
    });    
  default:
    return state;
  }
}
```

앞에서와 마찬가지로 `state`나 그 필드들을 직접 쓰는 대신 새 객체를 반환했습니다. 새 `todos`는 이전의 `todos`의 끝에 새로운 할일 하나를 붙인 것과 동일합니다. 새로운 할일은 액션의 데이터를 이용해서 만들어졌습니다.

마지막으로, `COMPLETE_TODO` 핸들러를 구현합시다.

```javascript
case COMPLETE_TODO:
  return Object.assign({}, state, {
    todos: [
      ...state.todos.slice(0, action.index),
      Object.assign({}, state.todos[action.index], {
        completed: true
      }),
      ...state.todos.slice(action.index + 1)
    ]
  });
```

변경 없이 배열의 특정 할일만 수정하고 싶기 때문에, 그 할일의 앞과 뒤를 잘라냈습니다. 만약 이런 코드를 자주 작성해야 한다면 React.addons.update, updeep같은 헬퍼나 Immutable같이 깊은 수정을 지원하는 라이브러리를 사용하는것이 좋습니다. `state`를 복사하기 전엔 그 안의 무엇에도 할당하지 말아야 한다는걸 기억하세요.

### 4) 리듀서 쪼개기

우리의 코드가 여기까지 왔습니다.

```javascript
function todoApp(state = initialState, action) {
  switch (action.type) {
  case SET_VISIBILITY_FILTER:
    return Object.assign({}, state, {
      visibilityFilter: action.filter
    });
  case ADD_TODO:
    return Object.assign({}, state, {
      todos: [...state.todos, {
        text: action.text,
        completed: false
      }]
    });
  case COMPLETE_TODO:
    return Object.assign({}, state, {
      todos: [
        ...state.todos.slice(0, action.index),
        Object.assign({}, state.todos[action.index], {
          completed: true
        }),
        ...state.todos.slice(action.index + 1)
      ]
    });
  default:
    return state;
  }
}
```

좀 더 이해하기 쉽게 만드는 방법이 있을까요? `todos`와 `visibilityFilter`는 서로 완전히 독립적으로 수정되는것 같습니다. 간혹 상태의 필드들이 서로에게 의존하고 있어 더 고려할 사항이 있는 경우도 있지만, 이번엔 쉽게 `todos`의 수정을 별도의 함수로 분리할 수 있습니다.

```javascript
function todos(state = [], action) {
  switch (action.type) {
  case ADD_TODO:
    return [...state, {
      text: action.text,
      completed: false
    }];
  case COMPLETE_TODO:
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

function todoApp(state = initialState, action) {
  switch (action.type) {
  case SET_VISIBILITY_FILTER:
    return Object.assign({}, state, {
      visibilityFilter: action.filter
    });
  case ADD_TODO:
  case COMPLETE_TODO:
    return Object.assign({}, state, {
      todos: todos(state.todos, action)
    });
  default:
    return state;
  }
}
```

`todos`가 `state`도 받지만 이건 그냥 배열입니다. 이제 `todoApp`은 관리할 상태의 조각만을 넘기고, `todos`는 그 조각을 어떻게 수정할지 알고 있습니다. **이것을 리듀서 조합이라고 부르고, 이것이 Redux 앱을 만드는 기본 패턴이 됩니다.**

리듀서 조합에 대해 더 알아봅시다. `visibilityFilter`만을 관리하는 리듀서도 뽑아낼 수 있을까요? 이렇게 할 수 있습니다:

```javascript
function visibilityFilter(state = SHOW_ALL, action) {
  switch (action.type) {
  case SET_VISIBILITY_FILTER:
    return action.filter;
  default:
    return state;
  }
}
```

우리는 이제 메인 리듀서를 상태의 부분들을 관리하는 리듀서를 부르고 하나의 객체로 조합하는 함수로 재작성할 수 있습니다. 또한 이제 완전한 초기 상태도 필요 없습니다. 처음에 `undefined`가 주어지면 자식 리듀서들이 각각의 초기 상태를 반환하면 됩니다.



```javascript
function todos(state = [], action) {
  switch (action.type) {
  case ADD_TODO:
    return [...state, {
      text: action.text,
      completed: false
    }];
  case COMPLETE_TODO:
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


function visibilityFilter(state = SHOW_ALL, action) {
  switch (action.type) {
  case SET_VISIBILITY_FILTER:
    return action.filter;
  default:
    return state;
  }
}


function todoApp(state = {}, action) {
  return {
    visibilityFilter: visibilityFilter(state.visibilityFilter, action),
    todos: todos(state.todos, action)
  };
}
```

**각각의 리듀서는 전체 상태에서 자신의 부분만을 관리합니다.** 모든 리듀서의 `state` 매개변수는 서로 다르고, 자신이 관리하는 부분에 해당합니다.

벌써 그럴듯해 보이네요! 앱이 커지면 리듀서를 별도의 파일로 분리해서 완전히 독립적이고 다른 데이터 도메인을 관리하도록 할 수 있습니다.

마지막으로, Redux는 `todoApp`이 위에서 했던것과 동일한 보일러플레이트 로직을 지원하는 [`combineReducers()`]()라는 유틸리티를 제공합니다. 이를 이용하면 `todoApp`을 이렇게 재작성할 수 있습니다:



```javascript
import { combineReducers } from 'redux';


const todoApp = combineReducers({
  visibilityFilter,
  todos
});


export default todoApp;
```

이는 아래와 완전히 의미가 같은 코드입니다:



```javascript
export default function todoApp(state, action) {
  return {
    visibilityFilter: visibilityFilter(state.visibilityFilter, action),
    todos: todos(state.todos, action)
  };
}
```

이들에게 서로 다른 키를 주거나, 다른 함수를 호출할 수도 있습니다. 결합된 리듀서를 작성하는 이 두 방법은 완전히 의미가 같습니다:



```javascript
const reducer = combineReducers({
  a: doSomethingWithA,
  b: processB,
  c: c
});
```



```javascript
function reducer(state, action) {
  return {
    a: doSomethingWithA(state.a, action),
    b: processB(state.b, action),
    c: c(state.c, action)
  };
}
```

[`combineReducers()`]()가 하는 일은 여러분의 리듀서들을 **키에 따라 선택해서 잘라낸 상태들**로 호출하고 그 결과를 다시 하나의 객체로 합쳐주는 함수를 만드는 것 뿐입니다. [딱히 마법같은건 아닙니다.](https://github.com/rackt/redux/issues/428#issuecomment-129223274)

### 5) Source Code

 `reducers.js`


```javascript
import { combineReducers } from 'redux';
import { ADD_TODO, COMPLETE_TODO, SET_VISIBILITY_FILTER, VisibilityFilters } from './actions';
const { SHOW_ALL } = VisibilityFilters;


function visibilityFilter(state = SHOW_ALL, action) {
  switch (action.type) {
  case SET_VISIBILITY_FILTER:
    return action.filter;
  default:
    return state;
  }
}


function todos(state = [], action) {
  switch (action.type) {
  case ADD_TODO:
    return [...state, {
      text: action.text,
      completed: false
    }];
  case COMPLETE_TODO:
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


const todoApp = combineReducers({
  visibilityFilter,
  todos
});


export default todoApp;
```



## 스토어

이전 섹션에서 우리는 "무엇이 일어날지"를 나타내는 [액션]()과 이 액션에 따라 상태를 수정하는 [리듀서]()를 정의했습니다.

**스토어**는 이들을 함께 가져오는 객체입니다. 스토어는 아래와 같은 일들을 해야 합니다:

- 애플리케이션의 상태를 저장하고;
- [`getState()`]()를 통해 상태에 접근하게 하고;
- [`dispatch(action)`]()를 통해 상태를 수정할 수 있게 하고;
- [`subscribe(listener)`]()를 통해 리스너를 등록합니다.

Redux 애플리케이션에서 단 하나의 스토어만 가질 수 있음을 알아두는것이 중요합니다. 만약 데이터를 다루는 로직을 쪼개고 싶다면, 여러개의 스토어 대신 [리듀서 조합]()을 사용할 수 있습니다.

리듀서를 만들었다면 스토어를 만드는건 쉽습니다. [이전 섹션]()에서 우리는 [`combineReducers()`]()를 통해 여러 리듀서를 하나로 합쳤습니다. 우리는 이것을 가져와서 [`createStore()`]()에 넘길겁니다.



``` javascript
import { createStore } from 'redux';
import todoApp from './reducers';


let store = createStore(todoApp);
```

[`createStore()`]()의 두번째 인수로 초기 상태를 지정해줄수도 있습니다. 이는 서버에서 실행중인 Redux 애플리케이션의 상태와 일치하도록 클라이언트의 상태를 채워줄때 유용합니다.

```javascript
let store = createStore(todoApp, window.STATE_FROM_SERVER);
```

### 1) 액션을 보내기

스토어를 만들었으니, 우리 프로그램이 작동하는지 검증해봅시다! 아무 UI도 없지만 이미 우리는 수정하는 로직을 테스트할 수 있습니다.



```javascript
import { addTodo, completeTodo, setVisibilityFilter, VisibilityFilters } from './actions';


// 초기 상태를 기록합니다.
console.log(store.getState());


// 상태가 바뀔때마다 기록합니다.
let unsubscribe = store.subscribe(() =>
  console.log(store.getState())
);


// 액션들을 보냅니다.
store.dispatch(addTodo('Learn about actions'));
store.dispatch(addTodo('Learn about reducers'));
store.dispatch(addTodo('Learn about store'));
store.dispatch(completeTodo(0));
store.dispatch(completeTodo(1));
store.dispatch(setVisibilityFilter(VisibilityFilters.SHOW_COMPLETED));


// 상태 변경을 더 이상 받아보지 않습니다.
unsubscribe();
```

여러분은 스토어에 보관된 상태가 어떻게 바뀌는지 볼 수 있습니다:

![img](http://i.imgur.com/zMMtoMz.png)



우리는 UI를 작성하기도 전에 앱이 어떻게 행동할지 정했습니다. 이 튜토리얼에서는 다루지 않겠지만, 이 시점에서 여러분은 리듀서와 액션 생산자들을 위한 테스트를 작성할 수 있습니다. 이들은 단지 함수이기 때문에 아무것도 모조(mock)할 필요가 없습니다. 이들을 호출하고, 반환하는 것들을 검증하세요.

### 2) Source Code

`index.js`

```javascript
import { createStore } from 'redux';
import todoApp from './reducers';


let store = createStore(todoApp);
```



## 데이터 흐름

Redux의 아키텍쳐는 **엄격한 일방향 데이터 흐름**을 따라 전개됩니다.

이는 애플리케이션 내의 모든 데이터가 같은 생명주기 패턴을 따르며, 앱의 로직을 좀 더 예측가능하게 하고 이해하기 쉽게 만든다는 뜻입니다. 이는 또한 데이터 정규화를 도와서 같은 데이터의 복제본들이 서로를 모르는 여럿으로 나눠지고 말지 않도록 해줍니다.

여러분이 아직도 이에 익숙치 않으시다면, [동기]()와 [The Case for Flux](https://medium.com/@dan_abramov/the-case-for-flux-379b7d1982c6)의 일방향 데이터 흐름에 대한 설득당할수밖에 없는 논거를 읽어보시기 바랍니다. [Redux가 정확히 Flux는 아니지만]() 같은 중요한 잇점들을 함께합니다.

모든 Redux 앱에서의 데이터는 아래와 같이 4단계의 생명주기를 따릅니다:

1. **여러분이** [`store.dispatch(action)`]()**를 호출합니다**.

   액션은 **무엇이 일어날지** 기술하는 보통의 오브젝트입니다. 예를 들어:

   

   ```javascript
    { type: 'LIKE_ARTICLE', articleId: 42 };
    { type: 'FETCH_USER_SUCCESS', response: { id: 3, name: 'Megan' } };
    { type: 'ADD_TODO', text: 'Read the Redux docs.'};
   ```

   액션을 간단한 소식들의 단편이라고 생각하세요. "Mary가 42번 기사를 좋아합니다."나 "'Redux 문서를 읽는다.'가 할 일 목록에 추가되었습니다."

   여러분은 [`store.dispatch(action)`]()를 앱 내의 어디서나 호출할 수 있습니다. 컴포넌트나 XHR 콜백, 심지어 일정한 간격으로요.

2. **Redux 스토어가 여러분이 지정한 리듀서 함수들을 호출합니다.**

   스토어는 리듀서에 현재의 상태 트리와 액션의 두 가지 인수를 넘깁니다. 예를 들어 할일 앱에서, 루트 리듀서는 아래와 비슷한 인수들을 받을겁니다:

   

   ```javascript
    // 애플리케이션의 현재 상태(할일 목록과 선택된 필터)
    let previousState = {
      visibleTodoFilter: 'SHOW_ALL',
      todos: [{
        text: 'Read the docs.',
        complete: false
      }]
    };
   
   
    // 실행되는 액션(할일 추가)
    let action = {
      type: 'ADD_TODO',
      text: 'Understand the flow.'
    };
   
   
    // 리듀서가 다음 상태를 반환함
    let nextState = todoApp(previousState, action);
   ```

   리듀서는 단지 다음 상태를 **계산**하는 순수 함수라는 점을 기억하세요. 리듀서는 완전히 예측 가능해야 합니다: 같은 입력을 가지고 몇번을 호출하든지 같은 출력이 나와야 합니다. API 호출이나 라우터 전환같은 사이드이펙트를 일으켜서는 안됩니다. 이런 일들은 액션이 전달되기 전에 행해져야 합니다.

3. **루트 리듀서가 각 리듀서의 출력을 합쳐서 하나의 상태 트리로 만듭니다.**

   루트 리듀서를 어떻게 구성하는지는 완전히 여러분에게 달렸습니다. Redux는 루트 리듀서를 각각이 상태 트리의 가지 하나씩을 다루는 함수들로 나눌 수 있도록 [`combineReducers()`]() 헬퍼 함수를 제공합니다.

   [`combineReducers()`]()의 작동 방식은 아래와 같습니다. 여러분이 두 개의 리듀서를 가지고 있다고 합시다. 하나는 할일 목록을 위한 것이고, 하나는 선택된 필터 설정을 위한 것입니다:

   

   ```javascript
    function todos(state = [], action) {
      // Somehow calculate it...
      return nextState;
    }
   
   
    function visibleTodoFilter(state = 'SHOW_ALL', action) {
      // Somehow calculate it...
      return nextState;
    }
   
   
    let todoApp = combineReducers({
      todos,
      visibleTodoFilter
    });
   ```

   여러분이 액션을 보내면, `combineReducers`가 반환한 `todoApp`은 두 리듀서를 모두 호출합니다:

   

   ```javascript
    let nextTodos = todos(state.todos, action);
    let nextVisibleTodoFilter = visibleTodoFilter(state.visibleTodoFilter, action);
   ```

   그리고 두 결과를 합쳐서 하나의 상태 트리로 만듭니다:

   

   ```javascript
    return {
      todos: nextTodos,
      visibleTodoFilter: nextVisibleTodoFilter
    };
   ```

   [`combineReducers()`]()가 편리한 헬퍼 유틸리티이긴 하지만, 반드시 써야 하는건 아닙니다; 원하신다면 루트 리듀서를 직접 작성하세요!

4. **Redux 스토어가 루트 리듀서에 의해 반환된 상태 트리를 저장합니다.**

   이 새 트리가 여러분의 앱의 다음 상태입니다! [`store.subscribe(listener)`]()를 통해 등록된 모든 리스너가 불러내지고 이들은 현재 상태를 얻기 위해 [`store.getState()`]()를 호출할겁니다.

   이제 새로운 상태를 반영하여 UI가 변경될겁니다. 여러분이 [React Redux](https://github.com/gaearon/react-redux)으로 바인딩을 했다면, 이 시점에 component.setState(newState)가 호출됩니다.



## React와 함께 사용하기

처음 시작할때부터 우리는 Redux가 React와는 관계가 없음을 강조했습니다. 여러분은 React, Angular, Ember, jQuery, 순수 JavaScript 중 어떤 것을 가지고도 Redux 앱을 만들 수 있습니다.

그렇긴 하지만 Redux는 액션에 반응하여 상태를 변경하기 때문에, [React](http://facebook.github.io/react/)나 [Deku](https://github.com/dekujs/deku)와 같이 UI를 상태에 대한 함수로 기술하는 프레임워크와 특히 잘 어울립니다.

우리의 간단한 할일 앱을 React로 만들어 보겠습니다.

### React Redux 설치하기

[React 바인딩](https://github.com/gaearon/react-redux)은 Redux에 기본적으로 포함되어있지는 않습니다. 여러분이 명시적으로 설치해줘야 합니다:



```shell
npm install --save react-redux
```

npm을 사용하지 않는 경우 unpkg로부터 최신 UMD 빌드를 가져올 수도 있습니다. ([개발 빌드](https://unpkg.com/react-redux@latest/dist/react-redux.js) 혹은 [운영 빌드](https://unpkg.com/react-redux@latest/dist/react-redux.min.js) 중에 고르세요). `<script>` 태그를 통해 UMD 빌드를 페이지에 삽입하면, `window.ReactRedux`라는 전역 변수를 내보내줍니다.

### Presentational 컴포넌트와 Container 컴포넌트

Redux용 React 바인딩은 **presentational 컴포넌트와 container 컴포넌트 components를 분리**하는 아이디어를 채택했습니다. 이런 용어에 익숙하지 않으시다면, [이 글을 먼저 읽어보시고](https://medium.com/@dan_abramov/smart-and-dumb-components-7ca2f9a7c7d0) 다시 이곳으로 돌아오세요. 이 개념들은 아주 중요하니, 돌아오실 때까지 기다리겠습니다!

글을 모두 읽어셨나요? 둘의 차이점을 다시 한 번 살펴봅시다:

|                      | Presentational 컴포넌트           | Container 컴포넌트                                |
| -------------------- | --------------------------------- | ------------------------------------------------- |
| 목적                 | 어떻게 보여질 지 (마크업, 스타일) | 어떻게 동작할 지 (데이터 불러오기, 상태 변경하기) |
| Redux와 연관됨       | 아니오                            | 예                                                |
| 데이터를 읽기 위해   | props에서 데이터를 읽음           | Redux 상태를 구독                                 |
| 데이터를 바꾸기 위해 | props에서 콜백을 호출             | Redux 액션을 보냄                                 |

우리가 작성할 대부분의 컴포넌트는 presentational 컴포넌트가 될 것입니다. 하지만 여러 개의 container 컴포넌트를 만들어서 Redux store와 연결해야 할 필요성도 있습니다. 이것이 container 컴포넌트가 컴포넌트 트리 상단에 위치해야 한다는 것을 의미하지는 않습니다. 만약 container 컴포넌트가 너무 복잡해지면 (예를 들어 presentational 컴포넌트가 엄청나게 중첩되어 있고 셀 수 없는 콜백이 내려보내지고 있다면), [FAQ]()에서 설명한 대로 다른 container 컴포넌트를 만들어서 컴포넌트 트리 중간에 도입해보세요.

엄밀히 말하면 여러분이 직접 [`store.subscribe()`]()을 사용해서 container 컴포넌트를 작성할 수도 있습니다. 하지만 이렇게 하는 것을 추천하지는 않는데, React Redux는 여러분이 직접 구현하기는 힘든 여러가지 성능 최적화를 해주기 때문입니다. 이런 이유에서, 우리는 container 컴포넌트를 직접 작성하지 않고 React Redux가 제공해주는 [`connect()`](https://github.com/reactjs/react-redux/blob/master/docs/api.md#connectmapstatetoprops-mapdispatchtoprops-mergeprops-options) 함수를 사용해 container 컴포넌트를 생성해줄 것입니다. 이를 어떻게 할 수 있는지 아래에서 확인해보겠습니다.

### 컴포넌트 계층을 설계하기

우리가 어떻게 [루트 상태 객체의 형태를 설계]()했는지 기억하시나요? 이제 그에 맞게 UI 계층을 설계하겠습니다. 이는 Redux에만 한정된 일은 아닙니다. [Thinking in React](https://facebook.github.io/react/docs/thinking-in-react.html)는 이 과정을 설명하는 좋은 튜토리얼입니다.

우리의 설계를 요약하면 간단합니다. 우리는 할일 목록을 보여줄겁니다. 할일을 클릭하면 완료한 것으로 표시됩니다. 사용자가 할일을 추가할 필드도 보여줘야 합니다. 푸터에는 모든 할일을 보여주거나 / 완료된 할일만 보여주거나 / 완료되지 않은 할일만 보여주는 토글을 놓겠습니다.

#### Presentational 컴포넌트 설계하기

위의 내용을 바탕으로 아래의 presentational 컴포넌트들과 그 속성들을 이끌어낼 수 있습니다.

- `AddTodo`는 버튼이 달린 입력 필드입니다.
  - `onAddClick(text: string)`은 버튼을 누르면 불러올 콜백입니다.
- `TodoList`는 표시 중인 할일 목록입니다.
  - `todos: Array`는 `{ text, completed }` 형태의 할일 배열입니다.
  - `onTodoClick(index: number)`은 할일을 누르면 호출할 콜백입니다.
- `Todo`는 할일 하나입니다.
  - `text: string`은 보여줄 텍스트입니다.
  - `completed: boolean`은 할일을 완료된것으로 표시할지 여부입니다.
  - `onClick()`은 할일을 누르면 호출할 콜백입니다.
- `Link` is a link with a callback.
  - `onClick()` is a callback to invoke when the link is clicked.
- `Footer`는 표시할 할일 필터를 사용자가 바꿀 수 있게끔 해주는 컴포넌트입니다.
- `App`은 다른 모든 컴포넌트를 렌더링하는 최상단 컴포넌트입니다.

이 컴포넌트들은 모두 *외양*을 담당하지만 데이터가 *어디에서* 온 것인지, 또 *어떻게* 데이터를 변경해야 하는지는 알지 못합니다. 그저 주어진 것을 표시해줄 뿐이죠. 만약 Redux를 쓰다가 Redux 대신 다른 무언가를 쓰게 된다면, 이 모든 컴포넌트들을 그대로 유지할 수 있습니다. Redux에 대한 의존성이 없기 때문입니다.

#### Container 컴포넌트 설계하기

Presentational 컴포넌트를 Redux에 연결하기 위해서는 container 컴포넌트 역시 필요합니다. 예를 들어, `TodoList` presentational 컴포넌트는 `VisibleTodoList`와 같은 container 컴포넌트를 필요로 합니다. 여기서 `VisibleTodoList`는 Redux 스토어의 변경사항을 구독하고 현재 필터를 어떻게 적용해야 할 지를 아는 컴포넌트입니다. 필터를 변경하기 위해, `FilterLink` 컴포넌트를 만들어서 `Link` 컴포넌트를 렌더링하고 여기에 클릭이 일어날 때마다 적절한 액션을 파견해 줄 것입니다:

- `VisibleTodoList` 컴포넌트는 현재 필터 상태에 따라 할일 목록을 필터링해서 `TodoList` 컴포넌트를 표시합니다.
- `FilterLink` 컴포넌트는 현재 필터 상태를 가져와서 `Link` 컴포넌트를 표시합니다.
  - `filter: string` 속성에는 이 컴포넌트가 어떤 필터를 나타내는지 저장합니다.

#### 그 밖의 컴포넌트 설계하기

가끔 어떤 컴포넌트를 presentational 컴포넌트로 만들어야 할 지, container 컴포넌트로 만들어야 할 지 결정하기 어려운 경우가 있습니다. 예를 들어, 다음과 같이 폼과 기능이 밀접하게 결합되어 있는 경우입니다:

- `AddTodo` 컴포넌트는 “Add” 버튼이 있는 입력 필드입니다.

엄밀히 따져보자면 우리는 이것을 두 개의 컴포넌트로 쪼갤 수 있지만, 이 단계에서 그렇게까지 할 필요는 없습니다. 아주 작은 컴포넌트의 경우 외양과 논리구조가 섞어있어도 괜찮습니다. 컴포넌트가 커짐에 따라, 그것을 어떻게 쪼개야 할 지 더 명확해 질 것이므로, 일단은 이렇게 섞어놓은 채로 남겨두겠습니다.

### 컴포넌트 구현하기

이제 컴포넌트를 작성해봅시다! Presentational 컴포넌트부터 시작할 것이므로, 일단 지금은 Redux와 어떻게 엮을 것인지를 생각하지 않아도 괜찮습니다.

#### Presentational Component 구현하기

이들은 모두 평범한 React 컴포넌트이므로, 여기서 자세히 뜯어보지는 않겠습니다. 우리는 지역 상태나 생애주기(lifecycle) 메소드가 필요하지 않은 경우 항상 상태를 갖지 않는 함수형 컴포넌트를 만들 것입니다. 이것이 presentational 컴포넌트는 항상 *함수여야만 한다*는 것을 뜻하지는 않습니다. 그냥 이 쪽이 정의하기 더 쉬운 것일 뿐이죠. 만약 지역 상태나 생애주기 메소드, 혹은 성능 최적화가 필요한 때가 오면 클래스로 바꿔주면 됩니다.

`components/Todo.js`



```javascript
import React from 'react'
import PropTypes from 'prop-types'


const Todo = ({ onClick, completed, text }) => (
  <li
    onClick={onClick}
    style={ {
      textDecoration: completed ? 'line-through' : 'none'
    }}
  >
    {text}
  </li>
)


Todo.propTypes = {
  onClick: PropTypes.func.isRequired,
  completed: PropTypes.bool.isRequired,
  text: PropTypes.string.isRequired
}


export default Todo
```

`components/TodoList.js`



```javascript
import React from 'react'
import PropTypes from 'prop-types'
import Todo from './Todo'


const TodoList = ({ todos, onTodoClick }) => (
  <ul>
    {todos.map((todo, index) => (
      <Todo key={index} {...todo} onClick={() => onTodoClick(index)} />
    ))}
  </ul>
)


TodoList.propTypes = {
  todos: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      completed: PropTypes.bool.isRequired,
      text: PropTypes.string.isRequired
    }).isRequired
  ).isRequired,
  onTodoClick: PropTypes.func.isRequired
}


export default TodoList
```

### `components/Link.js`



```javascript
import React from 'react'
import PropTypes from 'prop-types'


const Link = ({ active, children, onClick }) => {
  if (active) {
    return <span>{children}</span>
  }


  return (
    <a
      href=""
      onClick={e => {
        e.preventDefault()
        onClick()
      }}
    >
      {children}
    </a>
  )
}


Link.propTypes = {
  active: PropTypes.bool.isRequired,
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func.isRequired
}


export default Link
```

`components/Footer.js`



```javascript
import React from 'react'
import FilterLink from '../containers/FilterLink'


const Footer = () => (
  <p>
    Show:
    {' '}
    <FilterLink filter="SHOW_ALL">
      All
    </FilterLink>
    {', '}
    <FilterLink filter="SHOW_ACTIVE">
      Active
    </FilterLink>
    {', '}
    <FilterLink filter="SHOW_COMPLETED">
      Completed
    </FilterLink>
  </p>
)


export default Footer
```

#### Container 컴포넌트 구현하기

이제 위에서 만들었던 presentational 컴포넌트를 Redux와 연결해줄 시간입니다. 이를 위해 몇 개의 container 컴포넌트를 만들 것입니다. 사실 container 컴포넌트는 그저 React 컴포넌트일 뿐입니다. 다만 [`store.subscribe()`]()를 사용해서 Redux 상태 트리를 일부분을 읽어오기도 하고, 다른 presentational 컴포넌트에 속성을 넘겨주기도 하죠. 여러분이 container 컴포넌트를 직접 작성할 수도 있지만, 그 대신 React Redux 라이브러리에 내장된 [`connect()`](https://github.com/reactjs/react-redux/blob/master/docs/api.md#connectmapstatetoprops-mapdispatchtoprops-mergeprops-options) 함수를 통해 container 컴포넌트를 생성하는 것을 추천합니다. `connect()`를 사용하면, 쓸데없는 렌더링을 막아주어 성능이 향상됩니다. (이로써 직접 `shouldComponentUpdate`를 직접 구현해야 하는 부담을 덜 수 있게 됩니다. 자세한 내용은 [React performance suggestion](https://facebook.github.io/react/docs/advanced-performance.html)을 참고하세요.)

`connect()`를 사용하려면, `mapStateToProps`라 불리는 특별한 함수를 정의해야 합니다. 이 함수에는 현재 Redux 스토어의 상태를 어떻게 변형할지, 그리고 어떤 속성을 통해 presentational 컴포넌트로 넘겨줄 지를 서술하면 됩니다. 예를 들어, `VisibleTodoList` 컴포넌트는 `todos`를 필터링해서 `TodoList`에 넘겨주어야 하기 때문에, `state.visibilityFilter`에 따라 `state.todos`를 필터링하는 함수를 작성하고 이 함수를 `mapStateToProps`로서 사용할 수 있습니다:



```javascript
const getVisibleTodos = (todos, filter) => {
  switch (filter) {
    case 'SHOW_COMPLETED':
      return todos.filter(t => t.completed)
    case 'SHOW_ACTIVE':
      return todos.filter(t => !t.completed)
    case 'SHOW_ALL':
    default:
      return todos
  }
}


const mapStateToProps = state => {
  return {
    todos: getVisibleTodos(state.todos, state.visibilityFilter)
  }
}
```

상태를 읽어오는 일 외에, container 컴포넌트는 스토어에 액션을 보낼 수 있습니다. 위와 비슷한 방식으로 `mapDispatchToProps()` 함수를 정의하면 되는데, 이 함수는 [`dispatch()`]() 메소드를 인자로 받습니다. 이 함수가 콜백으로 이루어진 속성들을 반환하도록 만들어주면, presentational 컴포넌트에 이 속성들이 주입됩니다. 예를 들어, `VisibleTodoList`가 `onTodoClick` 속성을 `TodoList`에 주입하면서 `onTodoClick` 함수가 `TOGGLE_TODO` 액션을 파견하게끔 만들어주고 싶다면 아래와 같이 하면 됩니다:



```javascript
const mapDispatchToProps = dispatch => {
  return {
    onTodoClick: id => {
      dispatch(toggleTodo(id))
    }
  }
}
```

마지막으로, `connect`를 호출하면서 앞의 두 함수들을 인자로 넘겨줌으로써 `VisibleTodoList`를 만들어낼 수 있습니다.



```javascript
import { connect } from 'react-redux'


const VisibleTodoList = connect(
  mapStateToProps,
  mapDispatchToProps
)(TodoList)


export default VisibleTodoList
```

위에서 보신 것은 React Redux API의 기본적인 부분으로, 몇몇 편의 기능과 설정 사항이 더 있으므로 [공식 문서](https://github.com/reactjs/react-redux)를 읽어보시기 바랍니다. 만약 `mapStateToProps`가 새 객체를 너무 자주 생성하는 것이 걱정되신다면, [reselect](https://github.com/reactjs/reselect)를 이용해 [파생된 데이터 계산하기]()를 알아보세요.

나머지 container 컴포넌트들이 아래에 정의되어 있습니다:

`containers/FilterLink.js`



```
import { connect } from 'react-redux'
import { setVisibilityFilter } from '../actions'
import Link from '../components/Link'


const mapStateToProps = (state, ownProps) => {
  return {
    active: ownProps.filter === state.visibilityFilter
  }
}


const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onClick: () => {
      dispatch(setVisibilityFilter(ownProps.filter))
    }
  }
}


const FilterLink = connect(
  mapStateToProps,
  mapDispatchToProps
)(Link)


export default FilterLink
```

`containers/VisibleTodoList.js`



```javascript
import { connect } from 'react-redux'
import { toggleTodo } from '../actions'
import TodoList from '../components/TodoList'


const getVisibleTodos = (todos, filter) => {
  switch (filter) {
    case 'SHOW_ALL':
      return todos
    case 'SHOW_COMPLETED':
      return todos.filter(t => t.completed)
    case 'SHOW_ACTIVE':
      return todos.filter(t => !t.completed)
  }
}


const mapStateToProps = state => {
  return {
    todos: getVisibleTodos(state.todos, state.visibilityFilter)
  }
}


const mapDispatchToProps = dispatch => {
  return {
    onTodoClick: id => {
      dispatch(toggleTodo(id))
    }
  }
}


const VisibleTodoList = connect(
  mapStateToProps,
  mapDispatchToProps
)(TodoList)


export default VisibleTodoList
```

### 그 밖의 컴포넌트 구현하기

[위에서 언급했던 것처럼](), `AddTodo` 컴포넌트에 대한 외양과 논리구조를 섞어놓을 것입니다.



```javascript
import React from 'react'
import { connect } from 'react-redux'
import { addTodo } from '../actions'


let AddTodo = ({ dispatch }) => {
  let input


  return (
    <div>
      <form
        onSubmit={e => {
          e.preventDefault()
          if (!input.value.trim()) {
            return
          }
          dispatch(addTodo(input.value))
          input.value = ''
        }}
      >
        <input
          ref={node => {
            input = node
          }}
        />
        <button type="submit">
          Add Todo
        </button>
      </form>
    </div>
  )
}
AddTodo = connect()(AddTodo)


export default AddTodo
```

만약 `ref` 속성에 친숙하지 않으시다면, [공식 문서](https://facebook.github.io/react/docs/refs-and-the-dom.html)를 통해 `ref`의 올바른 사용법을 익혀보세요.

#### 여러 Container를 하나의 컴포넌트 안에 묶기

`components/App.js`



```javascript
import React from 'react'
import Footer from './Footer'
import AddTodo from '../containers/AddTodo'
import VisibleTodoList from '../containers/VisibleTodoList'


const App = () => (
  <div>
    <AddTodo />
    <VisibleTodoList />
    <Footer />
  </div>
)


export default App
```

### 스토어 넘겨주기

모든 container 컴포넌트는 Redux 스토어에 접근하거나 스토어를 구독할 수 있어야 합니다. 이렇게 만들 수 있는 한 가지 방법은 모든 container 컴포넌트의 속성에다가 스토어를 넘겨주는 것입니다. 하지만 이 방법은 너무 진이 빠지는 방법이고, 컴포넌트 트리 하부에 있는 container 컴포넌트에 스토어를 넘겨주기 위해 presentational 컴포넌트에까지 스토어를 넘겨주어야 합니다.

저희가 권장하는 방법은 React Redux가 제공하는 특별한 컴포넌트인 [``](https://github.com/reactjs/react-redux/blob/master/docs/api.md#provider-store)를 사용하는 것입니다. 이 컴포넌트는 명시적으로 스토어를 넘겨주지 않더라도 [마법처럼](https://facebook.github.io/react/docs/context.html) 모든 container 컴포넌트에서 스토어를 사용할 수 있도록 해줍니다. 이 컴포넌트는 최상단 컴포넌트를 렌더링할 때 한 번만 사용해주면 됩니다.

`index.js`



```javascript
import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import { createStore } from 'redux'
import todoApp from './reducers'
import App from './components/App'


let store = createStore(todoApp)


render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
)
```