/**
 * Created by Anurag on 15/04/19.
 */
const Path = require('path');
const _ = require('underscore');
//const fs = require('fs').promises;
const Mongoose = require('mongoose');
const readFilePromise = require('fs-readfile-promise');

const Service = require('../Services');
const Models  = require('../Models');
const Config = require('../Config');
const UniversalFunctions      = require('../Utils/UniversalFunctions');
const { exit } = require('process');


const APP_CONSTANTS   =  Config.APP_CONSTANTS;
const DEVICE_TYPES    =  APP_CONSTANTS.DEVICE_TYPES;
const FRIEND_REQUEST_TYPE =  APP_CONSTANTS.FRIEND_REQUEST_TYPE
//const ALLOWED_DOC_EXT_DRIVER    =  APP_CONSTANTS.ALLOWED_DOC_EXT_DRIVER;
const STATUS_MSG      =  APP_CONSTANTS.STATUS_MSG;
const SOCIAL_MODE_TYPE       =  APP_CONSTANTS.SOCIAL_MODE_TYPE;
//const ALLOWED_IMAGE_EXT      =  APP_CONSTANTS.ALLOWED_IMAGE_EXT;
//const DOCUMENT_IMAGES_PREFIX =  APP_CONSTANTS.DOCUMENT_IMAGES_PREFIX;
const NOTIFICATION_TYPE  =  APP_CONSTANTS.NOTIFICATION_TYPE;
const axios = require('axios');

const registration  = async (payloadData)=> { //console.log("payloadData",payloadData);
  console.log("payloadData",payloadData);
  let userData;
  payloadData.password= await UniversalFunctions.encryptPassword(payloadData.password);
  payloadData.location = {
    type:"Point",
    coordinates:[0,0]
  }
  let deviceData={
    deviceType  : payloadData.deviceType,
    deviceToken : payloadData.deviceToken,
  }
  delete payloadData.deviceType;
  delete payloadData.deviceToken;
  if(payloadData.fullName) {
    const fullName = payloadData.fullName;
    const capitalizedFullName = fullName
      .split(" ")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
    payloadData.fullName = capitalizedFullName;
  }
  try {
    //let otp         =  Math.floor(1000 + Math.random() * 9000); //console.log("otp",otp);
    let userData    =  await  Service.CustomerService.InsertData(payloadData); 
    let checkDevice =  await  UniversalFunctions.checkDeviceTokenAndDelete(deviceData);
    let accessToken =  await  UniversalFunctions.generateAuthToken({_id:userData._id,email:userData.email,name:userData.email,role :APP_CONSTANTS.USER_ROLES.CUSTOMER});
    let updateCriteria = {_id:userData._id};
    let dataToSet ={
      accessToken:accessToken,
      deviceType  : deviceData.deviceType,
      deviceToken : deviceData.deviceToken,
      //otp         : otp,
    }
    let finalData    = await Service.CustomerService.updateData(updateCriteria,dataToSet,{new:true,lean:true});
    delete finalData.password; 
    delete finalData.__v; 
    return {customerData:finalData}
  }catch(err){ //console.log("==err====",err);
      throw err;
  }
}

const  login = async (payloadData)=> {  
  console.log(">>>>>>>payloadDatapayloadDatapayloadData>>>>>>>>>>>>>",payloadData)
  // payloadData.password= await UniversalFunctions.encryptPassword(payloadData.password);
  // console.log(payloadData.password,'---enc password----')
  let criteria  ={
    email:payloadData.email,
    // password:payloadData.password
  }; 
  let projection= {
    // password:0,
    __v:0
  };
  try {
    let deviceData={
      deviceType  : payloadData.deviceType,
      deviceToken : payloadData.deviceToken,
    }
    let userData    =   await Service.CustomerService.getData(criteria,projection,{lean:true});  //console.log("userData",userData);
    console.log(">>>>>>>userData>>>>>>>>>>>>>",userData)
    if(userData.length==0){
       throw APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_EMAIL_PASSWORD;
    }

    const decryptedPassword = await UniversalFunctions.decryptPassword(userData[0].password);
    console.log(decryptedPassword, '==============', payloadData.password);
    if(decryptedPassword != payloadData.password){
      throw APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_EMAIL_PASSWORD;
    }
    let checkDevice =  await  UniversalFunctions.checkDeviceTokenAndDelete(deviceData);
    let accessToken =  await  UniversalFunctions.generateAuthToken({_id:userData[0]._id,email:userData[0].email,name:userData[0].email,role :APP_CONSTANTS.USER_ROLES.CUSTOMER}); //console.log("accessToken",accessToken);
    let updateCriteria = {_id:userData[0]._id}
    let dataToSet ={
      accessToken:accessToken,
      updatedAt: new Date(),
    }
    if(payloadData.deviceToken){
      dataToSet.deviceToken  = payloadData.deviceToken;
      dataToSet.deviceType   = payloadData.deviceType;
    }
    let finalData = await Service.CustomerService.updateData(updateCriteria,dataToSet,{new:true}); 
    return {customerData:finalData}
  }catch(err){
    throw err;
  }
}

const  getUserByEmail = async (payloadData)=> {  
  // console.log(">>>>>>>payloadDatapayloadDatapayloadData>>>>>>>>>>>>>",payloadData)
  // payloadData.password= UniversalFunctions.encryptedPassword(payloadData.password);
  let criteria  ={
    email:payloadData.email   
  }; 
  let projection= {
    __v:0
  };
  try {
 
    let userData    =   await Service.CustomerService.getData(criteria,projection,{lean:true});  //console.log("userData",userData);
   
    if(userData.length==0){
       throw APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_EMAIL;
    } 
    

    userData[0].password= rev(userData[0].password);
    return {customerData:userData}
  }catch(err){
    throw err;
  }
}



