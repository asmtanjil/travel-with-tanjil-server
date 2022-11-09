const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;

// Middle Wares
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.aes3u62.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
  try {
    //Collections
    const serviceCollection = client.db('travelWithTanjil').collection('services')

    const reviewCollection = client.db('travelWithTanjil').collection('reviews')

    //Get 3 Service Data From DataBase
    app.get('/homeServices', async (req, res) => {
      const query = {}
      const cursor = serviceCollection.find(query);
      const services = await cursor.limit(3).toArray()
      res.send(services);
    })

    //Get All Service Data From DataBase
    app.get('/services', async (req, res) => {
      const query = {}
      const cursor = serviceCollection.find(query);
      const services = await cursor.toArray()
      res.send(services);
    })

    //Get Specific Service Data By Id from DataBase
    app.get('/services/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: ObjectId(id) }
      const service = await serviceCollection.findOne(query)
      res.send(service)
    })

    //Post Review Data to Database
    app.post('/reviews', async (req, res) => {
      const review = req.body;
      const result = await reviewCollection.insertOne(review)
      res.send(result)
    })

    //Get Specific Reviews Data from database and send to client site
    app.get('/reviews/:id', async (req, res) => {
      const id = req.params.id;
      const query = { serviceId: id }
      const result = await reviewCollection.findOne(query)
      res.send(result)
    })

    //Get reviews data from database and send to client site
    app.get('/reviews', async (req, res) => {
      const query = {}
      const cursor = reviewCollection.find(query)
      const reviews = await cursor.toArray()
      res.send(reviews)
    })

    //Post Clients Service Data From Client to Database
    app.post('/services', async (req, res) => {
      const service = req.body;
      const result = await serviceCollection.insertOne(service)
      res.send(result)
    })

  }
  finally {

  }

}

run().catch(err => console.error(err))

app.get('/', (req, res) => {
  res.send('Travel With Tanjil server is running')
})

app.listen(port, () => {
  console.log(`Travel With Tanjil server is running on: ${port}`)
})