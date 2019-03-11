# Python & Elasticsearch

```python
import elasticsearch

es = elasticsearch.Elasticsearch("localhost:9200")


## ignore 400 cause by IndexAlreadyExistsException when creating an index
result = es.indices.create(index='test-index', ignore=400)

## ignore 404 and 400
result = es.indices.delete(index='test-index', ignore=[400, 404])

## 모든 index 출력하기
result = es.indices.get_alias().keys()

## id 문서 조회
result = es.indices.get(index = 'test01')

## id 문서 존재여부
result = es.exist(index = 'test01', doc_type = 'text', id = 1)

## elastic 설정 정보
result = es.info()

## id와 type 출력
result = es.search(index='test01', filter_path=['hits.hits._id', 'hits.hits._type'])

## index에 관련정보 모두 출력
result = es.search(index='test01', filter_path=['hits.hits._*'])

result = es.indices.exists(index='test03')


print(result)
```

