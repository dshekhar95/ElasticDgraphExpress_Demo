const express = require('express');
const bodyParser = require('body-parser');
const { Client } = require('@elastic/elasticsearch');
const dgraph = require('dgraph-js');
const  grpc  = require('@grpc/grpc-js');

const app = express();
app.use(bodyParser.json());

// Initialize Elasticsearch client
const esClient = new Client({ node: 'http://localhost:9200' });

// Initialize Dgraph client
const dgraphClientStub = new dgraph.DgraphClientStub(
  "localhost:9080", 
  grpc.credentials.createInsecure()
);
const dgraphClient = new dgraph.DgraphClient(dgraphClientStub);

app.post('/addPost', async (req, res) => {
  console.log(req.body);
  const query = req.body.query;
  const titleMatch = query.match(/title:\s*"([^"]+)"/);
  const textMatch = query.match(/text:\s*"([^"]+)"/);
  const title = titleMatch ? titleMatch[1] : '';
  const text = textMatch ? textMatch[1] : '';
  console.log("***********");
  console.log(title);
  console.log(text);
  console.log("***********");

  // Write to Elasticsearch
  try {
    const esResponse = await esClient.index({
      index: 'posts',
      body: { title, text }
    })
    console.log("*****ES RESPONSE******");
    console.log(esResponse);
  } catch (error) {
    console.error('Error writing to Elasticsearch:', error);
    return res.status(500).json({ error: 'Error writing to Elasticsearch' });
  }
  
  // Write to Dgraph
  try {
    const mutation = new dgraph.Mutation();
    
    mutation.setSetJson({
        uid: "_:blank-0",
        title: title,
        text: text,
      });
    const txn = dgraphClient.newTxn();  
    const dgraphResponse = await txn.mutate(mutation);
    await txn.commit();
    console.log("*****Dgraph RESPONSE******");

    console.log(dgraphResponse);
    const query = `query {
        posts(func: has(title)) {
          uid
          title
          text
        }
      }`;
      const queryResponse = await dgraphClient.newTxn().query(query);
      console.log("*****Dgraph Query RESPONSE******");
      console.log(queryResponse.getJson());
  } catch (error) {
    console.error('Error writing to Dgraph:', error);
    return res.status(500).json({ error: 'Error writing to Dgraph' });
  }
  
  res.status(200).json({ message: 'Success' });
});


app.get('/', (req, res) => {
    res.send('Hello, this is the root URL');
  });
app.listen(4000, () => console.log('Server is running on port 4000'));