const  loginWithGoogle = async (payloadData)=> { 
  let criteria  ={
    //googleId:payloadData.googleId
    email:payloadData.email
  }; 
  let projection= {
    password:0,__v:0
  };
  try {
    let deviceData={
      deviceType  : payloadData.deviceType,
      deviceToken : payloadData.deviceToken,
    }

    let criteria1  ={}
    if(payloadData.deviceType==DEVICE_TYPES.ANDROID){
      //criteria1.email= payloadData.email
      criteria1.googleId = {  $exists: true, $in: [ null] } 
    }else{
      criteria1.googleId=payloadData.googleId
    }
    // let criteria1  ={
    //   googleId:payloadData.googleId
    //   //email:payloadData.email
    // };
    let checkGoogleIdExistORNot    =   await Service.CustomerService.getData(criteria1,projection,{lean:true});
    let checkEmailExistORNot    =   await Service.CustomerService.getData(criteria,projection,{lean:true});   console.log("checkGoogleIdExistORNot",checkGoogleIdExistORNot,"checkEmailExistORNot",checkEmailExistORNot); //checkGoogleIdExistORNot
    let userData = [];
     
    if(checkEmailExistORNot.length==0 && checkGoogleIdExistORNot.length==0){  //console.log("if");
      payloadData.location = {
        type:"Point",
        coordinates:[payloadData.longitude || 0,payloadData.latitude || 0]
      }
      let insertData    =  await  Service.CustomerService.InsertData(payloadData);
      userData = [insertData]
    }else if(checkEmailExistORNot.length>0 && checkGoogleIdExistORNot.length==0){
      //console.log("else if",checkEmailExistORNot);
      userData = checkEmailExistORNot
    }else if(checkEmailExistORNot.length>0 && checkGoogleIdExistORNot.length>0){
      userData = checkEmailExistORNot
    }
    let checkDevice =  await  UniversalFunctions.checkDeviceTokenAndDelete(deviceData);
    let accessToken =  await  UniversalFunctions.generateAuthToken({_id:userData[0]._id,email:userData[0].email,name:userData[0].email,role :APP_CONSTANTS.USER_ROLES.CUSTOMER}); //console.log("accessToken",accessToken);
    let updateCriteria = {_id:userData[0]._id}
    let dataToSet ={
      accessToken:accessToken,
      updatedAt: new Date(),
      //googleId:payloadData.googleId
    }
    if(payloadData.deviceType!=DEVICE_TYPES.ANDROID){
      dataToSet.googleId = payloadData.googleId;
    }
    if(payloadData.deviceToken){
      dataToSet.deviceToken  = payloadData.deviceToken;
      dataToSet.deviceType   = payloadData.deviceType;
    }
    let finalData = await Service.CustomerService.updateData(updateCriteria,dataToSet,{new:true}); 
    return {customerData:finalData}
  }catch(err){
    throw err;
  }
}

const uploadBannerImage  = async (payloadData,UserData)=> {
  let document = payloadData.document;
  let imagePrefix = "banImage_";
  try{
    let dataImageArray=[]; 
    if(Array.isArray(document)==true){
      for(var i=0;i<document.length;i++){
        let imageList= await UniversalFunctions.uploadDocumentOnLocalMachine(document[i],{_id:1},imagePrefix+i+"_");  
        dataImageArray.push(imageList);
      }
    }else{
      let imageList= await UniversalFunctions.uploadDocumentOnLocalMachine(document,{_id:1},imagePrefix);
      dataImageArray.push(imageList);
    };  console.log("dataImageArray===",dataImageArray);
    let updateCriteria = {
      _id:UserData._id
    }
    let dataToSet = {};
    if(UserData.usertype == "0") {
      dataToSet ={
        bannerURL : {
          original:dataImageArray[0],
          thumbnail : dataImageArray[0]
        }
      };
    } else { 
      dataToSet ={
        bannerURLDating : {
          original:dataImageArray[0],
          thumbnail : dataImageArray[0]
        }
      };
    }

    let insertIntoDb = await Service.CustomerService.updateData(updateCriteria,dataToSet,{new:true}); 
          return insertIntoDb;
    //return dataImageArray;
  }catch(err){
     throw err;
  }
}

//const uploadFiles  = async(document,imagePrefix="catImage_")=>{
const uploadFiles  = async (payloadData,UserData)=> {
  let document = payloadData.document;
  let imagePrefix = "catImage_";
  try{
    let dataImageArray=[]; 
    if(Array.isArray(document)==true){
      for(var i=0;i<document.length;i++){
        let imageList= await UniversalFunctions.uploadDocumentOnLocalMachine(document[i],{_id:1},imagePrefix+i+"_");  
        dataImageArray.push(imageList);
      }
    }else{
      let imageList= await UniversalFunctions.uploadDocumentOnLocalMachine(document,{_id:1},imagePrefix);
      dataImageArray.push(imageList);
    };  console.log("dataImageArray===",dataImageArray);
    let updateCriteria = {
      _id:UserData._id
    }
    let dataToSet ={
      imageURL : {
        original:dataImageArray[0],
        thumbnail : dataImageArray[0]
      }
    };
    let insertIntoDb = await Service.CustomerService.updateData(updateCriteria,dataToSet,{new:true}); 
          return insertIntoDb;
    //return dataImageArray;
  }catch(err){
     throw err;
  }
}

const saveProfileData  = async (payloadData,UserData)=> {
  let updateCriteria = {
    _id:UserData._id
  }
  console.log("payloadData",payloadData);
  let finalData = await Service.CustomerService.updateData(updateCriteria,payloadData,{new:true}); 
    return {customerData:finalData}
}

