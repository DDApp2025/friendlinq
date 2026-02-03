 const Mongoose = require('mongoose');
 const AutoIncrement = require('mongoose-sequence')(Mongoose);
 const Config = require('../Config');
 const Schema = Mongoose.Schema;
 const APP_CONSTANTS = Config.APP_CONSTANTS;
 const POST_STATUS      =  APP_CONSTANTS.POST_STATUS;
 
 
 const Tag = new Schema({
     postId :{type: Schema.ObjectId, ref: 'post'},     
     tagAuthor :{type: Schema.ObjectId, ref: 'customer'},    
     createdAt: {type: Date, default: Date.now,required: true},
     updatedAt: {type: Date, default: Date.now,required: true},
 })
 
 Tag.plugin(AutoIncrement, {inc_field: 'tagAutoIncrementId'});
 module.exports = Mongoose.model('postTag', Tag);