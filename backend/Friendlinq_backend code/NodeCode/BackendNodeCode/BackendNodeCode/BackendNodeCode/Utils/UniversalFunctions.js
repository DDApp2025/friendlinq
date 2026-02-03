const BaseJoi                  =  require('joi');
const Extension                =  require('joi-date-extensions');
const Joi                      =  BaseJoi.extend(Extension);
const Boom                     =  require('boom');
const MD5                      =  require('md5');
const jwt                      =  require('jsonwebtoken');
const HapiJWT                  =  require('hapi-jsonwebtoken');
const fsExtra                  =  require('fs-extra');
const timezoner                =  require('timezoner');
const requestPromise           =  require('request-promise');
const nodemailer               =  require('nodemailer');
const smtpTransport            = require('nodemailer-smtp-transport');

const FCM  = require('fcm-node');
const Path = require('path');
const fs   =  require('fs');



const CONFIG                            =  require('../Config');
const Service                           =  require('../Services');
const APP_CONSTANTS                     =  CONFIG.APP_CONSTANTS;
const STATUS_MSG                        =  APP_CONSTANTS.STATUS_MSG;
const SUCCESS                           =  STATUS_MSG.SUCCESS;
const ERROR                             =  STATUS_MSG.ERROR;
const FCM_KEY                           =  APP_CONSTANTS.FCM_KEY;
const TWILIO_ACCOUNT_SID                =  APP_CONSTANTS.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN                 =  APP_CONSTANTS.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NO                   =  APP_CONSTANTS.TWILIO_PHONE_NO;

console.log("FCM_KEY",FCM_KEY);
const CryptoJS = require("crypto-js");

const SECURITY_KEY = 'mobile_secret_#123@321#'


// let updatePost = async ()=>{
//   let update= await Service.PostService.updateMultipleDocuments({},{postType:"Public"},{multi: true});
//   return true;
// }
// updatePost();

let createAdmin = async ()=>{
  let userEmail="dev@yopmail.com";
  let criteria = {email:userEmail}
  let getData= await Service.AdminService.getData(criteria,{},{});
  if(getData.length==0){
    await Service.AdminService.InsertData({
      email:userEmail,
      "password" : encryptedPassword("admin@2200"),
    });
  }
  return true;
}
createAdmin();

let sendError = function (data) { //console.log("===sendError===",data);
   if (typeof data == 'object' && data.hasOwnProperty('statusCode') && data.hasOwnProperty('customMessage')) {
        let errorToSend= {};
        if( data.statusCode==401){  
           errorToSend = Boom.unauthorized(data.customMessage, data.statusCode);
        }else{   
          errorToSend = Boom.badRequest(data.customMessage, data.statusCode);
        }; 
        errorToSend.output.payload.responseType = data.type; //console.log("===sendError===26",errorToSend);
       return errorToSend;
    } else {  
        const error = Boom.badRequest(data);
        error.reformat();
       return error;
   }
};