const getProfile  = async (payloadData,UserData)=> {
  let updateCriteria = {
    _id:UserData._id
  }
  let finalData = await Service.CustomerService.getData(updateCriteria,{password:0,accessToken:0},{new:true}); 
  const topFriendCriteria = {
    userId : UserData._id,
    usertype: UserData.usertype
  }
  let topFriend = await Service.CustomerService.getTopFourFriendData(topFriendCriteria,{},{new:true}); 
    return {
      customerData:finalData[0] || {},
      topFourFriend : topFriend
    }

}


const getProfileofAnotherUser =async (payloadData,UserData)=> {
  let updateCriteria = {
    _id:payloadData.userId
  }
  let finalData = await Service.CustomerService.getData(updateCriteria,{password:0,accessToken:0,passwordResetToken:0,__v:0,location:0},{new:true}); 
  const topFriendCriteria = {
    userId : payloadData.userId,
    usertype: UserData.usertype
  }
  let topFriend = await Service.CustomerService.getTopFourFriendData(topFriendCriteria,{},{new:true}); 
  console.log(topFriend,'--topFriend--');
  
    return {
      customerData:finalData[0] || {},
      topFourFriend : topFriend
    }
    // return {customerData:finalData[0] || {}}

} 


const searchUser =async (payloadData,UserData)=> {
  let finalData = []
  let updateCriteria = {
     $or:[
       { fullName:{ $regex:payloadData.searchText} },
       { email:{ $regex:payloadData.searchText} }
     ]
  }
  let projection = {about:1,_id:1,city:1,state:1,about:1,country:1,email:1,fullName:1,imageURL:1}
  let options = {skip:payloadData.skip,limit:payloadData.limit,$sort:{fullName:1},lean:true}
  let queryResult= await Promise.all([
    Service.CustomerService.getData(updateCriteria,{_id:1},{}),
    Service.CustomerService.getData(updateCriteria,projection,options)
  ])
  let totalCount = queryResult[0].length || 0;

  let userList = JSON.parse(JSON.stringify(queryResult[1])) || []; 
   
  let lengthUserList = userList.length;
  for(let ik=0;ik<lengthUserList;ik++){
    let tempData = userList[ik];
    let isFriendRequestSend=false,isInvitationComming=false;
    let isFriend=false;
    let criteria = {
      isDeleted : false,
      "$or":[
        {
            "$and":[
                {customerFrom:UserData._id},
                { customerTo:tempData._id}
            ]
        },
        {
            "$and":[
              {customerFrom:tempData._id },
              { customerTo:UserData._id}
            ]
        }
      ]
    }
    let queryResult= await Service.FriendRequestService.getData(criteria,{},{});
    if(queryResult.length>0){
      //isFriendRequestSend=true;
      if(queryResult[0].status==FRIEND_REQUEST_TYPE.SEND  && queryResult[0]. customerFrom.toString()==UserData._id.toString()){
        isFriendRequestSend=true;
      }

      if(queryResult[0].status==FRIEND_REQUEST_TYPE.SEND  && queryResult[0].customerTo.toString()==UserData._id.toString()){
        isInvitationComming=true;
      }

      if(queryResult[0].status==FRIEND_REQUEST_TYPE.REJECTED ||  queryResult[0].status==FRIEND_REQUEST_TYPE.UNFRIEND){
        isFriendRequestSend=false;
      }

      if(queryResult[0].status==FRIEND_REQUEST_TYPE.ACCEPTED){
        isFriend=true;
      }
    }
    tempData.isFriendRequestSend=isFriendRequestSend;
    tempData.isInvitationComming=isInvitationComming;
    tempData.isFriend=isFriend;
    finalData.push(tempData);
  }
  return { 
    totalCount:totalCount,
    customerData:finalData 
  }
} 




const sendFriendRequest =async (payloadData,UserData)=> {
  if(payloadData.userToId.toString()==UserData._id.toString()){
    throw STATUS_MSG.ERROR.YOU_CAN_NOT_SEND_FRIEND_REQUEST_TO_OWN
  };//console.log("UserData",UserData);
  let customerToCriteria={_id:payloadData.userToId}
  let criteria = {
    "$or":[
      {
        "$and":[
            {customerFrom:UserData._id},
            { customerTo:payloadData.userToId}
        ]
      },
      {
        "$and":[
          {customerFrom:payloadData.userToId },
          { customerTo:UserData._id}
        ]
      }
    ],
    isDeleted:false
  }
  let queryResultAll= await Promise.all([
    Service.FriendRequestService.getData(criteria,{},{}),
    Service.CustomerService.getData(customerToCriteria,{deviceType:1,deviceToken:1},{lean:true}),
  ]);
  let queryResult= queryResultAll[0] || []; 
  //let queryResult= await Service.FriendRequestService.getData(criteria,{},{}); 
  let customerToData    =   queryResultAll[1] || []; 
     
     
  if(queryResult.length>0){
    if(queryResult[0].status==FRIEND_REQUEST_TYPE.SEND){
      throw STATUS_MSG.ERROR.YOU_ALREADY_SEND_FRIEND_REQUEST
    }

    if(queryResult[0].status==FRIEND_REQUEST_TYPE.ACCEPTED){
      throw STATUS_MSG.ERROR.THIS_USER_IS_ALREADY_FRIEND_IN_LIST
    }
    throw STATUS_MSG.ERROR.YOU_CAN_NOT_PERFORM_THIS_ACTION
  }
  let friendRequestData = {customerFrom:UserData._id,customerTo:payloadData.userToId}
  let insertData    =  await  Service.FriendRequestService.InsertData(friendRequestData);
  // if(customerToData.length>0){
  //   customerToData=JSON.parse(JSON.stringify(customerToData));
  //   if(customerToData[0].deviceToken){
  //     let pushNotificationData = {
  //       deviceToken:customerToData[0].deviceToken,
  //       fullName:UserData.fullName,
  //       message:UserData.fullName+" has sent friend request.",
  //       userData:{
  //         customerFrom:UserData._id,
  //         status:FRIEND_REQUEST_TYPE.SEND
  //       }
  //     }
  //     UniversalFunctions.sendNotificationUsingFCM(pushNotificationData);  
  //   }
  // }  
  console.log("NOTIFICATION_TYPE",NOTIFICATION_TYPE);
  sendPushAndSaveNotification(NOTIFICATION_TYPE.FRIEND_REQUEST_SEND,customerToData[0],UserData,'')
  return {}
} 

