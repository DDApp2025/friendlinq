/**
 * Created by Anurag on 17/12/2020.
 */

 const Mongoose = require('mongoose');
 const AutoIncrement = require('mongoose-sequence')(Mongoose);
 const Config = require('../Config');
 const Schema = Mongoose.Schema;
 
 
 const Portfolio = new Schema({
     userId: {type: Schema.ObjectId, ref: 'customers', required: true},
     imageURL: {type: String, default: null},   
     thumbnailURL: {type: String, default: null},   
     fileType: {type: Number, default: 1}, //1= image, 2=video   
     createdAt: {type: Date, default: Date.now,required: true},
     updatedAt: {type: Date, default: Date.now,required: true},    
 })
 
 Portfolio.plugin(AutoIncrement, {inc_field: 'portfolioId'});
 module.exports = Mongoose.model('portfolio', Portfolio);