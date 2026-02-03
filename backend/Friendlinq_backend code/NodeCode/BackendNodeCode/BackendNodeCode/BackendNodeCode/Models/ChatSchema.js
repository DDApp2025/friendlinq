/**
 * Created by Anurag on 13/04/2020.
 */

const Mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(Mongoose);
const Config = require('../Config');
const Schema = Mongoose.Schema;
const APP_CONSTANTS = Config.APP_CONSTANTS;


const ChatSchema  = new Schema({
	textMessage        : {type: String,trim: true},
    senderId           : {type: Schema.ObjectId, ref: 'customers', required: true},
    receiverId         : {type: Schema.ObjectId, ref: 'customers', required: true},
    chatRoomId         : {type: Schema.ObjectId, ref: 'chatRoom', required: false},
    imageURL: {
        original: {type: String, default: null},
        thumbnail: {type: String, default: null}
    },
    videoURL: {type: String, default: null},
    audioURL: {type: String},
    videoThumbnailUrl: {
        original: {type: String, default: null},
        thumbnail: {type: String, default: null}
    },
    isDeleted: {type: Boolean, default: false},
    isRead: {type: Boolean, default: false},
    createdAt: {type: Date, default: Date.now,required: true},
    updatedAt: {type: Date, default: Date.now,required: true},
})

ChatSchema.plugin(AutoIncrement, {inc_field: 'messageAutoIncrementId'});
module.exports = Mongoose.model('chat', ChatSchema);