const acceptFriendRequest =async (payloadData,UserData)=> {
  let notificationMessage ="";
  let notificationType ="";
  let customerToCriteria={_id:payloadData.userToId}
  let criteria = {
    "$or":[
      {
          "$and":[
              {customerFrom:UserData._id},
              { customerTo:payloadData.userToId}
          ]
      },
      {
          "$and":[
            {customerFrom:payloadData.userToId },
            { customerTo:UserData._id}
          ]
      }
    ],
    isDeleted:false
  }
    try{
      let queryResultAll= await Promise.all([
        Service.FriendRequestService.getData(criteria,{},{lean:true}),
        Service.CustomerService.getData(customerToCriteria,{deviceType:1,deviceToken:1},{lean:true}),
      ]);
      let queryResult=queryResultAll[0] || [];
      let customerFromData = queryResultAll[1] || [];  //console.log("customerFromData",customerFromData);
      if(queryResult.length==0){
        throw STATUS_MSG.ERROR.NOT_FRIEND_REQUEST_FOUND
      }
      if(queryResult.length>0){
        if(payloadData.status== FRIEND_REQUEST_TYPE.ACCEPTED){
          if(queryResult[0].customerTo.toString()!=UserData._id.toString()){
            //console.log("UserData._id==348===",UserData._id);
            throw STATUS_MSG.ERROR.YOU_CAN_NOT_PERFORM_THIS_ACTION
          }
          if(queryResult[0].status==FRIEND_REQUEST_TYPE.ACCEPTED && payloadData.status== FRIEND_REQUEST_TYPE.ACCEPTED){
            throw STATUS_MSG.ERROR.YOU_ALREADY_ACCEPTED_REQUEST
          }
        }else if(payloadData.status== FRIEND_REQUEST_TYPE.REJECTED){
          if(queryResult[0].customerTo.toString()!=UserData._id.toString()){
            //console.log("UserData._id==348===",UserData._id);
            throw STATUS_MSG.ERROR.YOU_CAN_NOT_REJECTED_THIS_REQUEST
          }
          if(queryResult[0].status==FRIEND_REQUEST_TYPE.REJECTED && payloadData.status== FRIEND_REQUEST_TYPE.REJECTED){
            throw STATUS_MSG.ERROR.YOU_ALREADY_REJECTED_THIS_REQUEST
          }
          // if(queryResult[0].status!=FRIEND_REQUEST_TYPE.ACCEPTED){        
          //   throw STATUS_MSG.ERROR.YOU_CAN_NOT_PERFORM_THIS_ACTION
          // } 
        }else if(payloadData.status== FRIEND_REQUEST_TYPE.UNFRIEND){
          if(queryResult[0].status==FRIEND_REQUEST_TYPE.UNFRIEND && payloadData.status== FRIEND_REQUEST_TYPE.UNFRIEND){
            throw STATUS_MSG.ERROR.YOU_ALREADY_UNFRIEND_THIS_REQUEST
          }
          if(queryResult[0].status!=FRIEND_REQUEST_TYPE.ACCEPTED){        
            throw STATUS_MSG.ERROR.YOU_CAN_NOT_PERFORM_THIS_ACTION
          }      
        }else if(payloadData.status== FRIEND_REQUEST_TYPE.CANCELED){
          if(queryResult[0].customerFrom.toString()!=UserData._id.toString()){
            //console.log("UserData._id==348===",UserData._id);
            throw STATUS_MSG.ERROR.YOU_CAN_NOT_CANCELED_THIS_REQUEST
          }

          if(queryResult[0].status==FRIEND_REQUEST_TYPE.CANCELED && payloadData.status== FRIEND_REQUEST_TYPE.CANCELED){
            throw STATUS_MSG.ERROR.YOU_ALREADY_CANCELED_THIS_REQUEST
          }
        }
      }
      let criteria1= {
        //_id:payloadData.friendRequestId,
        _id:queryResult[0]._id,    
      }
      let dataToSet = {status:payloadData.status,updatedAt:Date()}

      if(payloadData.status==FRIEND_REQUEST_TYPE.ACCEPTED){
        dataToSet.acceptedAt =Date();
        notificationMessage =UserData.fullName+" has "+payloadData.status+" friend request",
        notificationType = FRIEND_REQUEST_TYPE.ACCEPTED
      }

      if(payloadData.status==FRIEND_REQUEST_TYPE.REJECTED){
        dataToSet.rejectedAt =Date();
        dataToSet.isDeleted=true;
        notificationMessage =UserData.fullName+" has "+payloadData.status+" friend request";
        notificationType = NOTIFICATION_TYPE.FRIEND_REQUEST_REJECTED
      }

      if(payloadData.status==FRIEND_REQUEST_TYPE.UNFRIEND){
        dataToSet.unfriendAt =Date();
        dataToSet.isDeleted=true;
        notificationMessage =UserData.fullName+" has "+payloadData.status+" friend request";
        notificationType = FRIEND_REQUEST_TYPE.UNFRIEND
      }

      if(payloadData.status==FRIEND_REQUEST_TYPE.CANCELED){
        dataToSet.canceledAt =Date();
        dataToSet.isDeleted=true;
        notificationMessage =UserData.fullName+" has "+payloadData.status+" friend request";
        notificationType = NOTIFICATION_TYPE.FRIEND_REQUEST_CANCELED
        
      }

      let insertData =  await Service.FriendRequestService.updateData(criteria1,dataToSet,{lean:true});
      // if(customerFromData.length>0){
      //   customerFromData=JSON.parse(JSON.stringify(customerFromData));
      //   if(customerFromData[0].deviceToken){
      //     let pushNotificationData = {
      //       deviceToken:customerFromData[0].deviceToken,
      //       fullName:UserData.fullName,
      //       message:notificationMessage,
      //       userData:{
      //         customerFrom:UserData._id,
      //         status:payloadData.status
      //       }
      //     }
      //     UniversalFunctions.sendNotificationUsingFCM(pushNotificationData);  
      //   }
      // }
    console.log("notificationMessage",notificationMessage,notificationType);  
    sendPushAndSaveNotification(notificationType,customerFromData[0],UserData,notificationMessage);
    return {}
  }catch(err){ 
      console.log("err",err);
      throw err;
  }
} 

