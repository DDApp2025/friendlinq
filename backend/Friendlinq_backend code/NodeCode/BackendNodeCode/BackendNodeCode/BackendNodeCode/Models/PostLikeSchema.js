/**
 * Created by Anurag on 17/12/2020.
 */

const Mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(Mongoose);
const Config = require('../Config');
const Schema = Mongoose.Schema;
const APP_CONSTANTS = Config.APP_CONSTANTS;
const POST_STATUS      =  APP_CONSTANTS.POST_STATUS;

const PostLike = new Schema({
    postId :{type: Schema.ObjectId, ref: 'post'},
    userId :{type: Schema.ObjectId, ref: 'customer'},
    isLike:{type: Boolean, default: false},
    isDeleted: {type: Boolean, default: false},
    likeDateAt: {type: Date, default:null},
    unlikeDateAt: {type: Date, default:null},
    likeType: {type: String, enum: Object.values(APP_CONSTANTS.LIKE_TYPE), default: APP_CONSTANTS.LIKE_TYPE.LIKE },
    isDislike:{type: Boolean, default: false},
    dislikeDateAt: {type: Date, default:null},

    createdAt: {type: Date, default: Date.now,required: true},
    updatedAt: {type: Date, default: Date.now,required: true},
})

PostLike.plugin(AutoIncrement, {inc_field: 'likeAutoIncrementId'});
module.exports = Mongoose.model('postlike', PostLike);