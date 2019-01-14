# React 컴포넌트의 setState() API

> `setState`에 대한 질문이나 소개하는 글을 많이 보지 못했는데 아마도 `setState`를 이용하기보단 바로 Redux나 MobX와 같은 state 관리 라이브러리를 사용하는 것 같습니다. 하지만 `setState`를 꼭 사용해보고 난 후에 Redux 혹은 MobX 사용을 고민해봐야 합니다. 2016년도를 강타한 [how-it-feels-to-learn-javascript-in-2016](https://hackernoon.com/how-it-feels-to-learn-javascript-in-2016-d3a717dd577f)이라는 글에서 꼬집듯이 맹목적으로 사용하는 것이 아닌 **왜 사용하는가?**를 알아야 [무엇이 편해지고 언제 사용해야 좋은지 알 수 있기 때문이죠.](https://github.com/ehrudxo/react-makes-you-sad)

컴포넌트는 `setState()`(이하 ‘setState’)라는 API가 존재합니다. 이름 그대로 컴포넌트의 `state`를 변경할 때 사용하는 API입니다. 그냥 state를 직접 변경할 수도 있을 텐데 왜 굳이 API를 통해서 변경해야 할까요? [자바스크립트의 비교 연산자](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Comparison_Operators)는 피연산자의 값이 아닌 reference 값을 기준으로 참/거짓을 리턴하기 때문입니다.

만약 `state`의 값을 직접 변경할 경우에는 해당 오브젝트의 reference 값이 변하지 않아 컴포넌트는 `state`가 변경되지 않았다고 볼 수밖에 없습니다. 그러므로 [화면이 갱신되지 않는 것](https://facebook.github.io/react/docs/state-and-lifecycle.html#do-not-modify-state-directly)이지요. 따라서 React는 `setState`를 이용해 기존 `state`와 머지하여 `state`**의 변경 가능성**을 명시적으로 알려줍니다. 머지를 통해 새로 생성된 `state`의 **reference 값은 기존과 다르므로** 컴포넌트에서는 shallow compare를 통해 변경되었음을 알 수 있습니다. 물론 reference 변경일 뿐이니 실제 값은 변경되지 않을 수도 있습니다.

한 가지 더 중요한 사실은 `setState` 호출 즉시 `state`가 변경되는 것이 아니라 **비동기로 동작한다**는 점입니다. 상태가 변경된 직후에 필요한 작업이 있다면 `setState(nextState, callback)`의 `callback`을 사용해야 합니다.

따라서 아래는 **보장되지 않습니다**.

1. `setState` 호출 직후에 `state`가 즉시 갱신된다.
2. 한 컨텍스트 내에서의 `setState` 호출 수와 컴포넌트 업데이트 수는 같다.

하지만 다음은 **보장됩니다.**

1. `setState` 실행 순서
2. `setState` callback의 실행 순서
3. `state` 변화가 클릭 등의 event 실행 전에 컴포넌트에 반영된다.

그렇다면 `setState`는 왜 비동기로 동작할까요? 이는 끊김 없는 원활한 UI/UX를 제공하기 위해 일정 수의 `render`를 꼭 수행시키기 위해서입니다. `setState`가 동기로 동작한다고 가정해보겠습니다. `state` 변경이 많으면 많을수록 `render`는 모든 변경이 적용될 때까지 늦어지기 때문에 실제 화면에서는 **엄청나게 부자연스럽게 동작**하게 될 것입니다. 비동기로 동작하게 되면 `render` 시점과 별개로 동작하기 때문에 자연스러운 갱신이 가능해집니다.

### reference

* [React의 기본, 컴포넌트를 알아보자](https://medium.com/little-big-programming/react%EC%9D%98-%EA%B8%B0%EB%B3%B8-%EC%BB%B4%ED%8F%AC%EB%84%8C%ED%8A%B8%EB%A5%BC-%EC%95%8C%EC%95%84%EB%B3%B4%EC%9E%90-92c923011818)