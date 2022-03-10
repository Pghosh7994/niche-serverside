const express = require("express");
const { MongoClient } = require("mongodb");
const cors = require("cors");
const ObjectId = require("mongodb").ObjectId;
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.e4tmo.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  await client.connect();
  console.log('database connected');
}
run().catch(console.dir);

// app.use(bodyParser.urlencoded({ extended: true }));
app.listen(port, () => {
  console.log("Running Server on port", port);
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

client.connect((err) => {
  const servicesCollection = client.db("niche").collection("services");
  const usersCollection = client.db("niche").collection("users");
  const ordersCollection = client.db("niche").collection("orders");
  const reviewCollection = client.db("niche").collection("review");

  //add servicesCollection
  app.post("/addServices", async (req, res) => {
    console.log(req.body);
    const result = await servicesCollection.insertOne(req.body);
    res.send(result);
  });

  // get all services
  app.get("/allServices", async (req, res) => {
    const result = await servicesCollection.find({}).toArray();
    res.send(result);
  });

  // single service
  app.get("/singleService/:id", async (req, res) => {
    console.log(req.params.id);
    const result = await servicesCollection
      .find({ _id: ObjectId(req.params.id) })
      .toArray();
    res.send(result[0]);
    console.log(result);
  });

  // insert order
  app.post("/orders", async (req, res) => {
    const newOrder = req.body;
    const result = await ordersCollection.insertOne(newOrder);
    // console.log("got new user", req.body);
    console.log("added order", result);
    res.json(result);
  });

  //  my order

  app.get("/allorders/:emailOrName", async (req, res) => {
    console.log(req.params.emailOrName);
    const result = await ordersCollection
      .find({ emailOrName: req.params.emailOrName })
      .toArray();
    res.send(result);
  });

  // get all reviews
  app.get("/allReviews", async (req, res) => {
    const result = await reviewCollection.find({}).toArray();
    res.send(result);
  });
  // add new review
  app.post("/addReview", async (req, res) => {
    const result = await reviewCollection.insertOne(req.body);
    res.send(result);
  });

  app.post("/addUserInfo", async (req, res) => {
    console.log("req.body");
    const result = await usersCollection.insertOne(req.body);
    res.send(result);
    console.log(result);
  });
  //  make admin

  app.put("/makeAdmin", async (req, res) => {
    const filter = { email: req.body.email };
    const result = await usersCollection.find(filter).toArray();
    if (result) {
      const documents = await usersCollection.updateOne(filter, {
        $set: { role: "admin" },
      });
      console.log(documents);
    }
  });

  // check admin or not
  app.get("/checkAdmin/:email", async (req, res) => {
    const result = await usersCollection
      .find({ email: req.params.email })
      .toArray();
    console.log(result);
    res.send(result);
  });

  /// all order
  app.get("/allorders", async (req, res) => {
    // console.log("hello");
    const result = await ordersCollection.find({}).toArray();
    res.send(result);
  });

  app.delete("/deleteOrder/:id", async (req, res) => {
    const id = req.params.id;
    // console.log(id);
    const query = { _id: ObjectId(id) };
    const result = await ordersCollection.deleteOne(query);

    console.log("deleting user with id ", result);

    res.json(result);
  });

  //UPDATE API
  app.put("/allorders/:id", async (req, res) => {
    const id = req.params.id;
    // console.log(id);
    // const updatedUser = req.body;

    const filter = { _id: ObjectId(id) };
    const options = { upsert: true };
    const updateDoc = {
      $set: {
        status: "Approved",
      },
    };
    const result = await ordersCollection.updateOne(filter, updateDoc, options);
    console.log("updating", id);
    res.json(result);
  });
});
