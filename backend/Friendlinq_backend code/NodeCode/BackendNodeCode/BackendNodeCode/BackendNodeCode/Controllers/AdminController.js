/**
 * Created by Anurag on 15/04/19.
 */
const Path = require('path');
const _ = require('underscore');
//const fs = require('fs').promises;
//const readFilePromise = require('fs-readfile-promise');
const Mongoose = require('mongoose');

const Service = require('../Services');
const Models  = require('../Models');
const Config = require('../Config');
const UniversalFunctions      = require('../Utils/UniversalFunctions');


const APP_CONSTANTS   =  Config.APP_CONSTANTS;
const DEVICE_TYPES    =  APP_CONSTANTS.DEVICE_TYPES;
//const ALLOWED_DOC_EXT_DRIVER    =  APP_CONSTANTS.ALLOWED_DOC_EXT_DRIVER;
const STATUS_MSG      =  APP_CONSTANTS.STATUS_MSG;
const SOCIAL_MODE_TYPE       =  APP_CONSTANTS.SOCIAL_MODE_TYPE;
//const ALLOWED_IMAGE_EXT      =  APP_CONSTANTS.ALLOWED_IMAGE_EXT;
//const DOCUMENT_IMAGES_PREFIX =  APP_CONSTANTS.DOCUMENT_IMAGES_PREFIX;



const  login = async (payloadData)=> {  
  payloadData.password= UniversalFunctions.encryptedPassword(payloadData.password);
  let criteria  ={
    password:payloadData.password,
    email:payloadData.email
  }; 
  let projection= {
    password:0,__v:0
  };
  try {
    
    let userData    =   await Service.AdminService.getData(criteria,projection,{lean:true});  //console.log("userData",userData);
    if(userData.length==0){
       throw APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_EMAIL_PASSWORD;
    }
    let accessToken =  await  UniversalFunctions.generateAuthToken({_id:userData[0]._id,email:userData[0].email,name:userData[0].email,role :APP_CONSTANTS.USER_ROLES.ADMIN}); //console.log("accessToken",accessToken);
    let updateCriteria = {_id:userData[0]._id}
    let dataToSet ={
      accessToken:accessToken,
      updatedAt: new Date(),
    }
    let finalData = await Service.AdminService.updateData(updateCriteria,dataToSet,{new:true});
    delete finalData.password;
    delete finalData.__v; 
    return {adminData:finalData}
  }catch(err){
    throw err;
  }
}

let logout = async (UserData)=>{ //console.log("UserData",UserData); 
  try{
    let  criteria = {_id: UserData._id }; 
    let dataToSet = {
      $unset: {
          accessToken: 1,
          deviceToken:1
      }
    };
    let options = {};
    let updatePassWord    = await Service.AdminService.updateData(criteria,dataToSet,options);
    return {};
  }catch(err){
    throw err;
  }
};


let changePassword = async (payloadData,UserData)=> { //
  try{
   let  criteria = {_id: UserData._id }; 
   let encryptedPassword = UniversalFunctions.encryptedPassword(payloadData.oldPassword);
   let restaurantData = await Service.AdminService.getData(criteria,{},{lean:true}); //console.log("restaurantData",restaurantData);
    if(restaurantData.length==0){
      throw STATUS_MSG.ERROR.NOT_FOUND;
    }
    if(restaurantData[0].password!=encryptedPassword){
      throw STATUS_MSG.ERROR.INCORRECT_OLD_PASS;
    }
    let  dataToSet = {
      password: UniversalFunctions.encryptedPassword(payloadData.newPassword)
    };
    let updatePassWord    = await Service.AdminService.updateData(criteria,dataToSet,{new:true,lean:true});//console.log("servingLocation",servingLocation);
    delete updatePassWord.password;
    delete updatePassWord.__v;
    return {adminData: updatePassWord};
  }catch(err){
    throw err;
  }
};

const userList  = async (payloadData,UserData)=> {
  try{
    let criteria = {},pojection = {accessToken:0,__v:0,password:0,location:0,otp:0,deviceType:0,deviceToken:0,isDeleted:0}
    let options = {lean:true,skip:payloadData.skip,limit:payloadData.limit,sort:{custermerAutoIncrementId:-1}};
    let queryResult= await Promise.all([
      Service.CustomerService.getData(criteria,{_id:1},{}),
      Service.CustomerService.getData(criteria,pojection,options),
    ])
    let totalUser = queryResult[0].length || 0;
    let allUserList =  queryResult[1] || [];
    return {
      totalUser:totalUser,
      allUserList:allUserList,
    }
  }catch(err){
    throw err;
  }  
}

