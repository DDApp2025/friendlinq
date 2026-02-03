const Mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(Mongoose);
const Config = require('../Config');
const Schema = Mongoose.Schema;

const Category = new Schema({
	categoryName: {type: String, lowercase: true,trim: true},
	subCategory : [{type: Schema.ObjectId, ref: 'subcategory'}],
	categoryNumber: {type: Number, unique: true, sparse: true},
	isDeleted: {type: Boolean, default: false},
	imageURL: {
		original: {type: String, default: null},
		thumbnail: {type: String, default: null}
	},
	createdAt: {type: Date, default: Date.now,required: true},
	updatedAt: {type: Date, default: Date.now,required: true},

	Isdefault:{type: Boolean, default: false}, //admin create Category

});
Category.plugin(AutoIncrement, {inc_field: 'categoryNumber'});
Category.index({categoryName: 1}, {unique: true});
module.exports = Mongoose.model('category', Category);