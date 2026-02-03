/**
 * Created by Anurag on 15/04/19.
 */

const Mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(Mongoose);
const Config = require('../Config');
const Schema = Mongoose.Schema;
const APP_CONSTANTS = Config.APP_CONSTANTS;

const Admin = new Schema({
  name: {type: String, lowercase: true,trim: true},
  email: {type: String,unique : true,trim: true,index: true, required: true,sparse: true},
  password: {type: String, trim: true},
  accessToken: {type: String, trim: true, index: true, unique: true, sparse: true},
  isDeleted: {type: Boolean, default: false},
  isBlocked: {type: Boolean, default: false},
  createdAt: {type: Date, default: Date.now,required: true},
  updatedAt: {type: Date, default: Date.now,required: true},
  passwordResetToken: {type: String, trim: true,index: true, sparse: true},

});
Admin.plugin(AutoIncrement, {inc_field: 'adminAutoIncrementId'});
module.exports = Mongoose.model('adminUser', Admin);