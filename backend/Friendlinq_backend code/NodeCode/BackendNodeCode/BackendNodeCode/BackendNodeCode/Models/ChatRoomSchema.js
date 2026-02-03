/**
 * Created by Anurag on 13/04/2020.
 */

const Mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(Mongoose);
const Config = require('../Config');
const Schema = Mongoose.Schema;
const APP_CONSTANTS = Config.APP_CONSTANTS;
const RIDE_STATUS   = APP_CONSTANTS.RIDE_STATUS

const ChatRoomSchema  = new Schema({
    senderId           : {type: Schema.ObjectId, ref: 'customers', required: true},
    receiverId         : {type: Schema.ObjectId, ref: 'customers', required: true},
    createdAt: {type: Date, default: Date.now,required: true},
    updatedAt: {type: Date, default: Date.now,required: true},
})

ChatRoomSchema.plugin(AutoIncrement, {inc_field: 'messageRoomAutoIncrementId'});
module.exports = Mongoose.model('chatRoom', ChatRoomSchema);