**ElasticSearch + Dgraph Setup**

The goal of this repo is to create a simple express server endpoint to handle write to Elastic and Dgraph.

The endpoint takes a graphQL mutation and writes to both Elastic and Dgraph

**Setup (4 steps)**

**Step 1: Run Dgraph in Docker
**
docker run --rm -it -p 8080:8080 -p 9080:9080 -p 8000:8000 dgraph/standalone:v21.03.0

**Step 2: Run Elastic in Docker
**
docker run -p 9200:9200 -p 9300:9300 -e "discovery.type=single-node" docker.elastic.co/elasticsearch/elasticsearch:7.15.0

**Step 3: Provide Schema to Dgraph
**
curl -Ss --data-binary '@schema.graphql' http://localhost:8080/admin/schema

**Step 4: Run Node Express Server.** this handles an /addPost endpoint to receive mutations

node server/app.js



----------
Run mutations on http://localhost:4000/addPost

curl -X POST -H "Content-Type: application/json" -d '{"query": "mutation { newPost(title: \"Sample Title2\", text: \"Sample Text2\") { id title text } }"}' http://localhost:4000/addPost


Validate data on Elastic by going to http://localhost:9200/posts/_search/
