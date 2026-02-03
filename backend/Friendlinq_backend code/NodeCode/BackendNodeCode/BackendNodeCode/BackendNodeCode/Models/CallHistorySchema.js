/**
 * Created by Anurag on 13/04/2020.
 */

const Mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(Mongoose);
const Config = require('../Config');
const Schema = Mongoose.Schema;
const APP_CONSTANTS = Config.APP_CONSTANTS;


const CallHistorySchema  = new Schema({
    callerId        : {type: Schema.ObjectId, ref: 'customers', required: true},
    receiverId      : {type: Schema.ObjectId, ref: 'customers', required: true},
    duration: {type: String, default: null},
    token: {type: String},
    channel_name: {type: String, default: null},
    type:{type: String, default: "audio"}, //audio,  video
    status:{type: Number, default: 1}, // 1=calling, 2=accepted, 3=decline	
    createdAt: {type: Date, default: Date.now,required: true},
    updatedAt: {type: Date, default: Date.now,required: true},
})

CallHistorySchema.plugin(AutoIncrement, {inc_field: 'callHistoryAutoIncrementId'});
module.exports = Mongoose.model('call_history', CallHistorySchema);