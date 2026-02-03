/**
 * Created by Anurag on 18/12/2020.
 */

const Mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(Mongoose);
const Config = require('../Config');
const Schema = Mongoose.Schema;
const APP_CONSTANTS = Config.APP_CONSTANTS;
const FRIEND_REQUEST_TYPE      =  APP_CONSTANTS.FRIEND_REQUEST_TYPE;

const FriendRequestSchema = new Schema({

    customerFrom : {type: Schema.ObjectId, ref: 'customer'},
    customerTo : {type: Schema.ObjectId, ref: 'customer'},
    status: {
        type: String, enum: [
            FRIEND_REQUEST_TYPE.ACCEPTED,
            FRIEND_REQUEST_TYPE.SEND,
            FRIEND_REQUEST_TYPE.REJECTED,
            FRIEND_REQUEST_TYPE.UNFRIEND,
            FRIEND_REQUEST_TYPE.CANCELED,           
        ], default:FRIEND_REQUEST_TYPE.SEND
    },
    isDeleted: {type: Boolean, default: false},
    canceledAt: {type: Date, default:null},
    acceptedAt: {type: Date, default:null},
    rejectedAt: {type: Date, default:null},
    unfriendAt: {type: Date, default:null},
    sendAt: {type: Date, default:null},
    createdAt: {type: Date, default: Date.now,required: true},
	updatedAt: {type: Date, default: Date.now,required: true},

})

FriendRequestSchema.plugin(AutoIncrement, {inc_field: 'friendRequestedAutoIncrementId'});
module.exports = Mongoose.model('friendRequested', FriendRequestSchema);