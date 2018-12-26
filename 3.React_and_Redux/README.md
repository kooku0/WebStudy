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

