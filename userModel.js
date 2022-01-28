const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let userSchema = Schema({
	username: {
		type: String, 
		required: true
	},
	password: {
		type: String, 
		required: true
	},
	cards: [],
	friends: [],
	requests: [],
	trades: []
});

module.exports = mongoose.model("User", userSchema);