const getFriendList =async (payloadData,UserData)=> {
  try{
    let friendList ={}
    if(payloadData.status==FRIEND_REQUEST_TYPE.ACCEPTED){
      friendList= await getAcceptedFriendList(payloadData,UserData);      
    }
    if(payloadData.status==FRIEND_REQUEST_TYPE.SEND){
      friendList= await getSendFriendList(payloadData,UserData);      
    }

    if(payloadData.status==FRIEND_REQUEST_TYPE.INVITATION){
      friendList= await getInvitationFriendList(payloadData,UserData);      
    }

    const topFriendCriteria = {
      userId : UserData._id
    }
    let topFriend = await Service.CustomerService.getTopFourFriendData(topFriendCriteria,{},{new:true}); 

    return {
      totalCount:friendList.totalCount || 0,
      friendList:friendList.friendList|| [],
      topFourFriendList:topFriend || [],
    }
  }catch(err){
    throw err;
  }
}

const getInvitationFriendList =async (payloadData,UserData)=> {
  try{
    let criteria = {
      "$or":[
        {
          customerTo:UserData._id
        }
      ],
      status:FRIEND_REQUEST_TYPE.SEND,
      isDeleted:false
    }
    let projection = {customerFrom:1,customerTo:1,_id:1}
    let queryResult= await Promise.all([
      Service.FriendRequestService.getData(criteria,{_id:1},{}),
      Service.FriendRequestService.getData(criteria,projection,{lean:true})
    ]);
    let friendRequestData = queryResult[1] || [];
    let friendRequestLength = friendRequestData.length;
    let FriendRequestId =[]
    for(var i=0;i<friendRequestLength;i++){
      if(UserData._id !=null && friendRequestData[i] && friendRequestData[i].customerFrom != null){
      if(UserData._id.toString()!=friendRequestData[i].customerFrom.toString()){
        FriendRequestId.push(friendRequestData[i].customerFrom.toString())
      }}
      if(UserData._id !=null &&friendRequestData[i] && friendRequestData[i].customerTo != null){
      if(UserData._id.toString()!=friendRequestData[i].customerTo.toString()){
        FriendRequestId.push(friendRequestData[i].customerTo.toString())
      }}
    }
    let totalCount = queryResult[0].length || 0;
    let criteria1 = {_id:{$in:FriendRequestId}}
    // let projection1 = {password:0,passwordResetToken:0,accessToken:0,deviceToken:0,location:0,__v:0,deviceType:0,isBlocked:0,isDeleted:0,otp:0,updatedAt:0,}
    let projection1 = {password:0,passwordResetToken:0,accessToken:0,location:0,__v:0,deviceType:0,isBlocked:0,isDeleted:0,otp:0,updatedAt:0,}
    let options = {skip:payloadData.skip,limit:payloadData.limit,$sort:{fullName:1},lean:true}
    let finalList= await  Service.CustomerService.getData(criteria1,projection1,options);  
    return {totalCount:totalCount,friendList:finalList} 
  }catch(err){
    throw err;
  }
} 

const getSendFriendList =async (payloadData,UserData)=> {
  try{
    let criteria = {
      "$or":[
        {
          customerFrom:UserData._id
        }
      ],
      status:FRIEND_REQUEST_TYPE.SEND,
      isDeleted:false
    }
    let projection = {customerFrom:1,customerTo:1,_id:1}
    let queryResult= await Promise.all([
      Service.FriendRequestService.getData(criteria,{_id:1},{}),
      Service.FriendRequestService.getData(criteria,projection,{lean:true})
    ]);
    let friendRequestData = queryResult[1] || [];
    let friendRequestLength = friendRequestData.length;
    let FriendRequestId =[]
    for(var i=0;i<friendRequestLength;i++){
      if(UserData._id.toString()!=friendRequestData[i].customerFrom.toString()){
        FriendRequestId.push(friendRequestData[i].customerFrom.toString())
      }
      if(UserData._id.toString()!=friendRequestData[i].customerTo.toString()){
        FriendRequestId.push(friendRequestData[i].customerTo.toString())
      }
    }
    let totalCount = queryResult[0].length || 0;
    let criteria1 = {_id:{$in:FriendRequestId}}
    // let projection1 = {password:0,passwordResetToken:0,accessToken:0,deviceToken:0,location:0,__v:0,deviceType:0,isBlocked:0,isDeleted:0,otp:0,updatedAt:0,}
    let projection1 = {password:0,passwordResetToken:0,accessToken:0,location:0,__v:0,deviceType:0,isBlocked:0,isDeleted:0,otp:0,updatedAt:0,}
    let options = {skip:payloadData.skip,limit:payloadData.limit,$sort:{fullName:1},lean:true}
    let finalList= await  Service.CustomerService.getData(criteria1,projection1,options);  
    return {totalCount:totalCount,friendList:finalList} 
  }catch(err){
    throw err;
  }
} 

