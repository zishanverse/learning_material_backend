require("dotenv").config();
const port = process.env.PORT;
const cors = require("cors");
const mysql = require('mysql2');
const { S3Client, GetObjectCommand, PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const {getSignedUrl} = require("@aws-sdk/s3-request-presigner");
const express = require("express");
const {format} = require('date-fns');
const { MongoClient } = require('mongodb');
const uri = process.env.MONGODB;


const app = express();
app.use(express.json());


app.use(
    cors({  
        "origin": "*",
  "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
  "preflightContinue": false,
  "optionsSuccessStatus": 204
    })
);
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
  });





//database connection
const dbClient =  new MongoClient(uri);
async function connect() {
    try {
      // Connect to the MongoDB cluster
      await dbClient.connect();
      console.log('Connected to the MongoDB cluster');
    } catch (error) {
      console.error('Error connecting to the MongoDB cluster', error);
    }
  }
  connect().then(() => {
    app.listen(port, () => {
        console.log(`server is running on PORT ${port}`);
    });
});

const db = dbClient.db('learning-platform');





//aws s3 connetion
const client = new S3Client({ region: process.env.AWS_REGION, credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
} });

async function getObjectUrl(key){ 
    const command = new GetObjectCommand({
        Bucket: `${process.env.AWS_S3_BUCKET_NAME}`,
        Key: `teacher/upload/${key}`
    });
    const url = await getSignedUrl(client, command);
    return url;

}

async function putObjectUrl(filename, contentType) {
    const command = new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: `teacher/upload/${filename}`,
        ContentType: contentType,
    });
    const url = await getSignedUrl(client,command);
    return url;
}

async function deleteObject(filename) {
    const command = new DeleteObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: `teacher/upload/${filename.concat(".pdf")}`
    });
    const url = await client.send(command);
    return url;
}






// Apis 
app.get("/getting/pdf/", async (request, response) => {
    const {name} = request.query;
    if (name == undefined) {
        response.status(400);
        response.send("invalid file name");
    }
    response.send(await getObjectUrl(name));
});

app.get("/all/pdf/", async (request, response) => {
    const {sort, date} = request.query;
    const collection = db.collection('fileDetails');
    if (sort === undefined && date === undefined) {
        const result  = await collection.find().toArray();
        response.send(result);
    }
    else if (date !== "all") {
        const result  = await collection.find({created_at: {$eq: format(date, "dd-MM-yyyy")}}).toArray();
        response.send(result);
    }
    else {
            const result  = await collection.find().sort({created_at: parseInt(sort)}).toArray();
            response.send(result);

    }
});

app.post("/upload/pdf", async (request, response) => {
    const {filename, contentType, dateTime,tags, size, subject, marks, duration, description} = request.body;
    const collection = db.collection('fileDetails');
    const result = await collection.find({filename: filename.slice(0,-4)}).toArray();
    
    if (result.length !== 0)  {
        response.status(400);
        response.send("file already exist");
    }
    else if (filename == undefined) {
            response.status(400);
            response.send("invalid file name");
        }
        else if (tags.length === 0) {
            response.status(400);
            response.send("Insert tag name");
        }
        else if (size == undefined) {
            response.status(400);
            response.send("invalide size");
        }
        else if (marks == undefined) {
            response.status(400);
            response.send("invalide marks");
        }
        else if (duration == undefined) {
            response.status(400);
            response.send("invalide duration");
        }
        else if (description == undefined) {
            response.status(400);
            response.send("invalide description");
        }
        else {
            const result = await collection.insertOne({filename: filename.slice(0,-4),created_at: dateTime, tags: tags, size: size, subject: subject, marks: marks, duration:duration, description: description });
            
            response.send(await putObjectUrl(filename, contentType));
        }
    
});

app.delete("/delete", async (req, res) => {
    const {name} = req.query;
    const collection = db.collection('fileDetails');
    const result = await collection.find({filename: name}).toArray();
    if (name === undefined) {
        res.status(400);
        res.send("Invalid filename");
    }
    else if (result.length == 0) {
        res.status(400);
        res.send("File Not Exist");
    }
    else {
        await collection.deleteOne({filename: name});
        await deleteObject(name);
        res.send("Deleted Successfully");
    }


    
})

