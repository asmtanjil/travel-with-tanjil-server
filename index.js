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

    //Get Service Data From DataBase
    app.get('/homeServices', async (req, res) => {
      const query = {}
      const cursor = serviceCollection.find(query);
      const services = await cursor.limit(3).toArray()
      res.send(services);
    })

    //Get Service Data From DataBase
    app.get('/services', async (req, res) => {
      const query = {}
      const cursor = serviceCollection.find(query);
      const services = await cursor.toArray()
      res.send(services);
    })



  }
  finally {

  }

}

run().catch(err => console.error(err))

app.get('/', (req, res) => {
  res.send('Altitude Trekker server is running')
})

app.listen(port, () => {
  console.log(`Altitude Trekker server is running on: ${port}`)
})