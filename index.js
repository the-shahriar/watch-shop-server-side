const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config()
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;

// initialize port
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ra2hb.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function run() {
    try {

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

        // delete products from database
        app.delete('/products/:id', async(req, res)=> {
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const result = await productsCollection.deleteOne(query);
            res.json(result);
        })

        // getting all the reviews
        app.get('/reviews', async(req, res)=> {
            const cursor = reviewsCollection.find({});
            const result = await cursor.toArray();
            res.send(result);
        })

        // Insert reviews from client side
        app.put('/reviews', async (req, res) => {
            const review = req.body;
            const filter = { email: review.email };
            const options = { upsert: true };
            const updateDoc = { $set: review };
            const result = await reviewsCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        });

        // add user to database
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.json(result);
        });

        app.put('/users', async(req, res)=> {
            const user = req.body;
            const query = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await usersCollection.updateOne(query, updateDoc, options);
            res.json(result);
        })

        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        })

        // make admin api
        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.json(result);
        })

        // save orders to database
        app.post('/orders', async(req, res)=> {
            const order = req.body;
            const result = await ordersCollection.insertOne(order);
            res.json(result);
        })

        // delete order from database
        app.delete('/orders/:id', async(req, res)=> {
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const result = await ordersCollection.deleteOne(query);
            res.json(result);
        })

        // get orders for specifiq users
        app.get('/orders/:email', async(req, res)=> {
            const email = req.params.email;
            const query = { email: email };
            const cursor = ordersCollection.find(query);
            const result = await cursor.toArray();
            res.json(result);
        })

        // get all orders
        app.get('/orders', async(req, res)=> {
            const cursor = ordersCollection.find({});
            const result = await cursor.toArray();
            res.send(result);
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
