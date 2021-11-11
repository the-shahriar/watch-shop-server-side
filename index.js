const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config()
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;

// initialize
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ra2hb.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function run() {
    try{

        await client.connect();
        const database = client.db("WatchShop");
        const productsCollection = database.collection("products");
        const reviewsCollection = database.collection('reviews');
        const usersCollection = database.collection('users');
        const ordersCollection = database.collection("orders");

        // getting all the products
        app.get('/products', async(req, res)=> {
            const cursor = productsCollection.find({})
            const result = await cursor.toArray();
            res.send(result);
        })

        app.get('/products/:id', async(req, res)=> {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await productsCollection.findOne(query);
            res.json(result);

        })

        // getting all the reviews
        app.get('/reviews', async(req, res)=> {
            const cursor = reviewsCollection.find({});
            const result = await cursor.toArray();
            res.send(result);
        })

        // add user to database
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.json(result);
        });

        // save orders to database
        app.post('/orders', async(req, res)=> {
            const order = req.body;
            const result = await ordersCollection.insertOne(order);
            res.json(result);
        })

    } finally{
        // await client.close();
    }
}

run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Website is running');
  })
  
  app.listen(port, () => {
    console.log(`Website is listening at http://localhost:${port}`);
  })
