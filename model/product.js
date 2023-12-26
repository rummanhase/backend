var mongoose = require('mongoose');
var Schema = mongoose.Schema;

productSchema = new Schema( {
	item_id:String,
	user_id: Schema.ObjectId,
	is_delete: { type: Boolean, default: false }
}),
product = mongoose.model('product', productSchema);

module.exports = product;