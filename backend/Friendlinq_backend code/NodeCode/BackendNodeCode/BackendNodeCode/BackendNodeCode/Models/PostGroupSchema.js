/**
 * Created by Anurag on 13/04/2020.
 */

const Mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(Mongoose);
const Config = require('../Config');
const Schema = Mongoose.Schema;
const APP_CONSTANTS = Config.APP_CONSTANTS;
const RIDE_STATUS   = APP_CONSTANTS.RIDE_STATUS

const PostGroupSchema  = new Schema({
    groupName        : {type: String, lowercase: true,trim: true},
    totalPosts:{type: Number, default: 0},
    totalGroupMember:{type: Number, default: 0},
    groupAdminId  : {type: Schema.ObjectId, ref: 'customers', required: true},
    isdating:{type: String, default: "0"},
    isDeleted: {type: Boolean, default: false},
    isActive: {type: Boolean, default: false},
    channelId:{type: String, default: ""},
    callType:{type: String, default: "0"}, // 0= video 1= audio
    groupDeletedAt: {type: Date, default: null},
    groupIcon: {
        original: {type: String, default: null},
        thumbnail: {type: String, default: null}
    },
    createdAt: {type: Date, default: Date.now,required: true},
    updatedAt: {type: Date, default: Date.now,required: true},
})

PostGroupSchema.plugin(AutoIncrement, {inc_field: 'postGroupAutoIncrementId'});
//PostGroupSchema.index({groupName: 1, groupAdminId: 1}, {unique: true});
module.exports = Mongoose.model('postGroup', PostGroupSchema);