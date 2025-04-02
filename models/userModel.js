const mongoose = require('mongoose');

mongoose.connect("mongodb://127.0.0.1:27017/women_techies");

const userSchema = mongoose.Schema({
  name: String,
  username: {type: String},
  email: {type: String},
  password: {type: String},
  createdAt: {type: Date, default: Date.now},
  userReports: [{
    type: mongoose.Schema.Types.ObjectId, ref: "Report"
  }]
  //phoneNumbers: Array[5],
})

module.exports = mongoose.model("User", userSchema);