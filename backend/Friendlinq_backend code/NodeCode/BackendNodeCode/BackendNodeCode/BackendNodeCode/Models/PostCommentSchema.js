/**
 * Created by Anurag on 17/12/2020.
 */

const Mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(Mongoose);
const Config = require('../Config');
const Schema = Mongoose.Schema;
const APP_CONSTANTS = Config.APP_CONSTANTS;
const POST_STATUS      =  APP_CONSTANTS.POST_STATUS;


const Comment = new Schema({
    postId :{type: Schema.ObjectId, ref: 'post'},
    commentText: {type: String, trim: true},
    commentAuthor :{type: Schema.ObjectId, ref: 'customer'},
    parentId:{type: Schema.ObjectId, ref: 'customer'},    
    isDeleted: {type: Boolean, default: false},
    isEdited: {type: Boolean, default: false},
    editedAt: {type: Date, default:null},
    totalLike:{type: Number, default: 0},
    isChildCommentExists:{type: Boolean, default: false},
    createdAt: {type: Date, default: Date.now,required: true},
    updatedAt: {type: Date, default: Date.now,required: true},
})

Comment.plugin(AutoIncrement, {inc_field: 'commentAutoIncrementId'});
module.exports = Mongoose.model('postComment', Comment);