// import all libs
const express = require("express");
const app = express();
const cors = require("cors");
const multer = require("multer");
const upload = multer({ dest: "upload/" });
const fs = require("fs");
const csv = require("fast-csv");
const { MongoClient, ServerApiVersion } = require("mongodb");
const port = 3000;

// to prevent cors errors
app.use(cors());

// url to connect to mongodb
const uri =
  "mongodb+srv://root:root@band.vjeaa.mongodb.net/companies?retryWrites=true&w=majority";

// home get response
app.get("/", (req, res) => {
  res.send("Hello World");
});

// api endpoint to upload the companies from csv
app.post("/upload", upload.single("companies"), async (req, res) => {
  let companies = [];

  // read the csv uploaded by user
  fs.createReadStream(req.file.path)
    .pipe(csv.parse({ headers: true }))
    .on("error", (error) => console.error(error))
    .on("data", async (row) => {
      // create a document to insert into the collection
      companies.push({
        company: row.Company,
        ticker: row.Ticker,
      });
    })
    // insert the docs when csv read is completed
    .on("end", (rowCount) => {
      // connect with the mongodb collection
      const client = new MongoClient(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverApi: ServerApiVersion.v1,
      });
      client.connect(async (err) => {
        const collection = client.db("companies").collection("companies");
        console.log(">>> Connected*");

        // await collection.insertMany(companies, { ordered: true });
        console.log(">>> Data inserted!!");
        client.close();
      });
    });

  res.end("Success");
});

app.listen(port, () => {
  console.log(`app listening at http://localhost:${port}`);
});
