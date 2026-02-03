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
const PostController = require('./PostController');
const { LIKE_TYPE } = require('../Config/AppConstants');

const APP_CONSTANTS   =  Config.APP_CONSTANTS;
const DEVICE_TYPES    =  APP_CONSTANTS.DEVICE_TYPES;
//const ALLOWED_DOC_EXT_DRIVER    =  APP_CONSTANTS.ALLOWED_DOC_EXT_DRIVER;
const STATUS_MSG              =  APP_CONSTANTS.STATUS_MSG;
const DOCUMENT_FILE_SIZE = APP_CONSTANTS.DOCUMENT_FILE_SIZE;
const SOCIAL_MODE_TYPE        =  APP_CONSTANTS.SOCIAL_MODE_TYPE;
const RIDE_INVITATION_STATUS  =  APP_CONSTANTS.RIDE_INVITATION_STATUS;

 
const NOTIFICATION_TYPE  =  APP_CONSTANTS.NOTIFICATION_TYPE;


const createGroup = async (payloadData,UserData)=> {
  try{
    let criteria ={
      groupAdminId:UserData._id,
      groupName:payloadData.groupName,
      isDeleted:false,
   };
  let checkGroupExistsORNOt = await  Service.PostGroupService.getData(criteria,{},{lean:true});
  
  if(checkGroupExistsORNOt.length>0){
    throw STATUS_MSG.ERROR.GROUP_NAME_ALREADY_EXISTS
  }

  // let dataImageArray = [];

  // let document = payloadData.groupIcon;
  // let imagePrefix = "gruppostImage_";

  // let imageList= await UniversalFunctions.uploadDocumentOnLocalMachineUsingFile(document,{_id:1},imagePrefix);
  // dataImageArray.push(imageList);
  // let imageURL = {
  //   original:dataImageArray[0],
  //   thumbnail : dataImageArray[0]
  // };
    if(UserData.email){
      UniversalFunctions.sendSMS({
        message : "HI MK, "+UserData.email+" created a new group in our app"
      });
    }
    let groupInsert = await  Service.PostGroupService.InsertData({
        groupAdminId  :  UserData._id,
        groupName     :  payloadData.groupName,
        // groupIcon     :  imageURL
    });

     let memberData    =  await  Service.PostGroupMemberService.InsertData({
      groupId:groupInsert._id,
      groupMemberId:UserData._id,
      memberType:'Admin',
    }); 
     return {group:groupInsert}
   
  }catch(err){  //console.log("err",err);
    throw err;
  }
}

const updateGroupIcon = async (payloadData,UserData)=> {
  try{
    let dataImageArray = [];

    let document = payloadData.groupIcon;
    let imagePrefix = "groupPostImage_";

    let imageList= await UniversalFunctions.uploadDocumentOnLocalMachineUsingFile(document,{_id:1},imagePrefix);
    dataImageArray.push(imageList);
    let imageURL = {
      original:dataImageArray[0],
      thumbnail : dataImageArray[0]
    };
    let updateCriteria1 = { _id : payloadData.id }; 
    let postDataToSet= {
      "groupIcon": imageURL
    };
    let incUpdate= await Service.PostGroupService.updateData(updateCriteria1,postDataToSet,{new:true});
    
    return {group:incUpdate}
   
  }catch(err){  //console.log("err",err);
    throw err;
  }
}


