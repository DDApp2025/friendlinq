/**
 * Created by Anurag on 17/12/2020.
 */

const Mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(Mongoose);
const Config = require('../Config');
const Schema = Mongoose.Schema;
const APP_CONSTANTS = Config.APP_CONSTANTS;
const POST_STATUS   =  APP_CONSTANTS.POST_STATUS;
const POST_TYPES    =  APP_CONSTANTS.POST_TYPES;


const Post = new Schema({
    postTitle: {type: String,trim: true},
    groupId :{type: Schema.ObjectId, ref: 'postGroup'},
    postAuthor :{type: Schema.ObjectId, ref: 'customer'},
    postContent: {type: String,trim: true},
    broadcastId: {type: String,default: null},
    imageURL: {
      original: {type: String, default: null},
      thumbnail: {type: String, default: null}
    },
    videoURL: {type: String, default: null},
    videoThumbnailUrl: {
      original: {type: String, default: null},
      thumbnail: {type: String, default: null}
    },
    postStatus: {
        type: String, enum: [POST_STATUS.PUBLISH,POST_STATUS.UNPUBLISH],
        default: POST_STATUS.PUBLISH
    },
    postType: {
      type: String, enum: [POST_TYPES.PUBLIC,POST_TYPES.PRIVATE,POST_TYPES.FRIEND_ONLY],
      default: POST_TYPES.PUBLIC
    },
    isDeleted: {type: Boolean, default: false},
    isdating:{type: String, default: "0"},
    totalComment:{type: Number, default: 0},
    totalLike:{type: Number, default: 0},
    totalDislike:{type: Number, default: 0},
    commentOnOff: {type: Boolean, default: true},
    createdAt: {type: Date, default: Date.now,required: true},
    updatedAt: {type: Date, default: Date.now,required: true},
    sensitive: {type: Boolean, default: false},
})

Post.plugin(AutoIncrement, {inc_field: 'postAutoIncrementId'});
module.exports = Mongoose.model('post', Post);