const blockUnBlockUser  = async (payloadData,UserData)=> {
  try{
    let criteria = {_id:payloadData.userId};
    let pojection = {accessToken:0,__v:0,password:0,location:0,otp:0,deviceType:0,deviceToken:0,isDeleted:0}
    let dataToSet = {isBlocked:payloadData.isBlock}
    let options = {lean:true};
    let queryResult= await  Service.CustomerService.getData(criteria,{_id:1},{});
    let block= await  Service.CustomerService.updateData(criteria,dataToSet,{lean:true});
    return {}
  }catch(err){
    throw err;
  }  
}

let verifyOtp = async (payloadData)=> { //
  try{
   let  criteria = {mobileNumber: payloadData.mobileNumber,countryCode:payloadData.countryCode }; 
    
   let userData = await Service.CustomerService.getData(criteria,{},{lean:true}); 

    if(userData.length==0){
      throw STATUS_MSG.ERROR.NOT_FOUND;
    }

    if(userData[0].otp!=payloadData.otp){
      throw STATUS_MSG.ERROR.INCORRECT_PASSWORD_OTP;
    }
    let accessToken =  await  UniversalFunctions.generateAuthToken({ 
        _id:userData[0]._id,
        email:userData[0].email,
        name:userData[0].email,
        role :APP_CONSTANTS.USER_ROLES.CUSTOMER
    });
    let  dataToSet = {};
    if(payloadData.isForgotPassword){
       dataToSet.passwordResetToken = accessToken;
    }else{
      dataToSet.isMobileVerify=true;
    }
    
    let optionsU ={new:true,lean:true};
    let updatePassWord    = await Service.CustomerService.updateData(criteria,dataToSet,optionsU);//console.log("servingLocation",servingLocation);
    
    delete updatePassWord.password;
    delete updatePassWord.__v;
    return {passwordResetToken: accessToken};
  }catch(err){
    throw err;
  }
};


let forgotPassword = async (payloadData, UserData)=>{ //console.log("===forgotPassword===");
  try{
    let  criteria = {mobileNumber: payloadData.mobileNumber }; 
    let userData      = await Service.CustomerService.getData(criteria,{},{lean:true}); //console.log("restaurantData",restaurantData);
    if(userData.length==0){
      throw STATUS_MSG.ERROR.NOT_FOUND;
    }
    let  updateCriteria = {mobileNumber: payloadData.mobileNumber }; 
    let  uniqueCode = Math.floor(1000 + Math.random() * 9000);
    let dataToSet = {
      otp: uniqueCode,
      updatedAt: new Date().toISOString()     
    };
    let sendMessage =  UniversalFunctions.sendMessageConceptsguru("+91",payloadData.mobileNumber,uniqueCode);
    let updatePassWord    = await Service.CustomerService.updateData(updateCriteria,dataToSet,{new:true});
    return { 
      //updatePassWord:updatePassWord,
      otp:uniqueCode 
    };
  }catch(err){
     throw err;
  }
}

let resetPassword = async (payloadData)=>{
  let  criteria = {passwordResetToken:payloadData.passwordResetToken };   console.log("criteria",criteria);
  let restaurantData = null;
  try{
    let getRestaurantDetail =  await Service.CustomerService.getData(criteria,{},{lean:true}); console.log("getRestaurantDetail",getRestaurantDetail);
    if(getRestaurantDetail.length==0) throw STATUS_MSG.ERROR.NOT_FOUND;
    restaurantData = getRestaurantDetail[0];
    
    if(restaurantData.passwordResetToken!=payloadData.passwordResetToken) throw STATUS_MSG.ERROR.INVALID_OTP;
    let dataToSet = {
        $set:{ password: UniversalFunctions.encryptedPassword(payloadData.newPassword),},
        $unset: {passwordResetToken: 1,otpCode:1}
    }; 
    let updatePassWord    = await Service.CustomerService.updateData(criteria,dataToSet,{new:true});
    return {};
  }catch(err){
     throw err;
  }    
};




module.exports ={

  login          : login,
  logout         : logout,
  changePassword : changePassword,
  verifyOtp      : verifyOtp,
  forgotPassword : forgotPassword,
  resetPassword  : resetPassword,
  userList:userList,
  blockUnBlockUser:blockUnBlockUser
}