const getAcceptedFriendList =async (payloadData,UserData)=> {
  try{
    let criteria = {
      "$or":[
        {
          customerFrom:UserData._id
        },
        {
          customerTo:UserData._id
        }
      ],
      status:FRIEND_REQUEST_TYPE.ACCEPTED,
      isDeleted:false
    }
    let projection = {customerFrom:1,customerTo:1,_id:1}
    let queryResult= await Promise.all([
      Service.FriendRequestService.getData(criteria,{_id:1},{}),
      Service.FriendRequestService.getData(criteria,projection,{lean:true})
    ]);
    let friendRequestData = queryResult[1] || [];
    let friendRequestLength = friendRequestData.length;
    let FriendRequestId =[]
    for(var i=0;i<friendRequestLength;i++){
      if(UserData._id !=null && friendRequestData[i] && friendRequestData[i].customerFrom != null){
        if(UserData._id.toString()!=friendRequestData[i].customerFrom.toString()){
          FriendRequestId.push(friendRequestData[i].customerFrom.toString())
        }}
        if(UserData._id !=null &&friendRequestData[i] && friendRequestData[i].customerTo != null){
        if(UserData._id.toString()!=friendRequestData[i].customerTo.toString()){
          FriendRequestId.push(friendRequestData[i].customerTo.toString())
        }}
    }
    let totalCount = queryResult[0].length || 0;
    let criteria1 = {_id:{$in:FriendRequestId}}
    // let projection1 = {password:0,passwordResetToken:0,accessToken:0,deviceToken:0,location:0,__v:0,deviceType:0,isBlocked:0,isDeleted:0,otp:0,updatedAt:0,}
    let projection1 = {password:0,passwordResetToken:0,accessToken:0,location:0,__v:0,deviceType:0,isBlocked:0,isDeleted:0,otp:0,updatedAt:0,}
    let options = {skip:payloadData.skip,limit:payloadData.limit,$sort:{createdAt:-1},lean:true}
    let finalList= await  Service.CustomerService.getData(criteria1,projection1,options);  
    return {totalCount:totalCount,friendList:finalList.reverse()} 
  }catch(err){
    throw err;
  }
} 

const commentOnOff  = async (payloadData,UserData)=> {
  try{
    let criteria = {_id:UserData._id};
    // let pojection = {accessToken:0,__v:0,password:0,location:0,otp:0,deviceType:0,deviceToken:0,isDeleted:0}
    let dataToSet = {commentOnOff:payloadData.commentOnOff}
    // let options = {lean:true};
    // let queryResult= await Service.CustomerService.getData(criteria,{_id:1},{});
    let update = await Service.CustomerService.updateData(criteria,dataToSet,{lean:true});
    return {}
  }catch(err){
    throw err;
  }  
}

const autoRefresh  = async (payloadData,UserData)=> {
  try{
    let criteria = {_id:UserData._id};
    // let pojection = {accessToken:0,__v:0,password:0,location:0,otp:0,deviceType:0,deviceToken:0,isDeleted:0}
    let dataToSet = {autoRefresh:payloadData.autoRefresh}
    // let options = {lean:true};
    // let queryResult= await Service.CustomerService.getData(criteria,{_id:1},{});
    let update = await Service.CustomerService.updateData(criteria,dataToSet,{lean:true});
    return {}
  }catch(err){
    throw err;
  }  
}

const updateWallpaperData  = async (payloadData, UserData)=> {
  try{
    let criteria = {_id:UserData._id};
    // let pojection = {accessToken:0,__v:0,password:0,location:0,otp:0,deviceType:0,deviceToken:0,isDeleted:0}
    let dataToSet = {wallpaper:payloadData.wallpaper}
    // let options = {lean:true};
    // let queryResult= await Service.CustomerService.getData(criteria,{_id:1},{});
    let update = await Service.CustomerService.updateData(criteria,dataToSet,{lean:true});
    return {}
  }catch(err){
    throw err;
  }  
}

const updateUserVideo  = async (payloadData, UserData)=> {
  try{
    let criteria = {_id:UserData._id};
    // let pojection = {accessToken:0,__v:0,password:0,location:0,otp:0,deviceType:0,deviceToken:0,isDeleted:0}
    // let dataToSet = {
    //   userVideo:payloadData.userVideo,
    //   userVideoThumbnail:payloadData.userVideoThumbnail,
    // }
    let dataToSet = payloadData;
    // let options = {lean:true};
    // let queryResult= await Service.CustomerService.getData(criteria,{_id:1},{});
    let update = await Service.CustomerService.updateData(criteria,dataToSet,{lean:true});
    return {}
  }catch(err){
    throw err;
  }  
}

const addTopFourFriend  = async (payloadData, UserData)=> {
  try{
    console.log(payloadData);
    /* let friendList = [
      {
        "userId" : "65491160e0008b67384d6471",
        "friendId" : "659b27c3b3419034ec52bf56",
        "friendName" : "name here..",
        "friendImage" : "image url"
      },
      {
        "userId" : "65491160e0008b67384d6471",
        "friendId" : "6561a8b83b3d426eb77671f6",
        "friendName" : "name here..",
        "friendImage" : "image url"
      }
    ] */
    let criteria = {userId:UserData._id};
    await Service.CustomerService.deleteOldTopFourFriend(criteria);
    let requestData = payloadData.friendList;
    console.log( requestData,'---requestData--1111111111111111111-');
    requestData = JSON.parse(requestData);
    console.log( requestData,'---requestData-22222222222222222--');
    // let pojection = {accessToken:0,__v:0,password:0,location:0,otp:0,deviceType:0,deviceToken:0,isDeleted:0}
    // let dataToSet = {userVideo:payloadData.userVideo}
    // let options = {lean:true};
    // let queryResult= await Service.CustomerService.getData(criteria,{_id:1},{});
    for(let i in requestData){
      await Service.CustomerService.InsertTopFourFriendData(requestData[i]);
    }
    return {}
  }catch(err){
    throw err;
  }  
}

