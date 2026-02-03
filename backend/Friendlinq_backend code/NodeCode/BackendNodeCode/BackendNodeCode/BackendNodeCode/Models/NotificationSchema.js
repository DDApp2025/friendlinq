/**
 * Created by Anurag on 13/04/2020.
 */

const Mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(Mongoose);
const Config = require('../Config');
const Schema = Mongoose.Schema;
const APP_CONSTANTS = Config.APP_CONSTANTS;
const NOTIFICATION_TYPE   = APP_CONSTANTS.NOTIFICATION_TYPE

const NotificationSchema  = new Schema({
	textMessage        : {type: String,trim: true},
    senderId           : {type: Schema.ObjectId, ref: 'customers', required: true},
    receiverId         : {type: Schema.ObjectId, ref: 'customers', required: true},
    notificationType: {
        type: String, enum: [
            NOTIFICATION_TYPE.FRIEND_REQUEST_SEND,
            NOTIFICATION_TYPE.FRIEND_REQUEST_ACCEPTED,
            NOTIFICATION_TYPE.FRIEND_REQUEST_REJECTED,
            NOTIFICATION_TYPE.FRIEND_REQUEST_UNFRIEND,
            NOTIFICATION_TYPE.FRIEND_REQUEST_INVITATION,
            NOTIFICATION_TYPE.FRIEND_REQUEST_CANCELED,
            NOTIFICATION_TYPE.NEW_MESSAGE_SEND,
            NOTIFICATION_TYPE.USER_COMMENT_POST, 
            NOTIFICATION_TYPE.USER_LIKE_POST,
            NOTIFICATION_TYPE.USER_UNLIKE_POST, 
            NOTIFICATION_TYPE.GROUP_ADMIN_ADD_MEMBER,
            NOTIFICATION_TYPE.GROUP_ADMIN_REMOVED_MEMBER, 
            NOTIFICATION_TYPE.GROUP_LEFT_BY_MEMBER,                    
        ]
    },
    postId :{type: Schema.ObjectId, ref: 'post', default: null},
    isDeleted: {type: Boolean, default: false},
    isView: {type: Boolean, default: false},
    isRead: {type: Boolean, default: false},
    createdAt: {type: Date, default: Date.now,required: true},
    updatedAt: {type: Date, default: Date.now,required: true},
})

NotificationSchema.plugin(AutoIncrement, {inc_field: 'notificationAutoIncrementId'});
module.exports = Mongoose.model('notification', NotificationSchema);