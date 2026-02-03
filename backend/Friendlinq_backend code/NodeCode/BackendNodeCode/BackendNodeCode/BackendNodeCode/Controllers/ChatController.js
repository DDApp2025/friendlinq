/**
 * Created by Anurag on 13/04/2020.
 */
const Path = require('path');
const _ = require('underscore');
//const fs = require('fs').promises;
//const readFilePromise = require('fs-readfile-promise');
const Mongoose = require('mongoose');

const FCM = require('fcm-node');

const Service = require('../Services');
const Models  = require('../Models');
const Config = require('../Config');
const UniversalFunctions      = require('../Utils/UniversalFunctions');


const APP_CONSTANTS   =  Config.APP_CONSTANTS;
const DEVICE_TYPES    =  APP_CONSTANTS.DEVICE_TYPES;
//const ALLOWED_DOC_EXT_DRIVER    =  APP_CONSTANTS.ALLOWED_DOC_EXT_DRIVER;
const STATUS_MSG              =  APP_CONSTANTS.STATUS_MSG;
const DOCUMENT_FILE_SIZE = APP_CONSTANTS.DOCUMENT_FILE_SIZE;
const SOCIAL_MODE_TYPE        =  APP_CONSTANTS.SOCIAL_MODE_TYPE;
const NOTIFICATION_TYPE  =  APP_CONSTANTS.NOTIFICATION_TYPE;

var FCM_KEY =  APP_CONSTANTS.FCM_KEY;

const generateChatRoomId = async (payloadData,UserData)=> {

  try{

    let criteria ={
      "$or":[
       {
           "$and":[{"senderId":UserData._id},
               {"receiverId":payloadData.receiverId}
           ]
       },
       {
           "$and":[{"senderId":payloadData.receiverId},
               {"receiverId":UserData._id}
           ]
       }
     ]
   };
   let checkChatRoomIdExistsORNOt = await  Service.ChatRoomService.getData(criteria,{},{lean:true});
   if(checkChatRoomIdExistsORNOt.length>0){
     //console.log("checkChatRoomIdExistsORNOt",checkChatRoomIdExistsORNOt);
     payloadData.chatRoomId =checkChatRoomIdExistsORNOt[0]._id;
     return {chatRoomId:payloadData.chatRoomId}
   }else{
     let generateChatRoom =await  Service.ChatRoomService.InsertData({
      senderId:UserData._id,
      receiverId:payloadData.receiverId,
     });
     payloadData.chatRoomId =generateChatRoom._id;//console.log("generateChatRoom",generateChatRoom);
     return {chatRoomId:payloadData.chatRoomId}
   }
  }catch(err){  //console.log("err",err);
    throw err;
  }
}

const sendMessage  = async (payloadData,UserData)=> {
    try{
      if(!payloadData.chatRoomId){
        let roomData = await generateChatRoomId(payloadData,UserData);
        console.log("chatRoomId",roomData);
        payloadData.chatRoomId = roomData.chatRoomId;

      }
      payloadData.senderId=UserData._id;
      let criteria = {_id:payloadData.receiverId};
      let projection = {deviceToken:1,deviceType:1}
      let receiverData    =   await Service.CustomerService.getData(criteria,projection,{lean:true});
      let chatData     =  await Service.ChatService.InsertData(payloadData); 
      let notificationText = UserData.fullName+" has sent you a message.";
      let notification =  await Service.NotificationService.InsertData({
        senderId:UserData._id,
        receiverId:payloadData.receiverId,
        textMessage:notificationText,
        notificationType:NOTIFICATION_TYPE.NEW_MESSAGE_SEND,
      }); 
      if(receiverData.length> 0 && receiverData[0].deviceToken){
        let pushNotificationData = {
          deviceToken:receiverData[0].deviceToken,
          fullName:UserData.fullName,
          message:notificationText,
          userData:{
            customerFrom:UserData._id,
            customerName:UserData.fullName,
            customerImage:UserData.imageURL.original || '',
            status:'New Message',
            type:'New Message'
          }
        }
        UniversalFunctions.sendNotificationUsingFCM(pushNotificationData);  
      }

      return {chatData:chatData}
    }catch(err){  //console.log("err",err);
       throw err;
    }
}