const addTopFourImage = async (payloadData, UserData) => {
  try {
      console.log(payloadData);

      // Parse the request data
      let requestData = JSON.parse(payloadData.image);
      console.log(requestData, '---requestData--');

      // Update criteria
      let criteria = { _id: UserData._id };

      // Update the document in the database
      await Service.CustomerService.updateData(
          criteria,
          {
              $set: UserData.usertype == "0" ? { topFourImage: requestData } : { topFourImageDating: requestData }
          },
          { new: true } // Set to true to return the modified document
      );

      return {};
  } catch (err) {
      throw err;
  }
};

const addTopFourImageOld = async (payloadData, UserData) => {
  try {
      console.log(payloadData);

      // Parse the request data
      let requestData = JSON.parse(payloadData.image);
      console.log(requestData, '---requestData--');

      // Update criteria
      let criteria = { _id: UserData._id };

      // Update the document in the database
      await Service.CustomerService.updateData(
          criteria,
          {
              $set: { topFourImage: requestData }
          },
          { new: true } // Set to true to return the modified document
      );

      return {};
  } catch (err) {
      throw err;
  }
};


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
    let updatePassWord    = await Service.CustomerService.updateData(criteria,dataToSet,options);
    return {};
  }catch(err){
    throw err;
  }
};

let changePassword = async (payloadData,UserData)=> { //console.log("==payloadData==",payloadData);
  try{
   let  criteria = {_id: UserData._id }; 
  //  let encryptedPassword = UniversalFunctions.encryptedPassword(payloadData.oldPassword);
  //  let encryptedPassword = await UniversalFunctions.encryptPassword(payloadData.oldPassword);
  //  let encryptedPassword = payloadData.oldPassword;
   let restaurantData = await Service.CustomerService.getData(criteria,{},{lean:true}); //console.log("restaurantData",restaurantData);
    if(restaurantData.length==0){
      throw STATUS_MSG.ERROR.NOT_FOUND;
    }

    const dbPass = await UniversalFunctions.decryptPassword(restaurantData[0].password);
    console.log(dbPass,'--dbPass--');
    // console.log(encryptedPassword,'--encryptedPassword--');
    // if(restaurantData[0].password!=encryptedPassword){
    if(dbPass != payloadData.oldPassword){
      throw STATUS_MSG.ERROR.INCORRECT_OLD_PASS;
    }
    let  dataToSet = {
      password: await UniversalFunctions.encryptPassword(payloadData.newPassword)
    };
    let updatePassWord    = await Service.CustomerService.updateData(criteria,dataToSet,{new:true,lean:true});//console.log("servingLocation",servingLocation);
    delete updatePassWord.password;
    delete updatePassWord.__v;
    return {customerData: updatePassWord};
  }catch(err){
    throw err;
  }
};

let verifyOtp = async (payloadData)=> { //
  try{
   let  criteria = {email: payloadData.email}; 
    
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
    let  criteria = {email: payloadData.email }; 
    let userData      = await Service.CustomerService.getData(criteria,{},{lean:true}); //console.log("restaurantData",restaurantData);
    if(userData.length==0){
      throw STATUS_MSG.ERROR.NOT_FOUND;
    }
    console.log(userData,'---userData---');
    let  uniqueCode = Math.floor(1000 + Math.random() * 9000);
    let dataToSet = {
      otp: uniqueCode,
      updatedAt: new Date().toISOString()     
    };
  //  let updatePassWord    = await Service.CustomerService.updateData(criteria,dataToSet,{new:true});

  //  let templatepath      = Path.join(__dirname, '../emailTemplates/');
  //   let fileReadStream   =  templatepath + 'forgotPassword.html'; 
  //   let emailTemplate    = await readFilePromise(fileReadStream); 
  //   emailTemplate        = emailTemplate.toString();
    
  //   let userName          = "Test";
  //   let resetPasswordLink = "Test";
    //console.log("resetPasswordLink",resetPasswordLink);
    
    // let sendStr = emailTemplate.replace('{{name}}', userName).replace('{{path}}',resetPasswordLink);

   
    // let senderEmailData = { // set email variables for user
    //     to: payloadData.email,
    //     //from: 'JayDeeApp <' + Configs.CONSTS.noReplyEmail  + '>',
    //     from: 'JayDeeApp ',
    //     subject: 'Hire Tradie- JayDeeApp',
    //     html: sendStr
    //   };
      //UniversalFunctions.sendEmailUsingGmail(senderEmailData);
       
   
  //  return { 
  //     //updatePassWord:updatePassWord,
  //     otp:uniqueCode 
  //   };

  const decryptedPassword = await UniversalFunctions.decryptPassword(userData[0].password)
  const email = userData[0].email;
    console.log(userData[0].password, '<<<<<<==========', decryptedPassword,'<<<<=====decryptedPassword--', email,"<<<<<<<==========")
  let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: `https://unpokedfolks.com/api/Customer/ForgotPasswrd?email=${userData[0].email}&password=${decryptedPassword}`,
    headers: { }
  };
  
  axios.request(config)
  .then((response) => {
    console.log(JSON.stringify(response.data));
    console.log(response.data,'---data---');
  })
  .catch((error) => {
    console.log(error);
  });
  }catch(err){
     throw err;
  }
}