const addMember  = async (payloadData,UserData)=> {
  try{
    let groupCriteria = {
      _id:payloadData.groupId,
      //groupMemberId:payloadData.memberId,
      isDeleted:false
    }
    let memberCriteria = {
      groupId:payloadData.groupId,
      groupMemberId:payloadData.memberId,
      isDeleted:false
    }
    let queryResult= await Promise.all([
      Service.PostGroupMemberService.getData(memberCriteria,{},{lean:true}),
      Service.PostGroupService.getData(groupCriteria,{},{lean:true})
    ])
    //let checkMemberExistOrNot= await Service.PostGroupMemberService.getData(memberCriteria,{},{lean:true});
    let checkMemberExistOrNot= queryResult[0] || [];
    let groupData = queryResult[1] || [];
    if(groupData.length==0){
      throw STATUS_MSG.ERROR.INVALID_GROUP_ID
    }
    if(checkMemberExistOrNot.length>0){
      throw STATUS_MSG.ERROR.GROUP_MEMBER_ALREADY_EXISTS
    }
    payloadData.senderId=UserData._id;
    let criteria = {_id:payloadData.memberId};
    let projection = {deviceToken:1,deviceType:1}
    let receiverData    =   await Service.CustomerService.getData(criteria,projection,{lean:true});
    let memberData    =  await  Service.PostGroupMemberService.InsertData({
      groupId:payloadData.groupId,
      groupMemberId:payloadData.memberId,
      //groupId:payloadData.groupId,
    });
    let notificationMessage = UserData.fullName+" has added you group "+groupData[0].groupName;
    sendPushAndSaveNotification(NOTIFICATION_TYPE.GROUP_ADMIN_ADD_MEMBER,receiverData[0],UserData,notificationMessage);
    
    return {gropMemberData:memberData}
  }catch(err){  //console.log("err",err);
    throw err;
  }
}


const getGroupList  = async (payloadData,UserData)=> {
  let groupIdsArray =[];  
  let criteria ={"isDeleted": false,groupMemberId:UserData._id};
  try{
    let projection={__v:0};
    let option={
        skip:payloadData.skip,
        limit:payloadData.limit,
        lean:true,
        sort:{postGroupAutoIncrementId:-1}
    };      
    let collectionOptions =[
      {
        path: 'groupAdminId',
        model: 'customer',
        select: '_id fullName imageURL email countryCode mobileNumber',
        options: {lean: true}
      }
    ];
    let getAllGroupList = await Service.PostGroupMemberService.getData(criteria,projection,{lean:true});
    let groupListLength =  getAllGroupList.length;
    for(let jk=0;jk<groupListLength;jk++){
      groupIdsArray.push(getAllGroupList[jk].groupId.toString());
    };
    let criteria2 = {
      _id:{$in:groupIdsArray},"isDeleted": false,
    }
    //let queryResult= await Service.PostGroupService.getData(criteria2,projection,option,collectionOptions);
    let queryResult= await Service.DAOService.getDataWithReferenceFixed(Models.PostGroup,criteria2,projection,option,collectionOptions);
    return {
      totalCount:getAllGroupList.length || 0,
      groupList:JSON.parse(JSON.stringify(queryResult))
    };
  }catch(err){  //console.log("err",err);
    throw err;
  }
}

const getMemberOfGroup  = async (payloadData,UserData)=> {
  let groupIdsArray =[];  
  let criteria ={"isDeleted": false,groupId:payloadData.groupId, status:'accepted'};
  try{
    let projection={__v:0,memberDeletedAt:0,memberLeaveGroup:0,isDeleted:0,memberDeletedByAdmin:0,memberLeaveAt:0};
    let option={
        skip:payloadData.skip,
        limit:payloadData.limit,
        lean:true,
        sort:{postGroupMemberAutoIncrementId:-1}
    };      
    let collectionOptions =[
      {
        path: 'groupMemberId',
        model: 'customer',
        select: '_id fullName email imageURL deviceToken',
        options: {lean: true}
      }
    ];

    let queryResult= await Promise.all([
      Service.PostGroupMemberService.getData(criteria,projection,{}),
      Service.DAOService.getDataWithReferenceFixed(Models.PostGroupMember,criteria,projection,option,collectionOptions),
    ]);
    return {
      totalCount:queryResult[0].length || 0,
      groupMemberList:JSON.parse(JSON.stringify(queryResult[1] || []))
    };
  }catch(err){  //console.log("err",err);
    throw err;
  }
}
const createGroupPost  = async (payloadData,UserData)=> {
  try{
    let memberCriteria = {
      groupId:payloadData.groupId,
      groupMemberId:UserData._id,
      isDeleted:false
    }
    let checkMemberExistOrNot= await Service.PostGroupMemberService.getData(memberCriteria,{},{lean:true});
    if(checkMemberExistOrNot.length==0){
      throw STATUS_MSG.ERROR.YOU_CAN_NOT_POST_THIS_GROUP
    }
   let postData =  await PostController.createPost(payloadData,UserData)
   return postData;
  }catch(err){  //console.log("err",err);
    throw err;
  }
}

