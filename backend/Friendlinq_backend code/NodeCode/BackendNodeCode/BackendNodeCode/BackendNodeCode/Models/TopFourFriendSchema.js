/**
 * Created by Anurag on 18/12/2020.
 */

const Mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(Mongoose);
const Config = require('../Config');
const Schema = Mongoose.Schema;
const APP_CONSTANTS = Config.APP_CONSTANTS;

const TopFourFriendSchema = new Schema({

    userId : {type: Schema.ObjectId, ref: 'customer'},
    friendId : {type: Schema.ObjectId, ref: 'customer'},
    friendName: {type: String, default:""},
    friendImage: {type: String, default:""},
    usertype: {type: String, default:'0'},
    createdAt: {type: Date, default: Date.now,required: true},
	updatedAt: {type: Date, default: Date.now,required: true},

})

TopFourFriendSchema.plugin(AutoIncrement, {inc_field: 'topFourFriendAutoIncrementId'});
module.exports = Mongoose.model('topFourFriend', TopFourFriendSchema);