const getChatMessage  = async (payloadData,UserData)=> {
  let criteria ={
      "$or":[
      {
          "$and":[{"senderId":UserData._id},
              {"receiverId":payloadData.receiverId}
          ]
      },
      {
          "$and":[{"senderId":payloadData.receiverId},
              {"receiverId":UserData._id}
          ]
      }
    ]
  };
  try{
    let projection={__v:0};
    let option={
        skip:payloadData.skip,
        limit:payloadData.limit,
        lean:true,
        sort:{messageAutoIncrementId:1}
    };
    let collectionOptions =[
        {
            path: 'receiverId',
            model: 'customer',
            select: '_id fullName imageURL email countryCode mobileNumber deviceToken',
            options: {lean: true}
        },
        {
            path: 'senderId',
            model: 'customer',
            select: '_id fullName imageURL email countryCode mobileNumber deviceToken',
            options: {lean: true}
        }
    ];
    let queryResult= await Promise.all([
        await Service.ChatService.getData(criteria,projection,{}),
        await Service.DAOService.getDataWithReferenceFixed(Models.Chat,criteria,projection,option,collectionOptions),
    ]); //console.log("queryResult",queryResult);
    let chatData    =   queryResult[1] || [];
    let totalRecord        =   queryResult[0].length || 0;
    return {
        totalCount:totalRecord,
        chatData:chatData
    };
  }catch(err){  //console.log("err",err);
      throw err;
  }

}

const chatMedia  = async (payloadData,UserData)=> { 
  if(payloadData.isMediaTypeVideo && payloadData.isMediaTypeAudio){
    throw STATUS_MSG.ERROR.PLEASE_SELECT_ONE_VIDEO_AUDIO;
  }
  let document = payloadData.mediaFile;
  let imagePrefix = "chatFile_";
  let videoThumbnailPrefix = "videoThumbnail_";  
  try{
    if(!payloadData.chatRoomId){
      let roomData = await generateChatRoomId(payloadData,UserData);
      console.log("chatRoomId",roomData);
      payloadData.chatRoomId = roomData.chatRoomId;
    }

    let dataImageArray=[],videoThumbnailArray = [];      
    if ( typeof payloadData.mediaFile== 'undefined')
    {
      throw STATUS_MSG.ERROR.INVALID_FILE;
    }
    if(Array.isArray(document)==true){
      for(var i=0;i<document.length;i++){
        let imageList= await UniversalFunctions.uploadDocumentOnLocalMachineUsingFile(document[i],{_id:1},imagePrefix+i+"_");  
        dataImageArray.push(imageList);
      }
    }else{ 
      if(payloadData.isMediaTypeVideo){
        if(document['_data'].length>DOCUMENT_FILE_SIZE.VIDEO_SIZE){
          throw STATUS_MSG.ERROR.VIDEO_SIZE_LIMIT;
        }
      }else{
        if(document['_data'].length>DOCUMENT_FILE_SIZE.IMAGE_SIZE){
          throw STATUS_MSG.ERROR.IMAGE_SIZE_LIMIT;
        }
      }      
      let imageList= await UniversalFunctions.uploadDocumentOnLocalMachineUsingFile(document,{_id:1},imagePrefix);
      dataImageArray.push(imageList);
      if(payloadData.isMediaTypeVideo){
        if (typeof payloadData.videoThumbnail!='undefined')
        {
          let videoThumbnailList= await UniversalFunctions.uploadDocumentOnLocalMachineUsingFile(payloadData.videoThumbnail,{_id:1},videoThumbnailPrefix);
          videoThumbnailArray.push(videoThumbnailList); 
        }        
      }
    };  console.log("dataImageArray===",dataImageArray);
  
    let dataToSet ={
        textMessage:null,
        senderId:UserData._id,
        receiverId:payloadData.receiverId,
        chatRoomId:payloadData.chatRoomId,     
    };      
    if(payloadData.isMediaTypeVideo){
      dataToSet.videoURL = dataImageArray[0];
      if(videoThumbnailArray.length>0){
        dataToSet.videoThumbnailUrl = {
          original:videoThumbnailArray[0] ,
          thumbnail : videoThumbnailArray[0]
        } 
      }          
    }else if(payloadData.isMediaTypeAudio){
      dataToSet.audioURL = dataImageArray[0];          
    }else{
      dataToSet.imageURL = {
        original:dataImageArray[0],
        thumbnail : dataImageArray[0]
      }
    }
    let criteria = {_id:payloadData.receiverId};
    let projection = {deviceToken:1,deviceType:1};
    let receiverData    =   await Service.CustomerService.getData(criteria,projection,{lean:true});
    let insertIntoDb = await Service.ChatService.InsertData(dataToSet); 
    let notificationText = UserData.fullName+" has sent you a message.";
    let notification =  await Service.NotificationService.InsertData({
      senderId:UserData._id,
      receiverId:payloadData.receiverId,
      textMessage:notificationText,
      notificationType:NOTIFICATION_TYPE.NEW_MESSAGE_SEND,
    }); 
    if(receiverData.length> 0 && receiverData[0].deviceToken){
      let pushNotificationData = {
        deviceToken:receiverData[0].deviceToken,
        fullName:UserData.fullName,
        message:notificationText,
        userData:{
          customerFrom:UserData._id,
          customerName:UserData.fullName,
          customerImage:UserData.imageURL.original || '',
          status:'New Message',
          type:'New Message'
        }
      }
      UniversalFunctions.sendNotificationUsingFCM(pushNotificationData);  
    }
    return insertIntoDb;
  }catch(err){
      throw err;
  }
}

