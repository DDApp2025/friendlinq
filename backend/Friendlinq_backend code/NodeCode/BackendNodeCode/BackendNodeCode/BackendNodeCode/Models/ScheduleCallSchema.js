/**
 * Created by Anurag on 13/04/2020.
 */

const Mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(Mongoose);
const Config = require('../Config');
const Schema = Mongoose.Schema;
const APP_CONSTANTS = Config.APP_CONSTANTS;

const ScheduleCallSchema  = new Schema({
	title        : {type: String, default: null},
	channelId        : {type: String, default: null},
	scheduleDate        : {type: String, default: null},
	scheduleTime        : {type: String, default: null},
	callType        : {type: String, default: null},
    isEnded: {type: Boolean, default: false},
	inviteLink        : {type: String, default: null},
	hostId        : {type: Schema.ObjectId, ref: 'customers', required: true},
	memberEmails        : {type: [String], required: true},
	memberNames        : {type: [String], required: true},
    createdAt: {type: Date, default: Date.now,required: true},
    updatedAt: {type: Date, default: Date.now,required: true},
})

ScheduleCallSchema.plugin(AutoIncrement, {inc_field: 'scheduleCallAutoIncrementId'});
module.exports = Mongoose.model('scheduleCall', ScheduleCallSchema);