let resetPassword = async (payloadData)=>{
  let  criteria = {passwordResetToken:payloadData.passwordResetToken }; 
  let restaurantData = null;
  try{
    let getRestaurantDetail =  await Service.CustomerService.getData(criteria,{},{lean:true}); 
    if(getRestaurantDetail.length==0) throw STATUS_MSG.ERROR.NOT_FOUND;
    restaurantData = getRestaurantDetail[0];
    
    if(restaurantData.passwordResetToken!=payloadData.passwordResetToken) throw STATUS_MSG.ERROR.INVALID_OTP;
    let dataToSet = {
        $set:{ password: await UniversalFunctions.encryptPassword(payloadData.newPassword),},
        $unset: {passwordResetToken: 1,otpCode:1}
    }; 
    let updatePassWord    = await Service.CustomerService.updateData(criteria,dataToSet,{new:true});
    return {};
  }catch(err){
     throw err;
  }    
};


const sendPushAndSaveNotification = async(notificatioType,receiverDetails,senderDetails,notificationMessageP)=>{
  
  console.log("\n\n\n\n","notificatioType",notificatioType,"\n\n\n\n");
  // let notificationMessage = "";
  if(notificationMessageP!=''){
    notificationMessage =notificationMessageP; 
  }else if(notificatioType==FRIEND_REQUEST_TYPE.SEND ){
    notificationMessage = senderDetails.fullName+" has sent friend request.";
  } else if(notificatioType.toString()==NOTIFICATION_TYPE.FRIEND_REQUEST_SEND.toString()){
    notificationMessage = senderDetails.fullName+" has sent friend request.";
  }

  if(receiverDetails.deviceToken){
    let pushNotificationData = {
      deviceToken:receiverDetails.deviceToken,
      fullName:senderDetails.fullName,
      message:notificationMessage,
      userData:{
        customerFrom:senderDetails._id,
        status:notificatioType
      }
    } //console.log( "pushNotificationData",pushNotificationData);
    UniversalFunctions.sendNotificationUsingFCM(pushNotificationData); 
  }
  let dbNotificationType="";
  
  console.log("\n\n\n\n\n", "notificatioType",notificatioType,"\n\n\n\n\n");

  if(notificatioType==FRIEND_REQUEST_TYPE.ACCEPTED){    
    dbNotificationType = NOTIFICATION_TYPE.FRIEND_REQUEST_ACCEPTED; 
    console.log("dbNotificationType803==== ",notificatioType,dbNotificationType)           
  }

  if(notificatioType==NOTIFICATION_TYPE.FRIEND_REQUEST_SEND){
    dbNotificationType = NOTIFICATION_TYPE.FRIEND_REQUEST_SEND;            
  }

  if(notificatioType==NOTIFICATION_TYPE.FRIEND_REQUEST_CANCELED){
    dbNotificationType = NOTIFICATION_TYPE.FRIEND_REQUEST_CANCELED;            
  }
  if(notificatioType==NOTIFICATION_TYPE.FRIEND_REQUEST_REJECTED){
    dbNotificationType = NOTIFICATION_TYPE.FRIEND_REQUEST_REJECTED; 
    console.log("dbNotificationType815==== ",notificatioType,dbNotificationType)           
  }
  if(notificatioType==FRIEND_REQUEST_TYPE.UNFRIEND){
    dbNotificationType = NOTIFICATION_TYPE.FRIEND_REQUEST_UNFRIEND;            
  }

  /*else if(notificatioType==FRIEND_REQUEST_TYPE.REJECTED){
    dbNotificationType = NOTIFICATION_TYPE.FRIEND_REQUEST_REJECTED;            
  }else if(notificatioType==FRIEND_REQUEST_TYPE.UNFRIEND){
    dbNotificationType = NOTIFICATION_TYPE.FRIEND_REQUEST_UNFRIEND;            
  }else if(notificatioType==FRIEND_REQUEST_TYPE.INVITATION){
    dbNotificationType =NOTIFICATION_TYPE.FRIEND_REQUEST_INVITATION;            
  }else if(notificatioType==FRIEND_REQUEST_TYPE.CANCELED){
    dbNotificationType = NOTIFICATION_TYPE.FRIEND_REQUEST_CANCELED;            
  }else if(notificatioType==FRIEND_REQUEST_TYPE.SEND){
    dbNotificationType = NOTIFICATION_TYPE.FRIEND_REQUEST_SEND;            
  }*/
  
  //console.log("\n\n\n\n\n", "dbNotificationType",dbNotificationType,"\n\n\n\n\n");

  let notificationData = {
    senderId:senderDetails._id,
    receiverId:receiverDetails._id,
    textMessage:notificationMessage,
    notificationType:dbNotificationType,
  };
  //console.log("notificationData \n\n",notificatioType,"dbNotificationType",dbNotificationType);
  await Service.NotificationService.InsertData(notificationData);
  // return {}
}

module.exports ={
  registration   : registration,
  login          : login,
  loginWithGoogle:loginWithGoogle,
  logout         : logout,
  changePassword : changePassword,
  verifyOtp      : verifyOtp,
  forgotPassword : forgotPassword,
  resetPassword  : resetPassword,
  uploadFiles:uploadFiles,
  saveProfileData:saveProfileData,
  getProfile:getProfile,
  getProfileofAnotherUser:getProfileofAnotherUser,
  searchUser:searchUser,
  sendFriendRequest:sendFriendRequest,
  acceptFriendRequest:acceptFriendRequest,
  getFriendList:getFriendList,
  getUserByEmail:getUserByEmail,
  uploadBannerImage,
  commentOnOff,
  updateWallpaperData,
  autoRefresh,
  updateUserVideo,
  addTopFourFriend,
  addTopFourImage
}