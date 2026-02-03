/**
 * Created by Anurag on 13/04/2020.
 */

const Mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(Mongoose);
const Config = require('../Config');
const Schema = Mongoose.Schema;
const APP_CONSTANTS = Config.APP_CONSTANTS;
const RIDE_STATUS   = APP_CONSTANTS.RIDE_STATUS

const PostGroupMemberSchema  = new Schema({
    groupId        : {type: Schema.ObjectId, ref: 'postGroup', required: true},
    groupMemberId  : {type: Schema.ObjectId, ref: 'customers', required: true},
    memberType: {
        type: String, enum: ['Admin','Member'],default:'Member'
    },
    memberDeletedByAdmin:{type: Boolean, default: false},
    memberLeaveGroup:{type: Boolean, default: false},
    memberDeletedAt: {type: Date, default: null},
    memberLeaveAt: {type: Date, default: null},
    isDeleted: {type: Boolean, default: false},
    createdAt: {type: Date, default: Date.now,required: true},
    updatedAt: {type: Date, default: Date.now,required: true},
    status:{type: String, default: "accepted"},
})

PostGroupMemberSchema.plugin(AutoIncrement, {inc_field: 'postGroupMemberAutoIncrementId'});
//PostGroupMemberSchema.index({groupMemberId: 1, groupMemberId: 1}, {unique: true});
module.exports = Mongoose.model('postGroupMember', PostGroupMemberSchema);