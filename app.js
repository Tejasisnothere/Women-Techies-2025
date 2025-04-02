const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');
const mongoose = require('mongoose');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, "public")));
app.set('view engine', 'ejs');

app.get('/', (req, res)=>{
  res.render("index");
});

app.listen(3000, (err)=>{
  console.log("Server started....");
})
