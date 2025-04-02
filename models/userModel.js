const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  name: String,
  email: {type: String, unique: true},
  createdAt: {type: Date, default: Date.now},
})

module.exports = mongoose.model("User", userSchema);