# Class constructor에서의 super()

본 글은 <http://cheng.logdown.com/posts/2016/03/26/683329>를 한국어로 번역한 글입니다.

```javascript
class MyClass extends React.Component {
    constructor(){
        super();
    }
}
```

2가지 질문이 아마 떠오를 거에요:

1. constructor 안에서 super()를 꼭 불러야 하는가?
2. super()를 부르는 것과 super(props)를 부르는 것의 차이는?

------

**1번에 대한 답변**

“당신이 constructor를 사용한다면 항상 super()를 부르세요. constructor가 없다면 super()에 대해 신경쓰지 않아도 돼요.”

super()를 부르는 것은 꼭 필요합니다. 당신이 constructor를 가지고 있을 때만 말이죠. 아래의 코드를 한 번 보세요.

```javascript
class MyClass extends React.Component {
    render(){
        return <div>Hello { this.props.world }</div>;
    }
}
```

위의 코드는 완벽하게 작동합니다. 당신이 만드는 react component마다 모두 super()를 불러야 하는 건 아니에요. 하지만 당신의 코드에 constructor가 있다면, 당신은 반드시 super()를 불러야 합니다.

```javascript
class MyClass extends React.Component {
    constructor(){
        console.log(this) //Error: 'this' is not allowed before super()

    }
}
```

super() 전에 this가 허용되지 않는 이유는, super()가 불리지 않으면 this가 초기화되지 않기 때문이에요.

어쩌면, super()를 부르지 않고 빈 constructor를 만들면, 이 문제가 없다고 생각할 수도 있겠네요.

```javascript
class MyClass extends React.Component {
    constructor(){} // Error: missing super() call in constructor

}
```

ES6 class constructor는 subclasses가 있다면 무조건 super()를 불러야 합니다.따라서 코드에 constructor가 있는 한 반드시 super()를 불러야 해요. (하지만 subclass는 constructor를 가지지 않아도 상관 없습니다.)

------

**2번에 대한 답변**

“당신이 constructor 안에서 this.props에 접근하고 싶을 때만 super(props)를 부르세요. 다른 곳에서 접근하고 싶은 거라면, React가 자동으로 당신을 위해 설정해줄 거에요.”

super()를 부를 때 props를 인자로 넘겨주는 것은 당신이 constructor 안에서 this.props를 접근할 수 있게 만들어줍니다.

```javascript
class MyClass extends React.Component{
    constructor(props){
        super();
        console.log(this.props); // this.props is undefined

    }
}
```

이걸 고치기 위해서는,

```javascript
class MyClass extends React.Component{
    constructor(props){
        super(props);
        console.log(this.props); // prints out whatever is inside props

    }
}
```

하지만 (constructor가 아닌) 다른 곳에서 this.props를 사용하고 싶은 거라면, constructor 안에 props를 넘겨줄 필요가 없습니다. 왜냐하면 React가 자동으로 당신을 위해 세팅해주기 때문이죠.

```javascript
class MyClass extends React.Component{
    render(){
        // There is no need to call `super(props)` or even having a constructor 

        // this.props is automatically set for you by React 

        // not just in render but another where else other than the constructor

        console.log(this.props);  // it works!

    }
}
```



### reference

* [[번역] React ES6 — Class constructor에서의 super()](https://medium.com/@umioh1109/react-es6-class-constructor%EC%97%90%EC%84%9C%EC%9D%98-super-9d53ba0611d9)