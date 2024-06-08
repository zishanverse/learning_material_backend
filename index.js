require("dotenv").config();
const port = process.env.PORT;
const cors = require("cors");
const mysql = require('mysql2');
const { S3Client, GetObjectCommand, PutObjectCommand } = require("@aws-sdk/client-s3");
const {getSignedUrl} = require("@aws-sdk/s3-request-presigner");
const express = require("express");

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


const url = `mysql://${process.env.MYSQLUSER}:${process.env.MYSQLPASSWORD}@${process.env.MYSQLHOST}:${process.env.MYSQLPORT}/${process.env.MYSQLDATABASE}`

const connection = mysql.createConnection(url);

  // Connect to MySQL
connection.connect((err) => {
    if (err) {
      console.error('Error connecting to MySQL: ' + err.stack);
      return;
    }
    console.log('Connected to MySQL as id ' + connection.threadId);
    app.listen(port, () => {
        console.log("server is running... :)");
      });
    
});


const client = new S3Client({ region: "ap-south-1", credentials: {
    accessKeyId: process.env.ACCESSID,
    secretAccessKey: process.env.SECRETKEY
} });

async function getObjectUrl(key){ 
    const command = new GetObjectCommand({
        Bucket: "leaning-pdf",
        Key: `teacher/upload/${key}`
    });
    const url = await getSignedUrl(client, command);
    return url;

}

async function putObjectUrl(filename, contentType) {
    const command = new PutObjectCommand({
        Bucket: "leaning-pdf",
        Key: `teacher/upload/${filename}`,
        ContentType: contentType,
    });
    const url = await getSignedUrl(client,command);
    return url;
}

app.put("/getting/pdf/", async (request, response) => {
    const {name} = request.body;
    if (name == undefined) {
        response.status(400);
        response.send("invalid file name");
    }
    response.send(await getObjectUrl(name));
});

app.put("/all/pdf/", async (request, response) => {
    const {sort} = request.body;
    const checkUserQuery = `SELECT * FROM fileDetails ORDER BY created_at ${sort == undefined ? "ASC" : sort};`;
    connection.query(checkUserQuery, async(err, result) => {
        if (err) throw err;
        else {
            response.send(result);
        }
    });
});

app.put("/upload/pdf", async (request, response) => {
    const {filename, contentType, dateTime} = request.body;
    const checkUserQuery = `SELECT * FROM fileDetails WHERE filename = '${filename.slice(0,-4)}';`;
    connection.query(checkUserQuery, async(err, result) => {
        if (err) throw err;
        else {
            if (result.length !== 0) {
                response.status(400);
                response.send("file already exist");
            }
            else if (filename == undefined) {
                response.status(400);
                response.send("invalid file name");
            }
            else {
                const query = `
                            INSERT INTO fileDetails (filename, created_at)
                            VALUES (
                                '${filename.slice(0,-4)}',
                                '${dateTime}'
                            );`;
                        connection.query(query, async(err, result) => {
                            if (err) throw err;
                            response.send(await putObjectUrl(filename, contentType));
                        });
            }
        }
    });
});