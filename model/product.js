var mongoose = require('mongoose');
var Schema = mongoose.Schema;

productSchema = new Schema( {
	user_id: Schema.ObjectId,
	cart:Array,
	order_Succes:Array,
	order_history:Array
}),
product = mongoose.model('product', productSchema);

module.exports = product;