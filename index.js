const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken')
require('dotenv').config();
const app = express()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;

// Middle Wares
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.aes3u62.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


//Function For JWT
function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).send({ message: 'unauthorized access' })
  }

  const token = authHeader.split(' ')[1];

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: 'unauthorized access' })
    }
    req.decoded = decoded;
    next();
  })
}

async function run() {
  try {
    //Collections
    const serviceCollection = client.db('travelWithTanjil').collection('services')
    const reviewCollection = client.db('travelWithTanjil').collection('reviews')


    //JWT Token API
    app.post('/jwt', (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '7d' })
      res.send({ token })
    })


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


    //Post Clients Service Data From Client to Database
    app.post('/services', async (req, res) => {
      const service = req.body;
      const result = await serviceCollection.insertOne(service)
      res.send(result)
    })


    //Post Review Data to Database
    app.post('/reviews', async (req, res) => {
      const review = req.body;
      const result = await reviewCollection.insertOne(review)
      res.send(result)
    })


    //Get reviews data from database and send to client site
    app.get('/reviews', verifyJWT, async (req, res) => {
      const decoded = req.decoded

      if (decoded.email !== req.query.email) {
        res.status(403).send({ message: 'Forbidden Access' })
      }

      let query = {}
      if (req.query.email) {
        query = {
          email: req.query.email
        }
      }
      const cursor = reviewCollection.find(query).sort({ insertionTime: -1 });
      const reviews = await cursor.toArray()
      res.send(reviews)
    })

    //Get Specific Reviews Data from database and send to client site
    app.get('/reviews/:id', async (req, res) => {
      const id = req.params.id;
      const query = { service: id }
      const cursor = reviewCollection.find(query)
      const result = await cursor.toArray()
      res.send(result)
    })

    //Delete A Review From UI
    app.delete('/reviews/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) }
      const result = await reviewCollection.deleteOne(query);
      res.send(result)
    })

    //Update Review in UI after deleting One
    app.patch('/reviews/:id', async (req, res) => {
      const id = req.params.id;
      // console.log(id)
      const query = { _id: ObjectId(id) }
      const result = await reviewCollection.updateOne(query, {
        $set: req.body
      })
      if (result.matchedCount) {
        res.send(result)
      }
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