const sendNotificationTest  = async(payloadData)=> {
    try{
        console.log("payloadData",payloadData);
        await UniversalFunctions.sendNotificationUsingFCM(payloadData);
        return {}
    }catch(err){ 
        console.log("err",err);
        throw err;
    }
}

const sendSMS  = async(payloadData)=> {
  try{
      console.log("payloadData",payloadData);
      await UniversalFunctions.sendSMS(payloadData);
      return {}
  }catch(err){ 
      console.log("err",err);
      throw err;
  }
}


const getNotification  = async (payloadData,UserData)=> {
  let criteria ={"receiverId":UserData._id};
  let unViewCriteria ={"receiverId":UserData._id,isView:false};
  let unReadCriteria ={"receiverId":UserData._id,isRead:false};
  try{
      let projection={__v:0};
      let option={
          skip:payloadData.skip,
          limit:payloadData.limit,
          lean:true,
          sort:{createdAt:-1}
      };
      let collectionOptions =[
          // {
          //     path: 'receiverId',
          //     model: 'customer',
          //     select: '_id fullName imageURL email countryCode mobileNumber',
          //     options: {lean: true}
          // },
          {
              path: 'senderId',
              model: 'customer',
              select: '_id fullName imageURL email countryCode mobileNumber',
              options: {lean: true,sort:{createdAt:-1}}
          }
      ];
      let queryResult= await Promise.all([
        Service.NotificationService.getData(criteria,projection,{}),
        Service.NotificationService.getData(unViewCriteria,projection,{}),
        Service.NotificationService.getData(unReadCriteria,projection,{}),

        Service.DAOService.getDataWithReferenceFixed(Models.Notification,criteria,projection,option,collectionOptions),
      ]); //console.log("queryResult",queryResult);
      
      let totalRecord        =   queryResult[0].length || 0;
      let totalUnView        =   queryResult[1].length || 0;
      let totalUnRead        =   queryResult[2].length || 0;
      let chatData    =   queryResult[3] || [];
      return {
          totalCount:totalRecord,
          totalUnView:totalUnView,
          totalUnRead:totalUnRead,
          notificationData:chatData
      };
  }catch(err){  //console.log("err",err);
      throw err;
  }

}


const viewAllNotification  = async (payloadData,UserData)=> {
  let criteria ={"receiverId":UserData._id};
  try{
      let Data = await Service.NotificationService.updateMultipleDocuments(criteria,{isView:1},{lean:true});
      return {_id:UserData._id};
  }catch(err){  //console.log("err",err);
      throw err;
  }

}

const readNotification  = async (payloadData,UserData)=> {
  let criteria ={"receiverId":UserData._id,_id:payloadData.notificationId};
  console.log("criteria",criteria);
  try{
      let Data = await Service.NotificationService.updateMultipleDocuments(criteria,{isRead:1},{lean:true});
      return {_id:UserData._id};
  }catch(err){  //console.log("err",err);
      throw err;
  }
}

module.exports ={
  generateChatRoomId:generateChatRoomId,
  sendMessage   : sendMessage,
  getChatMessage :getChatMessage,
  chatMedia:chatMedia,
  getNotification:getNotification,
  viewAllNotification:viewAllNotification,
  readNotification:readNotification,
  sendNotificationTest:sendNotificationTest,
  sendSMS : sendSMS
 
}