const getGroupPost  = async (payloadData,UserData)=> {
  try{
    let allLikePostId =[],finalPostList=[]  
    let criteria = {
      //postAuthor:UserData._id,
      groupId:payloadData.groupId,
      isDeleted:false
    }
    let criteria1 = {
      userId:UserData._id,
      isDeleted:false
    }
    let collectionOptions =[
      {
        path: 'postAuthor',
        model: 'customer',
        select: '_id fullName email imageURL',
        options: {lean: true}
      }
    ];
    let options = {skip:payloadData.skip,limit:payloadData.limit,lean:true}
    let queryResult= await Promise.all([
      Service.PostService.getData(criteria,{"__v": 0},{}),
      Service.DAOService.getDataWithReferenceFixed(Models.Post,criteria,{"__v": 0},options,collectionOptions),
      Service.PostLikeService.getData(criteria1,{postId:1},{})
    ])
    let allPost =  queryResult[1] || [];
    let totalMyPost = queryResult[0].length || 0;
    let allLikePost = queryResult[2] || []
    
    let likeLength= allLikePost.length;
    let allPostLength= allPost.length;

    for(let i=0;i<likeLength;i++){
      allLikePostId.push(allLikePost[i].postId.toString())
    }

    for(let jk=0;jk<allPostLength;jk++){
      let tempData =allPost[jk]
      let getCommnent = [];
      if(allPost[jk].totalComment>0){
        let criteria = {postId:allPost[jk]._id,isDeleted:false}
        let commentOptions = {skip:0,limit:2,sort:{createdAt:-1}}
        let commentCollection =[
          {
            path: 'commentAuthor',
            model: 'customer',
            select: '_id fullName email imageURL',
            options: {lean: true}
          }
        ];
        let commentProjection = {updatedAt:0,totalLike:0,isDeleted:0,commentAutoIncrementId:0,"__v": 0};
        getCommnent =await Service.DAOService.getDataWithReferenceFixed(Models.PostComment,criteria,commentProjection,commentOptions,commentCollection);
      }
      tempData.comment = getCommnent;
      
      tempData.isLike=false;
      tempData.isDislike=false;
      /* if(allLikePostId.indexOf(allPost[jk]._id.toString())>-1){
        tempData.isLike=true;
      } */

      let likeCriteria = {
        userId:UserData._id,
        isDeleted:false,
        likeType: LIKE_TYPE.LIKE,
        postId: allPost[jk]._id
      }
      let getLikeData = await Service.PostLikeService.getData(likeCriteria,{postId:1, isLike:1, isDislike:1, likeType:1},{});
      console.log(getLikeData,'--getLikeData--');
      if(getLikeData.length > 0){
        tempData.isLike = getLikeData[0].isLike;
      }
      let dislikeCriteria = {
        userId:UserData._id,
        isDeleted:false,
        likeType: LIKE_TYPE.DISLIKE,
        postId: allPost[jk]._id
      }
      let getDisLikeData = await Service.PostLikeService.getData(dislikeCriteria,{postId:1, isLike:1, isDislike:1, likeType:1},{});
      console.log(getDisLikeData,'--getDisLikeData--');
      if(getDisLikeData.length > 0){
        tempData.isDislike = getDisLikeData[0].isDislike;
      }

      /*Get Tag Friend Data*/
      let getTag = [];
  
      let tagcriteria = {postId:allPost[jk]._id}
      let tagOptions = {skip:0,sort:{createdAt:-1}}
      let tagCollection =[
        {
          path: 'tagAuthor',
          model: 'customer',
          select: '_id fullName',
          options: {lean: true}
        }
      ];
      let commentProjection = {updatedAt:0,totalLike:0,isDeleted:0,commentAutoIncrementId:0,"__v": 0};
      getTag =await Service.DAOService.getDataWithReferenceFixed(Models.PostTag,tagcriteria,commentProjection,tagOptions,tagCollection);

      tempData.taggedFriendList = getTag;
      finalPostList.push(tempData);
    }
    
    return {
      totalMyPost:totalMyPost,
      myPost:finalPostList,
      //allLikePost:allLikePostId
    }
  }catch(err){
    throw err;
  }  
}


