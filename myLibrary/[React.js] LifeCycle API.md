# LifeCycle API



- Mounting
  - constructor: 생성자 함수 우리가 만든 컴포넌트가 처음 브라우저에 나타날때 만드러지는 과정에서 생성되는 함수
  - getDerivedStateFromProps: props로 받은 값을 state에 그대로 동기화 할때 사용
  - render: 어떤 Dom을 만드게 될지
  - componentDidMount: 외부 라이브러리를 사용할때(chart.js) 또는 ajax 요청, component가 나타나고 몇초 뒤에 ~ 하고싶을때 사용, 이벤트 요청등을 여기에 정의한다.

- Updating
  - shouldComponentUpdate: 컴포넌트가 업데이트되는 성능을 최적화시킬때 사용한다. 부모컴포넌트가 리랜더링되면 자식컴포넌트도 자동 랜더링이 된다. 그런데 이 작업이 가끔 불필요하다. 일단 render가 virtual dom에 그리기는 하는데 이런 virtual dom에 그리는 성능조차 아끼고 싶을때 사용한다. true 또는 false값을 반환하는데 이를 통해 랜더 함수를 호출한다.
  - getSnapshotBeforeUpdate: 랜더링하고 브라우저에 호출되기 바로 직전, 스크롤의 위치나 해당 dom의 위치를 가지고 올때 사용한다.
  - componentDidUpdate: 작업을 마치고 update를 했을때 호출

- Unmouting
  - componentWillUnmount: 컴포넌트가 사라질때 호출될때 호출되는 함수 componentDidMount에서 생성한 리스너를 없애주는 작업을 하면된다.

> 위 개념을 이해하면 쉽게 저지르는 실수를 줄일 수 있는데, 예를 들면 다음과 같습니다.
>
> - **Mouting**: Creating 중인 `componentWillMount()`에서 Ajax 요청을 날리면 응답 시간만큼 컴포넌트를 그리는 것이 늦어짐을 알 수 있습니다. 따라서 일반적으로 `componentDidMount()`에서 Ajax 요청을 하는 게 낫다는 것을 알 수 있습니다.
> - **Updating**: Receiving State 중에 `setState()` API를 호출하면 프로세스가 끝난 후 또다시 Receiving State 할 것을 알 수 있습니다. 따라서 `setState()` API를 해당 Lifecycle 함수에서 호출하면 개념적으로 무한 루프에 빠질 수밖에 없다는 것을 알 수 있습니다. (물론 실제로도 무한 루프에 빠지게 됩니다.)





### reference

* [유튜브 Velopert](https://www.youtube.com/watch?v=_aBq1SKl6yQ&index=2&list=PL9FpF_z-xR_E4rxYMMZx5cOpwaiwCzWUH)
* [React의 기본, 컴포넌트를 알아보자](https://medium.com/little-big-programming/react%EC%9D%98-%EA%B8%B0%EB%B3%B8-%EC%BB%B4%ED%8F%AC%EB%84%8C%ED%8A%B8%EB%A5%BC-%EC%95%8C%EC%95%84%EB%B3%B4%EC%9E%90-92c923011818)
* [5편: LifeCycle API](https://react-anyone.vlpt.us/05.html)