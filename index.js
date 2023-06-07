const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config()
const jwt = require('jsonwebtoken');
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());


const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hgvq2ef.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const usersCollection = client.db("summerCamp").collection("users");
    const classCollection = client.db("summerCamp").collection("classes");


    app.post('/jwt', (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })

      res.send({ token })
    })

    // user related api
    app.post('/users', async (req, res) => {
      const user = req.body;
      const query = { email: user.email }
      const existingUser = await usersCollection.findOne(query);
      // console.log(existingUser);
      if (existingUser) {
        return res.send({ message: 'User Already Exists!' })
      }
      const result = await usersCollection.insertOne(user);
      res.send(result);
    })

    // class related apis
    app.get('/class', async (req, res) => {
      const query = {};
      const options = {
        sort: { "TotalStudents": -1 },
      };
      const result = await classCollection.find(query, options).limit(6).toArray();
      res.send(result);
    })
      // all classes
    app.get('/classes', async (req, res) => {
      const result = await classCollection.find().toArray();
      res.send(result);
    })


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('camp is sitting')
})

app.listen(port, () => {
  console.log(`summer Camp is sitting on port ${port}`);
})