const deleteMemberOfGroup  = async (payloadData,UserData)=> { 
  try{
    if(payloadData.groupMemberId==UserData._id){
      throw STATUS_MSG.ERROR.YOU_CAN_NOT_PERFORM_THIS_ACTION
    } 
    let deleteComment=false;
    let criteria ={"isDeleted": false,_id:payloadData.groupId};
    let memberCriteria ={"isDeleted": false,groupId:payloadData.groupId,groupMemberId:payloadData.groupMemberId};

    let projection={__v:0};
    let option={
        skip:payloadData.skip,
        limit:payloadData.limit,
        lean:true,
        sort:{messageAutoIncrementId:1}
    };      
    let collectionOptions =[
      {
        path: 'groupAdminId',
        model: 'customer',
        select: '_id fullName imageURL email countryCode mobileNumber',
        options: {lean: true}
      }
    ];
    let options = {lean:true}
    let queryResult= await Promise.all([
      Service.PostGroupService.getData(criteria,projection,options),
      Service.PostGroupMemberService.getData(memberCriteria,projection,options),
      Service.CustomerService.getData({_id:payloadData.groupMemberId},projection,{lean:true}),
    ]);
    let receiverData    = queryResult[2] || [];

    let groupData=queryResult[0];
    let memberData= queryResult[1];//console.log("groupData",groupData)
    if(groupData.length==0){
      throw STATUS_MSG.ERROR.INVALID_GROUP_ID
    } 

    if(groupData.length>0 && groupData[0].groupAdminId.toString()!= UserData._id.toString()){
      throw STATUS_MSG.ERROR.YOU_CAN_NOT_DELETE_MEMBERS_GROUP
    }

    if(memberData.length==0){
      throw STATUS_MSG.ERROR.INVALID_MEMBER_ID
    }

    if(memberData.length>=0 && memberData[0].memberType=="Admin"){
      throw STATUS_MSG.ERROR.YOU_CAN_NOT_PERFORM_THIS_ACTION
    }  

    console.log("queryResult",queryResult[1]);
    let updateCriteria1 =memberCriteria; 
    let postDataToSet= {"isDeleted": true}
    let incUpdate= await Service.PostGroupMemberService.updateData(updateCriteria1,postDataToSet,{new:true});//console.log("incUpdate",incUpdate,updateCriteria1,payloadData);

    let notificationMessage = UserData.fullName+" has removed you group "+groupData[0].groupName;
    sendPushAndSaveNotification(NOTIFICATION_TYPE.GROUP_ADMIN_REMOVED_MEMBER,receiverData[0],UserData,notificationMessage);

    return {}
  }catch(err){
    throw err;
  }  
}

const deleteGroup  = async (payloadData,UserData)=> { 
  try{
    let criteria ={"isDeleted": false,_id:payloadData.groupId};
    let projection={__v:0};
    let option={
        skip:payloadData.skip,
        limit:payloadData.limit,
        lean:true,
        sort:{messageAutoIncrementId:1}
    };
    let options = {lean:true}
    let queryResult= await Promise.all([
      Service.PostGroupService.getData(criteria,projection,options),
      //Service.PostGroupMemberService.getData(memberCriteria,projection,options),
    ]);
    let groupData=queryResult[0];
    if(groupData.length==0){
      throw STATUS_MSG.ERROR.INVALID_GROUP_ID
    } 

    if(groupData.length>0 && groupData[0].groupAdminId.toString()!= UserData._id.toString()){
      throw STATUS_MSG.ERROR.YOU_CAN_NOT_DELETE_GROUP
    }  
    let updateCriteria1 =criteria; 
    let postDataToSet= {"isDeleted": true}
    let incUpdate= await Service.PostGroupService.updateData(updateCriteria1,postDataToSet,{new:true});
    return {}
  }catch(err){
    throw err;
  }  
}

