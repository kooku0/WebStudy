

# ElasticSearch and Python

> 이 문서는 python으로 Elasticsearch를 사용하는 명령어를 소개하며, 모든 내용은 [Elasticsearch의 공식문서](https://elasticsearch-py.readthedocs.io/en/master/api.html)를 참조하였다. 



<img src='./img/logo.png' />

## Overview

프로젝트를 진행하면서 DB는 ElasticSearch, Server는 Django를 사용하게 되었다. 회원관리는 보안성을 향상시키기 위하여 Django에서 제공해주는 라이브러리를 사용하였지만, 그 외의 정보는 모두 ElasticSearch에 넣었다. Elastic의 장점은 **Scalable**과 **Fast**라고 사람들이 말하던데 Cluster는 안써봐서 모르겠지만 확실히 삽입과 탐색을 빨랐다. 



## Python ES API 설치

`import elasticsearch`를 입력했는데, 아래와 같이 모듈을 찾지 못하는 경우 우선 Python ES API를 먼저 설치해야 한다.

```shell
>>> import elasticsearch
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
ImportError: No module named elasticsearch
```

Python ES API는 `pip`를 이용하면 쉽게 설치할 수 있다.

```shell
$ pip install elasticsearch
```

`pip`가 설치되지 않은 경우는 각자 사용 중인 패키지 매니저를 이용하여 설치할 수 있다. 예를 들어 yum을 사용 중이라면

```shell
$ yum install python-pip
```

을 이용면 되고, 혹은 easy_install을 이용하여

```shell
$ easy_install pip
```

혹은 Mac 사용자라면 brew로 python을 설치해도 된다.

```shell
$ brew install python
```

----



## 0 import

```python
import elasticsearch

es = elasticsearch.Elasticsearch("localhost:9200")
```

----



## 1 create

#### 비어있는 index 생성하기

ignore=400은 `index`를 생성할때의 IndexAlreadyExistsException를 무시하게 한다.

```python
result = es.indices.create(index='test01', ignore=400)

# {'acknowledged': True, 'shards_acknowledged': True, 'index': 'test01'}
```

#### index내의 id와 body 생성하기

```python
result = es.create(index='test01', doc_type='text', id=2, body={'todo':'wakeup'})
```

------



## 2 delete

#### index 삭제하기

```python
result = es.indices.delete(index='test01', ignore=[400, 404])
```

#### index내의 id 삭제하기

```python
result = es.delete(index'test01', doc_type='text', id = 1)
```

-----



## 3 exist

#### index 존재여부

```python
result = es.indices.exist(index='test01')
# TRUE or FALSE
```

#### id문서 존재여부

```python
result = es.exist(index='test01', doc_type='text', id=1 )
# TRUE or FALSE
```

------



## 4 info

elastic 설정 정보

```python
result = es.info()

#{'name': 'MINGYU', 'cluster_name': 'elasticsearch', 'cluster_uuid': 'VYTR1JGrSR2Eth2Et                                                                            ild_hsay7RDjA', 'version': {'number': '7.0.0-alpha2', 'build_flavor': 'default', 'b8Z',uil                                                                            y_ved_type': 'zip', 'build_hash': 'a30e8c2', 'build_date': '2018-12-17T12:33:32.311e':
{'name': 'MINGYU', 'cluster_name': 'elasticsearch', 'cluster_uuid': 'VYTR1JGrSR2', 'build_snapshot': False, 'lucene_version': '8.0.0', 'minimum_wire_compatibiEthsay7RDjA', 'version': {'number': '7.0.0-alpha2', 'build_flavor': 'default','_version': '6.6.0', 'minimum_index_compatibility_version': '6.0.0-beta1'}, 'tabuild_type': 'zip', 'build_hash': 'a30e8c2', 'build_date': '2018-12-17T12:33:32
{'name': 'MINGYU', 'cluster_name': 'elasticsearch', 'cluster_uuid': 'VYTR1JGrSR2Ethsay7RDjA', 'version': {'number': '7.0.0-alpha2', 'build_flavor': 'default', 'build_type': 'zip', 'build_hash': 'a30e8c2', 'build_date': '2018-12-17T12:33:32.311168Z', 'build_snapshot': False, 'lucene_version': '8.0.0', 'minimum_wire_compatibility_version': '6.6.0', 'minimum_index_compatibility_version': '6.0.0-beta1'}, 'tagline': 'You Know, for Search'}
```

----



## 5 get_alias

#### 생성된 모든 index 출력하기

```python
result = es.idices.get_alias().keys()

# dict_keys(['.kibana_1', 'test02', 'test03', '.tasks', 'test01', '.kibana_2'])
```

----



## 6 get

#### index 모두 출력

```python
result = es.indices.get(index = 'test01')

# {'test01': {'aliases': {}, 'mappings': {'text': {'properties': {'id1': {'type': 'text', 'fields': {'keyword': {'type': 'keyword',
'ignore_above': 256}}}, 'id2': {'type': 'text', 'fields': {'keyword': {'type': 'keyword', 'ignore_above': 256}}}, 'todo': {'type': 'text', 'fields': {'keyword': {'type': 'keyword', 'ignore_above': 256}}}}}}, 'settings': {'index': {'creation_date': '1547789005486', 'number_of_shards': '1', 'number_of_replicas': '1', 'uuid':
'jYYCGvsYTZeFFm0K__vfZw', 'version': {'created': '7000099'}, 'provided_name': 'test01'}}}}
```

#### id 출력

```python
result = es.get(index='test01', doc_type='text', id=1)

# {'_index': 'test01', '_type': 'text', '_id': '1', '_version': 4,
'found': True, '_source': {'id2': '222'}}
```

----



## 7 search

> search는 워낙 많이 쓰이고 세부 설명도 많아 내가 가장 많이 사용하는 부분만 정리하였다.

#### index내의 모든 id와 type 출력

filter를 사용하여 원하는 내용을 출력할 수 있다.

```python
result = es.search(index='test01', filter_path=['hits.hits._id', 'hits.hits._type'])

# {'hits': {'hits': [{'_type': 'text', '_id': '1'}, {'_type': 'text', '_id': '2'}]}}
```

#### index내의 모든 정보 출력

```python
result = es.search(index='test01', filter_path=['hits.hits._*'])

# {'hits': {'hits': [{'_index': 'test01', '_type': 'text', '_id': '1', '_score': 1.0, '_source': {'id2': '222'}}, {'_index': 'test01', '_type': 'text', '_id': '2', '_score': 1.0, '_source': {'todo': 'wakeup'}}]}}
```



### reference

* [API Documentation](https://elasticsearch-py.readthedocs.io/en/master/api.html)
* [Elasticsearch와 Python 연동](http://jason-heo.github.io/elasticsearch/2016/07/16/elasticsearch-with-python.html)