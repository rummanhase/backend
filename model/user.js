var mongoose = require('mongoose');
var Schema = mongoose.Schema;

userSchema = new Schema( {
	username: String,
	password: String,
	details:Object,
	cart:Array,
	order_Succes:Array,
	order_history:Array
}),
user = mongoose.model('user', userSchema);

module.exports = user;