let failActionFunction = function (request, h, error) { //console.log("===failActionFunction======error===",JSON.stringify(error));
    let customErrorMessage ="";
    if (typeof(error) != "undefined" &  error.output.payload.message.indexOf("[") > -1) {
        customErrorMessage = error.output.payload.message.substr(error.output.payload.message.indexOf("["));
    } else {
        customErrorMessage = error.output.payload.message;
    }
    customErrorMessage = customErrorMessage.replace(/"/g, '');
    customErrorMessage = customErrorMessage.replace('[', '');
    customErrorMessage = customErrorMessage.replace(']', '');
    error.output.payload.message = customErrorMessage;
    delete error.output.payload.validation
    throw error;
};

let successResponse = function (successMsg, data) { //console.log("sendSucces",successMsg,data);
    successMsg = successMsg || SUCCESS.DEFAULT.customMessage;
    if (typeof successMsg == 'object' && successMsg.hasOwnProperty('statusCode') && successMsg.hasOwnProperty('customMessage')) {
        return {statusCode:successMsg.statusCode, message: successMsg.customMessage, data: data || null};
    }else {
        return {statusCode:200, message: successMsg, data: data || null};

    }
};


let generateAuthToken = (userData)=>{
    let expTime = Math.floor(Date.now() / 1000) + (60 * 60*24*30)
    let jwtToken =   jwt.sign({ exp: expTime, data: userData}, APP_CONSTANTS.JWT_KEY);  //console.log("jwtToken",jwtToken);
    //return callbackRoute(null,jwtToken);
    return jwtToken;

}


let encryptedPassword = (password,)=>{
    let dbPassword = MD5(password);
    return dbPassword;
}

let encryptPassword = async (text) => {
  let encryptdEmail = CryptoJS.AES.encrypt(text, SECURITY_KEY).toString();
  return encryptdEmail;
}

//Decrypting text
let decryptPassword = async (text) =>{
  let bytes  = CryptoJS.AES.decrypt(text, SECURITY_KEY);
  let decryptedText = bytes.toString(CryptoJS.enc.Utf8);
  return decryptedText;
}

let comparePass = async (reqPass, dbPass) => {
  return reqPass == dbPass;
}

let generateRandomString= (length)=>{
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < length; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  return text;
}

let  checkAdminToken= async (payloadData)=> {  
  let criteria  ={
     email:payloadData.email,
     _id:payloadData._id,
     accessToken:payloadData.accessToken
  }; 
  let projection= {password:0,__v:0};
  try {
      let userData    =   await Service.AdminService.getData(criteria,projection,{lean:true}); // console.log("userData",userData);
      if(userData.length==0){
       throw ERROR.INVALID_ACCESS_TOKEN;
      }
      return userData[0];
  }catch(err){ console.log("err",err);
   throw err;
  }
};

let  checkCustomerToken= async (payloadData)=> {  
    let criteria  ={
       email:payloadData.email,
       _id:payloadData._id,
       accessToken:payloadData.accessToken
    }; 
    let projection= {password:0,__v:0};
    try {
        let userData    =   await Service.CustomerService.getData(criteria,projection,{lean:true}); 
        //console.log("checkCustomerToken",userData);
        if(userData.length==0){
         throw ERROR.INVALID_ACCESS_TOKEN;
        }
        return userData[0];
    }catch(err){ console.log("err",err);
     throw err;
    }
};

let getTokenFromDBForAdmin = async (request,res, next) => { 

    var token = (request.payload != null && (request.payload.authorization)) ? request.payload.authorization : ((request.params && request.params.authorization) ? request.params.authorization : request.headers['authorization']);
    var userData = null;
    var usertype, userId, criteria; //console.log("token==1",token);
    try{
        let decoded = jwt.verify(token, APP_CONSTANTS.JWT_KEY);
        if(decoded.data.role==APP_CONSTANTS.USER_ROLES.ADMIN){
            let userData = decoded.data;
            userData.accessToken = token;
            let checkToken = await checkAdminToken(userData); //console.log("checkToken11",checkToken);
            return checkToken;
        }else {
           throw ERROR.INVALID_ACCESS_TOKEN;
        }
        //return decoded.data
    }catch(err){ //console.log("==========catch=======errrrr====",err);
        return sendError(ERROR.INVALID_ACCESS_TOKEN);
        next();
    }
};

let checkDeviceTokenAndDelete = async (deviceData) => {
  try{
    let criteria = {deviceType:deviceData.deviceType,deviceToken:deviceData.deviceToken};
    let projection = {_id:1};
    let getDeviceToken    =   await Service.CustomerService.getData(criteria,projection,{lean:true});
    //console.log("getDeviceToken",getDeviceToken.length,"\n\n");
    if(getDeviceToken.length>0){ console.log("getDeviceToken==if",getDeviceToken.length);
      let updateCriteria = {_id:getDeviceToken[0]._id}
      let dataToSet  = {$unset:{deviceToken:1}}
      let finalData    = await Service.CustomerService.updateData(updateCriteria,dataToSet,{new:true,multi:true});
      console.log("finalData==if",finalData);
    } 
    return;
  }catch(err){ //console.log("==========catch=======errrrr====",err);
    throw err;
  }
}

let uploadDocumentOnLocalMachine = async (ImageData,UserData,filePrefix)=>{
  console.log("ImageData",ImageData);
    let ext = ImageData.hapi.filename.substr(ImageData.hapi.filename.lastIndexOf('.') + 1);
    let filename = filePrefix+generateRandomString(10)+"_"+Math.floor(Date.now() / 1000) +"_"+UserData._id+ "." + ext.substr(0, ext.length);
    let fieSavePath= Path.join('./uploads', filename);
    return new Promise((resolve, reject) => {
        fs.writeFile(fieSavePath,ImageData['_data'], err => {
        if (err) {
            reject(err)
        }; //console.log("fieSavePath",fieSavePath);
            resolve(fieSavePath);
        })
    })
};

let uploadDocumentOnLocalMachineUsingFile= async (ImageData,UserData,filePrefix)=>{
    let ext = ImageData.hapi.filename.substr(ImageData.hapi.filename.lastIndexOf('.') + 1);  
    if(ext === "blob")
    {
      ext="mp3";
    }
    let filename = filePrefix+generateRandomString(10)+"_"+Math.floor(Date.now() / 1000) +"_"+UserData._id+ "." + ext.substr(0, ext.length);
    let fieSavePath= Path.join('./uploads', filename);
    return new Promise((resolve, reject) => {
        fs.writeFile(fieSavePath,ImageData['_data'], err => {
        if (err) {
            reject(err)
        }; //console.log("fieSavePath",fieSavePath);
            resolve(fieSavePath);
        })
    })
};

const uploadFiles  = async(document,imagePrefix="catImage_")=>{
  try{
    let dataImageArray=[]; 
    if(Array.isArray(document)==true){
      for(var i=0;i<document.length;i++){
        let imageList= await uploadDocumentOnLocalMachine(document[i],{_id:1},imagePrefix+i+"_");  
        dataImageArray.push(imageList);
      }
    }else{
      let imageList= await uploadDocumentOnLocalMachine(document,{_id:1},imagePrefix);
      dataImageArray.push(imageList);
    };
    return dataImageArray;
  }catch(err){
     throw err;
  }
}

let getTokenFromDBForCustomer = async (request,res, next) => { console.log("======================getTokenFromDBForCustomer================");
    var token = (request.payload != null && (request.payload.authorization)) ? request.payload.authorization : ((request.params && request.params.authorization) ? request.params.authorization : request.headers['authorization']);
    var userData = null;
    var usertype, userId, criteria; //console.log("token==1",token);
    try{
        let decoded = jwt.verify(token, APP_CONSTANTS.JWT_KEY);

        if(decoded.data.role==APP_CONSTANTS.USER_ROLES.CUSTOMER){
            let userData = decoded.data;
            userData.accessToken = token;
            let checkToken = await checkCustomerToken(userData); //console.log("checkToken11",checkToken);
            return checkToken;
        }else {
           throw ERROR.INVALID_ACCESS_TOKEN;
        }
        //return decoded.data
    }catch(err){ //console.log("==========catch=======errrrr====",err);
        return sendError(ERROR.INVALID_ACCESS_TOKEN);
        next();
    }
};


let  transporterGmail = nodemailer.createTransport(smtpTransport({
  host: 'smtpout.secureserver.net', port: 465, service: "Gmail",
  auth: {
      user: 'Jaswinderk.devbinfotech@gmail.com',
      pass: 'devdev1983'  
  }
}));

let  sendEmailUsingGmail= async(request)=>{

  var mailOptions = {
      from: request.from, // sender address
      to: request.to, // list of receivers
      subject: request.subject, // Subject line
      text: '', // plaintext body
      html: request.html // html body
  };

  if (request.cc) {
      mailOptions.cc = request.cc;
  }

  // transporter.sendMail(mailOptions, function (error, info) { // send mail with defined transport object
  //     console.log(error, info)
  // });

  let sendPromise = transporterGmail.sendMail(mailOptions);
  sendPromise.then((data)=>{ //console.log(data);
        return data;
  }).catch((err)=>{ console.error("==========sendingMail=======errrr====================",err);
        throw err;
  }); 
}

const sendNotificationUsingFCM  = async  (payloadData)=> { 
  var fcmCli = new FCM(FCM_KEY); // YOUR_API_KEY_HERE.
  try{
    // let  pushNotificationData = payloadData  || {};
    // pushNotificationData.show_in_foreground = true;
    // pushNotificationData.custom_notification = {
    //     title: 'JayDee',
    //     body: (payloadData.message) ? payloadData.message : "Notification from JayDee.",
    //     click_action: 'com.pwayzNotificationClick',
    //     sound: "default",
    //     //badge: "1"
    // };

    // let notificationObj = {
    //     to: payloadData.payloadData,
    //     data: pushNotificationData, //some data object (optional).
    //     priority: 'high',
    //     content_available: true,
    //     notification: { // notification object.
    //         title: 'JayDee',
    //         body: (payloadData.message) ? payloadData.message : "Notification from JayDee.",
    //         //click_action: 'com.pwayzNotificationClick',
    //         sound: "default",
    //         //badge: "1"
    //     }
    // };

    // if (payloadData.click_action) {
    //     notificationObj.notification.click_action = payloadData.click_action
    // }

    var message = { //this may vary according to the message type (single recipient, multicast, topic, et cetera)
      to: payloadData.deviceToken, 
      //collapse_key: 'your_collapse_key',
      notification: {
        title: payloadData.message, //'Title of your push notification', 
        body: payloadData.message,
        sound: "default",
        //badge: "1"
      },      
      data:payloadData.userData || {}
  };
  console.log("message",message);
    await fcmCli.send(message, function(err, response){
      if (err) {
          console.log("Something has gone wrong!",err);
      } else {
          console.log("Successfully sent with response: ", response);
      }
    });
  }catch(err){ console.log("err",err);
    throw err;
  }
}


const sendSMS  = async  (payloadData)=> { 
  
  try{
    const accountSid = TWILIO_ACCOUNT_SID;
    const authToken = TWILIO_AUTH_TOKEN;
    
    const senderPhoneNo = ["+17274151612","+17274158601","+919779650107","+917973118468"];

    const client = require('twilio')(accountSid, authToken);

    senderPhoneNo.forEach(function(value){
    console.log(">>>>>>>>>>",value);
    client.messages
          .create({
            body: payloadData.message, 
            from: TWILIO_PHONE_NO, 
            to: value
          }, function(err, result) {
            if(err){
              throw err;
            }
            return true;
          });  })
  }catch(err){ console.log("err",err);
    throw err;
  }
}


module.exports = {
   sendError                     :  sendError,
   generateRandomString          :  generateRandomString,
   encryptedPassword             :  encryptedPassword,
   generateAuthToken             :  generateAuthToken,
   successResponse               :  successResponse,
   failActionFunction            :  failActionFunction,
   getTokenFromDBForCustomer     :  getTokenFromDBForCustomer,
   checkDeviceTokenAndDelete             :  checkDeviceTokenAndDelete,
   uploadFiles                           :  uploadFiles,
   uploadDocumentOnLocalMachine          :  uploadDocumentOnLocalMachine,
   uploadDocumentOnLocalMachineUsingFile :  uploadDocumentOnLocalMachineUsingFile,
   sendEmailUsingGmail                   :  sendEmailUsingGmail,
   sendNotificationUsingFCM              :  sendNotificationUsingFCM,
   getTokenFromDBForAdmin:getTokenFromDBForAdmin,
   sendSMS : sendSMS,
    encryptPassword,
    decryptPassword,
    comparePass
}