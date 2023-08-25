import express from "express";
import bodyParser from "body-parser";
import mysql from "mysql";
import cors from "cors";
import multer from "multer";
import fs from "fs";

const app = express();
const port = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// Multer

// const storage = multer.memoryStorage();
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads");
  },

  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage: storage });

// Cors

app.use(cors());

// MySQL

const connection = mysql.createConnection({
  host: "localhost",
  port: "3306",
  user: "root",
  password: "password",
  database: "react_sql",
});

connection.connect((err) => {
  console.log("Here");
  console.log(err);
  if (err) {
    return err;
  }
  console.log("Connected to MySQL");
});

// MYSql Database model

app.get("/createdb", (req, res) => {
  let sql = "CREATE DATABASE react_sql";
  connection.query(sql, (err, result) => {
    if (err) throw err;
    console.log(result);
    res.send("Database created...");
  });
});

// MYSql Table model

app.get("/createfilestable", (req, res) => {
  // (id INT(4) NOT NULL AUTO_INCREMENT PRIMARY KEY, description CHAR(50), data LONGBLOB, filename CHAR(50), filesize CHAR(50), filetype CHAR(50) )
  let sql =
    "CREATE TABLE files(id INT(4) NOT NULL AUTO_INCREMENT PRIMARY KEY, description CHAR(50), data LONGBLOB, filename CHAR(50), filesize CHAR(50), filetype CHAR(50) )";
  connection.query(sql, (err, result) => {
    if (err) throw err;
    console.log(result);

    res.send("Files table created...");
  });
});

// MYSql to store file in database

app.post("/api/upload", upload.single("file"), (req, res) => {
  const file = req.file;
  const description = req.body.description;
  const filename = file.filename;
  const filesize = file.size;
  const filetype = file.mimetype;
  const data = file.path;
  const sql =
    "INSERT INTO files (description, data, filename, filesize, filetype) VALUES (?, ?, ?, ?, ?)";

  connection.query(
    sql,
    [description, data, filename, filesize, filetype],
    (err, result) => {
      if (err) throw err;
      console.log("1 record inserted");
    }
  );
  // Delete file in server
  console.log(req.file.path);
  fs.unlinkSync(req.file.path);
  res.send("File uploaded");
});

// MYSql to get file from database

app.get("/api/getfile", (req, res) => {
  const sql = "SELECT * FROM files";
  connection.query(sql, (err, result) => {
    if (err) throw err;
    res.send(result);
  });
});

// MYSql to delete file from database

app.delete("/api/deletefile/:id", (req, res) => {
  const id = req.params.id;
  const sql = "DELETE FROM files WHERE id = ?";
  connection.query(sql, id, (err, result) => {
    if (err) throw err;
    console.log("1 record deleted");
  });
});

// MYSql to update file in database

app.put("/api/updatefile/:id", upload.single("file"), (req, res) => {
  const id = req.params.id;
  const file = req.file;
  const description = req.body.description;
  const filename = file.filename;
  const filesize = file.size;
  const filetype = file.mimetype;
  const data = file.path;
  const sql =
    "UPDATE files SET description = ?, data = ?, filename = ?, filesize = ?, filetype = ? WHERE id = ?";

  connection.query(
    sql,
    [description, data, filename, filesize, filetype, id],
    (err, result) => {
      if (err) throw err;
      console.log("1 record updated");
    }
  );
  res.send("File updated");
});

app.listen(port, () => console.log(`Listening on port ${port}`));
