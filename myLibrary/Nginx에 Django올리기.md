# Nginx에 Django올리기

> Nginx위에 Django를 올리면서 하였던 삽질을 정리하였다.
>
> 기본적인 내용은 [공식문서](https://uwsgi-docs.readthedocs.io/en/latest/tutorials/Django_and_nginx.html)를 따라간다.

*가상환경과 Django설치가 모두 셋팅되었다는 것을 가정한다.*

*웹 서버는 Nginx를 사용*

만약 그냥 Django를 실행시키려고 한다면 안될 것이므로 

```shell
$ python manage.py runserver 0.0.0.0:8000
```

로 실행하여야 한다.



## uWSGI?

uWSGI는 WSGI(Web Server Gateway Interface)을 구현한 것이다. WSGI는 웹서버와 웹앱을 연결해주는 인터페이스를 정의([PEP333](http://legacy.python.org/dev/peps/pep-0333/))하여 웹서버와 웹앱(python으로 구현한)를 독립적으로 구성할 수 있게 한다. uWSGI가 없을 때는 웹서버와 웹앱을 선택하는데 제약이 있었다.

예를 들면 Apache, Nginx의 웹서버는 정적 콘텐츠(이미지, 파일 등)에 대한 처리를 수행하고 동적 콘텐츠(로그인, 메일)는 django, flask를 이용하여 만든 웹앱이 처리를 한다. 이 때 Nginx와 django 사이의 interface를 정의한 것이 WSGI이고 구현한 것이 uWSGI이다.

> 한줄요약: uWSGI를 사용하지 않으면 안된다.



## 세팅

### 1. uWSGI 세팅

먼저 uWSGI를 설치한다. 이때, source bin/activate된 상태를 유지한다.

``` shell
$ pip3 install uwsgi
```

다음 test.py를 Django 프로젝트 폴더에 생성한다.

```python
#sudo vi test.py
def application(env, start_response):
	start_response('200 OK', [('Content-Type', 'text/html')])
	return [b"Hello World"]
```

uwsgi로 test.py를 실행시켜 작동하는지 확인합니다.

```shell
$ uwsgi --http :8000 --wsgi-file test.py
```

runserver로 실행시킨 것과 같이 웹에서 확인해보면 같은 문구가 나오는 것과 아래와 같은 구조로 통신하는 것을 알 수 있습니다.

` Web Client <-> uWSGI <-> Django `

### 2. uwsgi_params 세팅

`uwsgi_param`은 지정된 `environ` 키를 설정해주는 것으로 https://github.com/nginx/nginx/blob/master/conf/uwsgi_params 이걸 복사해서 사용하면 됩니다.

`nano etc/nginx/uwsgi_params`

```
uwsgi_param  QUERY_STRING       $query_string;
uwsgi_param  REQUEST_METHOD     $request_method;
uwsgi_param  CONTENT_TYPE       $content_type;
uwsgi_param  CONTENT_LENGTH     $content_length;

uwsgi_param  REQUEST_URI        $request_uri;
uwsgi_param  PATH_INFO          $document_uri;
uwsgi_param  DOCUMENT_ROOT      $document_root;
uwsgi_param  SERVER_PROTOCOL    $server_protocol;
uwsgi_param  REQUEST_SCHEME     $scheme;
uwsgi_param  HTTPS              $https if_not_empty;

uwsgi_param  REMOTE_ADDR        $remote_addr;
uwsgi_param  REMOTE_PORT        $remote_port;
uwsgi_param  SERVER_PORT        $server_port;
uwsgi_param  SERVER_NAME        $server_name;
```

확장자 명은 안붙힌다.

### 3. Nginx 세팅

Nginx 설정파일로 이동합니다. 

80번 포트는 react build 파일을 연결해주었기 때문에 장고는 8000번 포트를 사용하겠습니다.

`etc/nginx/sites-available/default`

```python
.... #80번 포트 설정해준 부분

upstram django {
    server 127.0.0.1:8001;
}

server {
    listen 8000;
    
    server_name test.com;
    
    charset utf-8;
    
    location / {
        uwsgi_pass django;
        include /etc/nginx/uwsgi_params;
	}
}
```

### 4. Port를 사용한 uWSGI

앞서 만들어 놓은 test.py로 nginx와 uWSGI 연동을 확인하는 명령어입니다.

```shell
$ uwsgi --socket :8001 --wsgi-file test.py
```

웹에서 확인하기 위해선 URL:8001로 확인하는 것이 아닌, 8000 포트로 확인합니다. 아래와 같은 구조로 되어 있으면서 사용자가 8000번 포트로 접속하면됩니다. 아래와 같은 구조로 되어 있으면서 사용자가 8000번 포트로 접속하면 소켓을 통해 8001번을 호출하게 됩니다. 

`web client <-> web server <-> socket <-> uWSGI <-> Python`

자신의 Django를 실행시키기 위해서는 

```shell
$ uwsgi --socket /tmp/프로젝트명.sock --module 프로젝트경로.wsgi
```

을 하면 됩니다.

### 5. Unix socket을 사용한 uWSGI

앞서 uWSGI를 사용한 방법은 TCP port socket을 사용한 방법이였습니다. 이 방법을 사용하는 이유는 간단하기 때문입니다. 하지만 포트를 사용하는 것보단 유닉스 소켓을 사용하는 것이 오베헤드가 더 적기 떄문에 좋습니다. 앞에서 작성한 nginx default 파일을 수정합니다.

```
upstram django {
    server unix:///tmp/프로젝트명.sock;
}
```

nginx를 재시작 한 다음, 아래의 명령어를 실행합니다.

```shell
$ uwsgi --socket /tmp/프로젝트명.sock --wsgi-file test.py
```

### 6. .ini파일을 사용하여 uWSGI 실행

**중요**
.ini파일을 설정하여 사용하는 이유는 uWSGI를 실행시키기 위해 공통적으로 사용되는 옵션들을 정리하여 보다 쉽게 구성하기 위함입니다.

또한 매번 긴 파일 경로를 사용하지 않아도 됩니다.

프로젝트 폴더안에 `프로젝트명_uwsgi.ini`를 생성한 다음, 내부를 아래와 같이 작성합니다.

```ini

[uwsgi]
# 프로젝트 경로
chdir = /root/ad-tech/backend/server/

# 프로젝트.wsgi
module = ad-tech.wsgi
# 이걸 써도 무방 
#module = django.core.wsgi:get_wsgi_application()

#가상환경 실행되는 곳
home = /root/ad-tech/backend/server/newenv

master = true

processes = 1

socket = /tmp/ad-tech.sock

buffer-size=32768

chmod-socket = 666

```

**buffer-size** 부분이 중요한데, body나 prams에 많은 데이터를 넣어서 request를 보내게 되면

`invalid request block size: 21327 (max 4096)...skip`라는 에러 메세지를 띄우게 된다.  uwsgi는 기본적으로 request의 크기를 제한시켜 놓기 때문이다. 

다음, 아래의 명령어를 실행시켜 확인합니다.

```shell
$ uwsgi --ini 프로젝트명_uwsgi.ini
```

### 7. uWSGI 서비스 등록

위의 방법으로는 ssh접속을 끊을때 장고도 꺼지므로 시스템 등록이 필요합니다.

`/etc/systemd/system/uwsgi.service` 파일을 아래와 같은 내용으로 생성한다.

```ini
[Unit]
Description=uWSGI Emperor service

[Service]
ExecStart=/usr/local/bin/uwsgi --emperor 프로젝트경로
Restart=on-failure
KillSignal=SIGQUIT
Type=notify
NotifyAccess=all
StandardError=syslog

[Install]
WantedBy=multi-user.target
```

`ExecStart` 변수에서 `--emperor /etc/uwsgi/sites` 옵션을 두는 것이 핵심이다.

```shell
$ sudo systemctl daemon-reload
$ sudo systemctl start uwsgi
$ sudo systemctl enable uwsgi
```

```shell
$ sudo systemctl status uwsgi
```

만약 구동 실패시 에러 로그는 `/var/log/syslog`에서 확인할 수 있다.

파이썬 소스 코드 수정하면 uWSGI를 재기동해야 한다.

```shell
$ sudo systemctl restart uwsgi
```



## [No module named 'encodings' error while starting uwsgi](https://stackoverflow.com/questions/48356435/no-module-named-encodings-error-while-starting-uwsgi)

> 이부분이 가장 많이 고생한 부분인 것 같다.

virtualenv 의 python 버전과 django의 python 버전 차이로 발생하는 문제이다. 

1) 

```shell
$ python --version
```

2)


```python
$ cd env/bin
$ ls
```

했을 때의  python 버전이 일치해야 한다. 

`virtualenv`는 기본적으로 python2를 설치함으로 만약 python3을 설치하고자 한다면

```shell
$ virtualenv -p python3 test
```

다음과 같은 방법으로 설치하면 된다.

## 추가 부분

nginx위에 react로 build한 파일을 업로드 했을 시 route 404 error를 직면하기 쉽습니다. /로 들어가서 navigation으로 uri를 찾아 들어가는건 되지만 그 곳에서 f5를 누르면 404에러가 뜨는데, 이를 해결하기 위해서는 다음과 같이 바꾸어주면 됩니다.

```ini

        location / {
                # as directory, then fall back to displaying a 404.
        		# try_files $uri $uri/ =404;
                try_files $uri $uri/ /index.html;
        }
```



### reference

* [[Django]uWSGI (우분투 + 장고 + nginx)](https://brownbears.tistory.com/16)
* [03) NGINX 및 uWSGI 연동](https://wikidocs.net/7387)
* [uwsgi의 역활은?](https://medium.com/@devdotlog/uwsgi%EC%9D%98-%EC%97%AD%ED%99%9C%EC%9D%80-c0ffe2920391)