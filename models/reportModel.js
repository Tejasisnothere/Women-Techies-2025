const mongoose = require('mongoose');

const reportSchema = mongoose.Schema({
  address: String,
  createdOn: {type: Date, default: Date.now},
  theme: String,
  description: String,
  severity: String,
  userid: {type: mongoose.Schema.Types.ObjectId, ref: "User"},
  helpful: {type: Number, default: 0}
})

module.exports = mongoose.model("Report", reportSchema);