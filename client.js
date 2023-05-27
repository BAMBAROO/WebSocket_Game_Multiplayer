const express = require("express");
const app = express();

app.use(express.static("public"));

app.get("/", (req, res) => {
  console.log(__dirname)
  res.sendFile(__dirname + "/src/index.html");
});

app.listen(8001, () => {
  console.log("client is running");
});