const updateGroupChannel  = async (payloadData,UserData)=> { 
  try{
    let criteria ={_id:payloadData.groupId};
    let projection={__v:0};
    let options = {lean:true}
     
    let updateCriteria1 =criteria; 
    let postDataToSet= {
      ...payloadData
    }
    await Service.PostGroupService.updateData(updateCriteria1,postDataToSet,{new:true});
    return {}
  }catch(err){
    throw err;
  }  a
}

const getGroupDetails  = async (payloadData,UserData)=> { 
  try{
    let criteria ={_id:payloadData.groupId};
     
    let updateCriteria1 =criteria; 
    let postDataToSet= {
      ...payloadData
    }
    const result = await Service.PostGroupService.updateData(updateCriteria1,postDataToSet,{new:true});
    return result;
  }catch(err){
    throw err;
  }  
}

const leftGroup  = async (payloadData,UserData)=> { 
  try{
    payloadData.groupMemberId=UserData._id
    let deleteComment=false;
    let criteria ={"isDeleted": false,_id:payloadData.groupId};
    let memberCriteria ={"isDeleted": false,groupId:payloadData.groupId,groupMemberId:payloadData.groupMemberId};

    let projection={__v:0};
    let option={
        skip:payloadData.skip,
        limit:payloadData.limit,
        lean:true,
        sort:{messageAutoIncrementId:1}
    };      
    let collectionOptions =[
      {
        path: 'groupAdminId',
        model: 'customer',
        select: '_id fullName imageURL email countryCode mobileNumber deviceToken deviceType',
        options: {lean: true}
      }
    ];
    let options = {lean:true}
    let queryResult= await Promise.all([
      //Service.PostGroupService.getData(criteria,projection,options),
      Service.DAOService.getDataWithReferenceFixed(Models.PostGroup,criteria,{"__v": 0},options,collectionOptions),
      Service.PostGroupMemberService.getData(memberCriteria,projection,options),
    ]);
    let groupData=queryResult[0] || [];
    let memberData= queryResult[1];
    if(groupData.length==0){
      throw STATUS_MSG.ERROR.INVALID_GROUP_ID
    } 

    if(memberData.length==0){
      throw STATUS_MSG.ERROR.INVALID_MEMBER_ID
    }//console.log("groupData",groupData)
    if(memberData.length>=0 && memberData[0].memberType=="Admin"){
      throw STATUS_MSG.ERROR.YOU_CAN_NOT_PERFORM_THIS_ACTION
    }//console.log("queryResult",queryResult[1]);
    let updateCriteria1 =memberCriteria; 
    let postDataToSet= {"isDeleted": true}
    let incUpdate= await Service.PostGroupMemberService.updateData(updateCriteria1,postDataToSet,{new:true});//console.log("incUpdate",incUpdate,updateCriteria1,payloadData);
    let notificationMessage = UserData.fullName+" has left  group "+groupData[0].groupName;
    sendPushAndSaveNotification(NOTIFICATION_TYPE.GROUP_LEFT_BY_MEMBER,groupData[0].groupAdminId,UserData,notificationMessage);
    return {}
  }catch(err){
    throw err;
  }  
}

const sendPushAndSaveNotification = async(notificatioType,receiverDetails,senderDetails,notificationMessageP)=>{ 
  let notificationMessage = "";
  if(notificationMessageP!=''){
    notificationMessage =notificationMessageP; 
  }else if(notificatioType==FRIEND_REQUEST_TYPE.SEND){
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
    }
    UniversalFunctions.sendNotificationUsingFCM(pushNotificationData); 
  }
  let notificationData = {
    senderId:senderDetails._id,
    receiverId:receiverDetails._id,
    textMessage:notificationMessage,
    notificationType:notificatioType,
  }; //console.log("notificationData",notificationData);
  await Service.NotificationService.InsertData(notificationData);
  return {}
}

module.exports ={
  createGroup:createGroup,
  addMember   : addMember,
  getGroupList :getGroupList,
  getMemberOfGroup:getMemberOfGroup,
  createGroupPost:createGroupPost,
  getGroupPost:getGroupPost,
  deleteMemberOfGroup:deleteMemberOfGroup,
  deleteGroup:deleteGroup,
  leftGroup:leftGroup,
  updateGroupIcon : updateGroupIcon,
  updateGroupChannel,
  getGroupDetails
}