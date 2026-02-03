/**
 * Created by Anurag on 15/04/19.
 */

const Mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(Mongoose);
const Config = require('../Config');
const Schema = Mongoose.Schema;
const APP_CONSTANTS = Config.APP_CONSTANTS;
const GENDER_TYPES      =  APP_CONSTANTS.GENDER_TYPES;


const Customer = new Schema({
  fullName: {type: String,trim: true},
  //lastName: {type: String, lowercase: true,trim: true},
  email: {type: String,unique : true,trim: true,index: true, required: true,sparse: true, lowercase: true},
  password: {type: String, trim: true},
  googleId: {type: String,unique : true,trim: true,index: true,sparse: true},
  //age: {type: Number,sparse: true},
  //weight: {type: String, trim: true,sparse: true},
  //height: {type: String, trim: true,sparse: true},
  usertype: {type: String, default:'0'},
  about: {type: String, trim: true,sparse: true},
  street: {type: String, trim: true,sparse: true},
  otherAddress: {type: String, trim: true,sparse: true},
  postalCode: {type: String, trim: true,sparse: true},
  city: {type: String, trim: true,sparse: true},
  state: {type: String, trim: true,sparse: true},
  country: {type: String, trim: true,sparse: true},
  phoneNumber:{type: String, trim: true,sparse: true},
  age:{type: String, trim: true, default: null},
  dob:{type: String, default: null},
  occupation:{type: String, default: null},
  education_level:{type: String, default: null},
  personality:{type: String, default: null},
  looking_for:{type: String, default: null},
  interests:{type: String, default: null},
  hobbies:{type: String, default: null},
  exercise_habits:{type: String, default: null},
  alcohol_use:{type: String, default: null},
  drug_use:{type: String, default: null},
  political_views:{type: String, default: null},
  religion:{type: String, default: null},
  imageURL: {
		original: {type: String, default: null},
		thumbnail: {type: String, default: null}
	},
  bannerURL: {
		original: {type: String, default: null},
		thumbnail: {type: String, default: null}
	},
  bannerURLDating: {
		original: {type: String, default: null},
		thumbnail: {type: String, default: null}
	},
  location: {
    type: {type: String, enum: "Point", default: "Point"},
    coordinates: {type: [Number]}
  },
  gender: {
    type: String, required: false, default:'',
  },
  deviceType: {
    type: String, enum: [
      APP_CONSTANTS.DEVICE_TYPES.IOS,
      APP_CONSTANTS.DEVICE_TYPES.ANDROID,
       
    ]
  },
  deviceToken: {type: String, trim: true, index: false, sparse: false},
  accessToken: {type: String, trim: true, index: true, unique: true, sparse: true},
  isShowEmail: {type: Boolean, default: true},
  isShowPhone: {type: Boolean, default: true},
  isShowDob: {type: Boolean, default: true},
  isDeleted: {type: Boolean, default: false},
  commentOnOff: {type: Boolean, default: false},
  autoRefresh: {type: Boolean, default: false},
  isBlocked: {type: Boolean, default: false},
  isOnline: {type: Boolean, default: false}, //false - offline, true - online
  createdAt: {type: Date, default: Date.now,required: true},
  updatedAt: {type: Date, default: Date.now,required: true},
  passwordResetToken: {type: String, trim: true,index: true, sparse: true},
  otp: {type: String,trim: true},
  wallpaper: {type: String, default:"0"},
  userVideo: {type: String, default:""},
  userVideoThumbnail: {type: String, default:""},
  userVideoDating: {type: String, default:""},
  userVideoThumbnailDating: {type: String, default:""},
  totalFriend: {type: Number,default:0 },
  socketID:{ type: String, trim: true, index: false, sparse: false},
  // topFourImage: {
  //   type: [{ image: { type: String }, thumbnail: { type: String, default: null }, fileType: { type: Number } }]
  // }
  topFourImage: {
    type: [{ type: String }]
  },
  topFourImageDating: {
    type: [{ type: String }]
  }
});
Customer.plugin(AutoIncrement, {inc_field: 'custermerAutoIncrementId'});
module.exports = Mongoose.model('customer', Customer);