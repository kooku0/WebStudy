# 8. Vue.js_Create_Project

> Vue.js ... React를 처음 접한 나로서는 다시 공부하고 싶지 않았다. 하지만 Vue.js로 프론트를 제작해달라는 요청으로 어쩔 수 없이 새로 공부를 하게 되었다. ㅠㅠ

여기서는 따로 vue에 대한 설명은 하지 않고 바로 프로젝트 생성을 하겠습니다.

## vue-cli 사용하기

`Vuejs`에서는 누구나 쉽게 프로젝트를 시작하고 설정같은 것에 고민하지 말고, 비지니스 로직에만 신경쓰도록 지원해주고 있습니다. 그 결과물로 `vue-cli`라는 툴이 있습니다. 이 툴 역시 오픈소스로 공개되어 있습니다.

`vue-cli`는 `npm`모듈로 제작되어 있기에 `node.js`가 필수적으로 설치되어 있어야 쉽게 사용하실 수 있습니다.

`vue-cli`를 설치해보도록 합시다!

```shell
$ npm install vue-cli -g
```

위 명령어를 실행하면 어디에서든지 `vue-cli`를 요청할 수 있도록 설치가 됩니다. 간혹 mac or linux에서 `-g`로 설치가 안될 수도 있는데 그 때는 명령어 앞에 `sudo`를 추가해줍니다. `$ sudo npm install vue-cli -g` 이렇게 말이죠.

설치하고 나면 `vue-cli`로 프로젝트를 생성하고 초기설정을 자동으로 설정할 수 있습니다.

```shell
$ vue init <template-name> <project-name>
```

### webpack template

여러 템플릿 모드가 지원되지만 자주 사용될 템플릿모드로 시작하겠습니다.

```shell
$ vue init webpack vue-example-project
```

템플릿만 `webpack`으로 지정하여 프로젝트를 생성합니다. `webpack-simple`에 비해 물어보는 것도 많고 설치되는 것도 많이 있습니다.

```
# Vue 빌드 선택
? Vue build

# 두개 중에서 선택할 수 있으며, 기본선택은 Runtime + Compiler 입니다.

# 대부분의 사용자에게 권장하는 방식입니다.
- Runtime + Compiler: recommended for most users

# 6KB의 가벼운 min+gzip으로 이루어져 있는 런타임전용입니다. 템플릿은 .vue에서만 허용하고 있습니다.
- Runtime-only: about 6KB lighter min+gzip, but templates (or any Vue-specific HTML) are ONLY allowed in .vue files - render functions are required elsewhere 

# vue-router사용여부 (사용하면 자동으로 설정해줍니다)
? Install vue-router? (Y/n)

# ESLint 적용여부 (사용하면 코드작성 스타일을 강제화 합니다)
? Use ESLint to lint your code? (Y/n)

# ESLint 적용하면 나오는 질문으로 어떤 스타일을 사용할 것인지 물어봅니다.
? Pick an ESLint preset

# 3개의 선택지가 나오며 기본은 Standard로 되어 있습니다.
- Standard (https://github.com/feross/standard)
- Airbnb (https://github.com/airbnb/javascript)
- none (configure it yourself)

# 유닛테스트 Karma, Mocha 적용 여부
? Setup unit tests with Karma + Mocha? (Y/n)

# Nightwatch 적용 여부 (UI테스트 툴입니다)
? Setup e2e tests with Nightwatch? (Y/n)
```



설치하고 나면 역시 폴더로 들어가서 `npm` 모듈들을 설치하고 실행해주면 됩니다.

```shell
$ npm install

$ npm run dev
```

여기에는 `webpack-simple`로 프로젝트를 생성했을 때보다 많은 파일들이 있습니다.
하나하나 중요하지만 실제 프로젝트 진행시 꼭 알아두면 좋은 것들만 추려서 설명드리겠습니다. 여기에서 간략하게 숙지하신 뒤, 실제 개발을 진행하면서 vue-cli 관련 자료를 찾아보시면 좋을 것 같습니다 : )

```
build
→ 배포시 관련 설정들이 들어있는 폴더입니다.

config
→ webpack관련 설정들이 포함되어 있는 폴더입니다.

package.json
→ npm 의존성 모듈 목록들과 개발/테스트/배포할 수 있는 명령어들이 포함되어 있습니다.

src
→ 여기에서 Vuejs로 개발을 진행할 수 있으며 vue-router까지 이미 설정되어 있는 것을 확인하실 수 있습니다.

static
→ Vuejs와 관련없이 정말 공통으로 사용해야할 정적파일들을 이 곳에 보관할 수 있습니다.

test
→ 개발하면서 유닛테스트를 진행할 수 있도록 준비되어 있는 test 폴더입니다.

# 빌드 후 생성되는 폴더
dist
→ 빌드를 완료하게 되면 dist폴더에 모든 파일과 index.html까지 포함되어 있습니다. 이 폴더 안에 있는 모든파일을 배포공간에 넣어두면 서비스를 운영할 수 있습니다.
```



### reference 

* [[Vuejs] 바닥에서 시작하기, 그리고 화면 출력하기 (덤으로 배포파일까지!)](https://jinblog.kr/192)