# Django REST framework

> Django에는 REST API를 만들 수 있는 `Django REST framework` 가 존재한다. Django REST framework Quickstart를 참고하여 tutorial을 진행한다. 

## 프로젝트 설정

*django-rest-tutorial* 이라는 Root 디렉토리를 생성한다.

```shell
$ mkdir django-rest-tutorial
$ cd django-rest-tutorial
```

python 3.5.2 버전으로 가상환경을 구축한다.

```shell
$ pyenv virtualenv django-rest-tutorial
$ pyenv activate django-rest-tutorial
```

`django` 와 `djangorestframework`를 pip로 설치한다.

```shell
$ pip install django
$ pip install djangorestframework
```

`tutorial`라는 이름의 Django project를 생성하고, `myapp`이라는 이름의 앱을 생성한다.
프로젝트와 앱을 생성하는 방식이 `Django REST framework Quickstart` 과는 다르다. `Django docs`의 [Django tutorial 01](https://docs.djangoproject.com/en/1.10/intro/tutorial01/)에서 사용하는 방식을 이용했다.

```
$ django-admin.py startproject tutorial
$ cd tutorial
$ python manage.py startapp myapp
```

Root 디렉토리의 프로젝트 구조를 보면 아래와 같다.

```
$ tree ../../django-rest-tutorial/
django-rest-tutorial/
└── tutorial
    ├── manage.py
    ├── myapp
    │   ├── __init__.py
    │   ├── admin.py
    │   ├── apps.py
    │   ├── migrations
    │   │   └── __init__.py
    │   ├── models.py
    │   ├── tests.py
    │   └── views.py
    └── tutorial
        ├── __init__.py
        ├── settings.py
        ├── urls.py
        └── wsgi.py
```



## Settings

`Django REST framework`을 사용하기 위해서는 `'rest_framework'`를 INSTALL_APPS에 추가해줘야 한다.
pagination의 크기를 지정할 수 있고, API의 접근 권한을 지정할 수도 있다. 아래의 주석 처리된 부분을 사용하면 admin 사용자일 때만 접근이 가능하다.

```python
# tutorial/settings.py

INSTALLED_APPS = [
    ...
    'rest_framework',
    'myapp'
]

REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        # 'rest_framework.permissions.IsAdminUser',
    ],
    'PAGE_SIZE': 10
}
```

## Models

`first_name` 과 `last_name` 필드를 가진 `Person`이라는 간단한 model을 정의하였다.

```python
# myapp/models.py

from django.db import models

class Person(models.Model):
    first_name = models.CharField(max_length=30)
    last_name = models.CharField(max_length=30)
```

## Serializers

serializer란 models 객체와 querysets 같은 복잡한 데이터를 JSON, XML과 같은 native 데이터로 바꿔주는 역할을 한다. 아래에서는 `HyperlinkedModelSerializer`라는 serializer를 사용한다.

```python
# myapp/serializers.py

from myapp.models import Person
from rest_framework import serializers

class PersonSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Person
        fields = ('first_name', 'last_name')
```

## Views

여러 개의 view를 작성하지 않고, 공통적인 행위들을 ViewSet에 하나로 그룹화하여 간결하게 사용할 수 있다.

```python
# myapp/views.py

from rest_framework import viewsets
from serializers import PersonSerializer
from myapp.models import Person


class PersonViewSet(viewsets.ModelViewSet):
    queryset = Person.objects.all()
    serializer_class = PersonSerializer
```

## URLs

views에서 작성한 ViewSet을 Router에 연결하면 url을 자동으로 맵핑해주기 때문에 편리하게 이용할 수 있다.

```python
# tutorial/urls.py

from django.conf.urls import url, include
from rest_framework import routers
from myapp import views


router = routers.DefaultRouter()
router.register(r'persons', views.PersonViewSet)

urlpatterns = [
    url(r'^', include(router.urls)),
    url(r'^api-auth/', include('rest_framework.urls', namespace='rest_framework'))
]
```

## Run

```
$ python manage.py makemigrations
$ python manage.py migrate
$ python manage.py runserver
```

우선 browser를 통해 `http://localhost:8000`에 접속해보면 `DefaultRouter`에 의해 사용할 수 있는 url `http://localhost:8000/persons` 이 표시된다.

<img src='./img/result_home.png'>















### reference

+ https://cjh5414.github.io/django-rest-framework/