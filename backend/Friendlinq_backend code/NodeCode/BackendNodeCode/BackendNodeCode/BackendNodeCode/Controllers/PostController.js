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
const { exit } = require('process');
const { LIKE_TYPE } = require('../Config/AppConstants');



const APP_CONSTANTS   =  Config.APP_CONSTANTS;
const DEVICE_TYPES    =  APP_CONSTANTS.DEVICE_TYPES;
const STATUS_MSG      =  APP_CONSTANTS.STATUS_MSG;
const SOCIAL_MODE_TYPE       =  APP_CONSTANTS.SOCIAL_MODE_TYPE;
const POST_TYPES    =  APP_CONSTANTS.POST_TYPES;
const DOCUMENT_FILE_SIZE = APP_CONSTANTS.DOCUMENT_FILE_SIZE;
const POST_STATUS   = APP_CONSTANTS.POST_STATUS;
const FRIEND_REQUEST_TYPE =  APP_CONSTANTS.FRIEND_REQUEST_TYPE
const NOTIFICATION_TYPE  =  APP_CONSTANTS.NOTIFICATION_TYPE;


const createPost  = async (payloadData,UserData)=> {
    console.log(">>>>>>>>>>>Payload",payloadData.tagFriendList);
    console.log(">>>>>>>>>>>Payload",payloadData);
  let document = payloadData.mediaFile;
  let imagePrefix = "postImage_";  
  let videoThumbnailPrefix = "videoThumbnail_";
  try{  
    let dataImageArray=[],videoThumbnailArray = []; 
    if(payloadData.isMediaFileUploaded){
      if (typeof payloadData.mediaFile=='undefined')
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
      };  
      if(payloadData.isMediaTypeVideo){
        if (typeof payloadData.videoThumbnail!='undefined')
        {
          let videoThumbnailList= await UniversalFunctions.uploadDocumentOnLocalMachineUsingFile(payloadData.videoThumbnail,{_id:1},videoThumbnailPrefix);
          videoThumbnailArray.push(videoThumbnailList); 
        }        
      }
      
    } 
    let dataToSet ={
      postAuthor:UserData._id,
      postTitle:payloadData.postTitle,   
      postType:payloadData.postType, 
      isdating:payloadData.isdating,
      broadcastId:payloadData.broadcastId, 
    };
    if(payloadData.isMediaFileUploaded){
      if(payloadData.isMediaTypeVideo){
        dataToSet.videoURL = dataImageArray[0];
        if(videoThumbnailArray.length>0){
          dataToSet.videoThumbnailUrl = {
            original:videoThumbnailArray[0] ,
            thumbnail : videoThumbnailArray[0]
          } 
        }        
      }else{
        dataToSet.imageURL = {
          original:dataImageArray[0],
          thumbnail : dataImageArray[0]
        }
      }
    }
    if(payloadData.postContent){
      dataToSet.postContent = payloadData.postContent
    }
   
    if(payloadData.groupId){
      dataToSet.groupId = payloadData.groupId
    }
    let insertIntoDb = await Service.PostService.InsertData(dataToSet); 
    insertIntoDb = JSON.parse(JSON.stringify(insertIntoDb));
    insertIntoDb.postAuthor = {
      _id: UserData._id,
      imageURL: UserData.imageURL,
      fullName: UserData.fullName,
      email: UserData.email
    };
if(payloadData.tagFriendList != undefined){

  for(var i=0;i<payloadData.tagFriendList.length;i++){
    let tagData= {
      postId:insertIntoDb._id,
      tagAuthor:payloadData.tagFriendList[i]
    };
    let insertTagIntoDb = await Service.PostTagService.InsertData(tagData); 
   
  
  }
}
return insertIntoDb;
  }catch(err){
    throw err;
  }
}

const editPost  = async (payloadData,UserData)=> {
    console.log(">>>>>>>>>>>Payload",payloadData.tagFriendList);
    let criteria = {
      _id:payloadData.postId
    }
    let options = {new:true}

    let document = payloadData.mediaFile;
    let imagePrefix = "postImage_";  
    let videoThumbnailPrefix = "videoThumbnail_";
  try{  
    let collection =[
      {
        path: 'postAuthor',
        //model: 'customer',
        select: '_id fullName email deviceToken deviceType',
        options: {lean: true}
      }
    ];
    let postData= await Service.DAOService.getDataWithReferenceFixed(Models.Post,criteria,{},{lean:true},collection);
    if(postData.length==0){
      throw STATUS_MSG.ERROR.INVALID_POST_ID
    }
    postData = JSON.parse(JSON.stringify(postData));

    let dataImageArray=[],videoThumbnailArray = []; 
    if(payloadData.isMediaFileUploaded){
      if (typeof payloadData.mediaFile=='undefined')
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
      };  
      if(payloadData.isMediaTypeVideo){
        if (typeof payloadData.videoThumbnail!='undefined')
        {
          let videoThumbnailList= await UniversalFunctions.uploadDocumentOnLocalMachineUsingFile(payloadData.videoThumbnail,{_id:1},videoThumbnailPrefix);
          videoThumbnailArray.push(videoThumbnailList); 
        }        
      }
      
    } 
    let dataToSet ={
      postAuthor:UserData._id,
      postTitle:payloadData.postTitle,   
      postType:payloadData.postType, 
      broadcastId:payloadData.broadcastId 
    };
    if(payloadData.isMediaFileUploaded){
      if(payloadData.isMediaTypeVideo){
        dataToSet.videoURL = dataImageArray[0];
        if(videoThumbnailArray.length>0){
          dataToSet.videoThumbnailUrl = {
            original:videoThumbnailArray[0] ,
            thumbnail : videoThumbnailArray[0]
          } 
        }        
      }else{
        dataToSet.imageURL = {
          original:dataImageArray[0],
          thumbnail : dataImageArray[0]
        }
      }
    }
    if(payloadData.postContent){
      dataToSet.postContent = payloadData.postContent
    }
   
    if(payloadData.groupId){
      dataToSet.groupId = payloadData.groupId
    }
    // let insertIntoDb = await Service.PostService.InsertData(dataToSet); 
    let updateIntoDb = await Service.PostService.updateData(criteria,dataToSet,options);
    updateIntoDb = JSON.parse(JSON.stringify(updateIntoDb));
    updateIntoDb.postAuthor = {
      _id: UserData._id,
      imageURL: UserData.imageURL,
      fullName: UserData.fullName,
      email: UserData.email
    };
    if(payloadData.tagFriendList != undefined){

      for(var i=0;i<payloadData.tagFriendList.length;i++){
        let tagData= {
          postId:payloadData.postId,
          tagAuthor:payloadData.tagFriendList[i]
        };
        let insertTagIntoDb = await Service.PostTagService.InsertData(tagData); 
      
      
      }
    }
    return updateIntoDb;
  }catch(err){
    throw err;
  }
}

const insertTagData=async(payloadData)=>{
  let insertTagIntoDb = await Service.PostTagService.InsertData(payloadData); 
    console.log(">>>>>>>>>>Insert Tag Into db",insertTagIntoDb)
}

const getAllFriendsPost  = async (payloadData,UserData)=> {
 
  try{
    let friendIds =[];
    let accepteFriendCriteria = {
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
    let FriendQProjection = {customerFrom:1,customerTo:1,_id:1}
    let accepteFriendQ = await Service.FriendRequestService.getData( accepteFriendCriteria,FriendQProjection,{lean:true});
    let friendlistLength = accepteFriendQ.length;
   
    for(var i=0;i<friendlistLength;i++){
      if(accepteFriendQ[i] && accepteFriendQ[i].customerFrom != null)
      { 
      friendIds.push(accepteFriendQ[i].customerFrom.toString())
    }
    if(accepteFriendQ[i] && accepteFriendQ[i].customerTo != null)
      {
      friendIds.push(accepteFriendQ[i].customerTo.toString())
    } }
  
    friendIds.push(UserData._id.toString());
    let allLikePostId =[],finalPostList=[]  
    let criteria = {
      postAuthor:{$in:friendIds},
      postStatus:POST_STATUS.PUBLISH,
      postType:POST_TYPES.FRIEND_ONLY,
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
      },
      
    ];
    let options = {skip:payloadData.skip,limit:payloadData.limit,lean:true,sort:{createdAt:-1}}
    let queryResult= await Promise.all([
      Service.PostService.getData(criteria,{},{}),
      Service.DAOService.getDataWithReferenceFixed(Models.Post,criteria,{__v:0},options,collectionOptions),
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
    if(allPostLength>0){   
      allPost =JSON.parse(JSON.stringify(allPost));
      
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
        // console.log(allLikePostId,'---allLikePostId--');
        /* if(allLikePostId.indexOf(allPost[jk]._id.toString())>-1){
          tempData.isLike=true;
        } */
        let likeCriteria = {
          userId:UserData._id,
          isDeleted:false,
          // likeType: LIKE_TYPE.LIKE,
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
          // likeType: LIKE_TYPE.DISLIKE,
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
    }
    return {
      totalMyPost:totalMyPost,
      myPost:JSON.parse(JSON.stringify(finalPostList)) || [],
      //allLikePost:allLikePostId
    }
  }catch(err){
    throw err;
  }  
}
const getMyPortfolio  = async (payloadData,UserData)=> {
  try{
    let criteria = {
      userId:UserData._id   
    }
    let queryResult= await Promise.all([
      Service.PostService.getPortfolioData(criteria,{},{}),
    
    ])

    const getUserData = await Service.CustomerService.getData({_id:UserData._id});
    const portfolioData = queryResult[0];
    const userTopImages = getUserData[0].topFourImage;
    for(let i in portfolioData){
      portfolioData[i] = JSON.parse(JSON.stringify(portfolioData[i]));
      portfolioData[i].isSelected = userTopImages.includes(portfolioData[i].imageURL) ? true : false;
    }
    return {
      myPortolio : portfolioData,     
      // myPortolio:queryResult[0],     
    }
  }catch(err){
    throw err;
  }  
}
const getmyPost  = async (payloadData,UserData)=> {
  try{
    console.log(UserData,'--UserData--');
    let allLikePostId =[],finalPostList=[]  
    let criteria = {
      postAuthor:UserData._id,
      isDeleted:false
    }

    let criteria1 = {
      userId:UserData._id,
      isDeleted:false
    }
    let options = {skip:payloadData.skip,limit:payloadData.limit,sort:{createdAt:-1},lean:true}
    let queryResult= await Promise.all([
      Service.PostService.getData(criteria,{},{}),
      Service.PostService.getData(criteria,{},options),
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
      tempData.postAuthor = {
        _id: UserData._id,
        imageURL: UserData.imageURL,
        fullName: UserData.fullName,
        email: UserData.email
      }
      tempData.isLike=false;
      tempData.isDislike=false;
      /* if(allLikePostId.indexOf(allPost[jk]._id.toString())>-1){
        tempData.isLike=true;
      } */

      let likeCriteria = {
        userId:UserData._id,
        isDeleted:false,
        // likeType: LIKE_TYPE.LIKE,
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
        // likeType: LIKE_TYPE.DISLIKE,
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
const postDetail = async (payloadData,UserData)=> {
  try{
    let criteria = {
      _id:payloadData.postId,    
    }
    let commentCollection =[
      {
        path: 'postAuthor',
        model: 'customer',
        select: '_id fullName email imageURL',
        options: {lean: true}
      }
    ];
    let options = {lean:true}
    let postData= await Service.DAOService.getDataWithReferenceFixed(Models.Post,criteria,{},options,commentCollection);  
    if(postData.length==0){
      throw STATUS_MSG.ERROR.INVALID_POST_ID
    }
    postData = JSON.parse(JSON.stringify(postData));
    return {
      postDetails:postData[0],
      //allLikePost:allLikePostId
    }
  }catch(err){
    throw err;
  }  
}


const getAnotherUsersPost  = async (payloadData,UserData)=> {
  try{
    let allLikePostId =[],finalPostList=[];
    
    let friendListCriteria = {
      "$or":[
        {
          customerFrom:UserData._id,
          customerTo:payloadData.userToId
        },
        { 
          customerFrom:payloadData.userToId,
          customerTo:UserData._id
        }
      ],
      status:FRIEND_REQUEST_TYPE.ACCEPTED,
      isDeleted:false
    }
   let FriendsData=  await Service.FriendRequestService.getData(friendListCriteria,{},{lean:true}); //console.log("FriendsData",FriendsData);

    let criteria = {
      postAuthor:payloadData.userToId,
      isDeleted:false,
    }
    if(FriendsData.length>0){
      criteria.postType ={$in:[POST_TYPES.PUBLIC,POST_TYPES.FRIEND_ONLY]}
    }else{
     criteria.postType ={$in:[POST_TYPES.PUBLIC]}
    }

    let criteria1 = {
      userId:UserData._id,
      isDeleted:false
    }
    let options = {skip:payloadData.skip,limit:payloadData.limit,lean:true}
    let queryResult= await Promise.all([
      Service.PostService.getData(criteria,{},{}),
      Service.PostService.getData(criteria,{},options),
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
      tempData.isLike=false;
      tempData.isDislike=false;
      /* if(allLikePostId.indexOf(allPost[jk]._id.toString())>-1){
        tempData.isLike=true;
      } */
      let likeCriteria = {
        userId:UserData._id,
        isDeleted:false,
        // likeType: LIKE_TYPE.LIKE,
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
        // likeType: LIKE_TYPE.DISLIKE,
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

const getAnotherUsersPortfolio  = async (payloadData,UserData)=> {
  try{    

    let criteria = {
      userId:payloadData.userToId
    }
   
    let queryResult= await Promise.all([
      Service.PostService.getPortfolioData(criteria,{},{})    
    ])
    
    return {
      userPortfolio:queryResult[0]
    }
  }catch(err){
    throw err;
  }  
}

const deleteMyPost  = async (payloadData,UserData)=> {
  try{
    let criteria = {
      _id:payloadData.postId
    }
    let options = {new:true}
    let postData= await Service.PostService.getData(criteria,{},{lean:true});
    postData = JSON.parse(JSON.stringify(postData));
    if(postData.length==0){
        throw STATUS_MSG.ERROR.INVALID_POST_ID
    } 
    if(postData.length>0 && postData[0].postAuthor!=UserData._id){
      throw STATUS_MSG.ERROR.YOU_CAN_NOT_PERFORM_THIS_ACTION
    }   
   
    let updateCriteria = {postAuthor:UserData._id,_id:payloadData.postId}
    let update= await Service.PostService.updateData(updateCriteria,{isDeleted:true},options);
    return {}
  }catch(err){
    throw err;
  }  
}
const deleteMyPortfolio  = async (payloadData,UserData)=> {
  try{
    let criteria = {
      _id:payloadData.portfolioId
    }
    let options = {new:true}
    let portFolioData= await Service.PostService.getPortfolioData(criteria,{},{lean:true});
    portFolioData = JSON.parse(JSON.stringify(portFolioData));
    if(portFolioData.length==0){
        throw STATUS_MSG.ERROR.INVALID_POST_ID
    } 
    if(portFolioData.length>0 && portFolioData[0].userId!=UserData._id){
      throw STATUS_MSG.ERROR.YOU_CAN_NOT_PERFORM_THIS_ACTION
    }   
    let update= await Service.PostService.deletePortfolioData(criteria);
    return {}
  }catch(err){
    throw err;
  }  
}
const postComment  = async (payloadData,UserData)=> {
  let criteria = {
    _id:payloadData.postId
  }
  let options = {new:true}
  try{
    let collection =[
      {
        path: 'postAuthor',
        //model: 'customer',
        select: '_id fullName email deviceToken deviceType',
        options: {lean: true}
      }
    ];
    let postData= await Service.DAOService.getDataWithReferenceFixed(Models.Post,criteria,{},{lean:true},collection);
    if(postData.length==0){
      throw STATUS_MSG.ERROR.INVALID_POST_ID
    }
    postData = JSON.parse(JSON.stringify(postData));
    let dataToSet = {
      commentAuthor:UserData._id,
      postId:payloadData.postId,
      commentText:payloadData.commentText,
    }
    if(payloadData.parentId){ console.log("if");
      dataToSet.parentId = payloadData.parentId;
      //dataToSet.isChildCommentExists =true;
    }//console.log("dataToSet",dataToSet);
    let insertIntoDb = await Service.PostCommentService.InsertData(dataToSet); 
    let updateCriteria = {_id:payloadData.postId}
    let postDataToSet = {$inc:{totalComment:1}}
    //let update= await Service.PostService.updateData(updateCriteria,postDataToSet,options);    
    let notificationText = UserData.fullName+" has commented on  your post("+postData[0].postTitle+").";
    let notificationData = {
      senderId:UserData._id,
      receiverId:postData[0].postAuthor,
      textMessage:notificationText,
      notificationType:NOTIFICATION_TYPE.USER_COMMENT_POST,
    }; //console.log("notificationData",notificationData);
    let notification =  await Service.NotificationService.InsertData(notificationData);
    
    if(postData[0].postAuthor._id.toString()!=UserData._id.toString()){
      let queryResult= await Promise.all([
        Service.PostService.updateData(updateCriteria,postDataToSet,options),
        Service.NotificationService.InsertData(notificationData)
      ]);
    }else{
      let queryResult= await Promise.all([
        Service.PostService.updateData(updateCriteria,postDataToSet,options),
        //Service.NotificationService.InsertData(notificationData)
      ]);
    }
    if(postData[0].postAuthor.deviceToken && postData[0].postAuthor._id.toString()!=UserData._id.toString()){
      let pushNotificationData = {
        deviceToken:postData[0].postAuthor.deviceToken,
        fullName:UserData.fullName,
        message:notificationText,
        userData:{
          customerFrom:UserData._id,
          customerName:UserData.fullName,
          customerImage:UserData.imageURL.original || '',
          postId:payloadData.postId,
          status:NOTIFICATION_TYPE.USER_COMMENT_POST,
          type:NOTIFICATION_TYPE.USER_COMMENT_POST
        }
      }
      UniversalFunctions.sendNotificationUsingFCM(pushNotificationData);  
    }
    return {comment:insertIntoDb}; 
  }catch(err){
     throw err;
  }
}

const editPostComment  = async (payloadData,UserData)=> {
  let criteria = {
    _id:payloadData.postId
  }
  let options = {new:true}
  try{
    let collection =[
      {
        path: 'postAuthor',
        //model: 'customer',
        select: '_id fullName email deviceToken deviceType',
        options: {lean: true}
      }
    ];
    let postData= await Service.DAOService.getDataWithReferenceFixed(Models.Post,criteria,{},{lean:true},collection);
    if(postData.length==0){
      throw STATUS_MSG.ERROR.INVALID_POST_ID
    }
    postData = JSON.parse(JSON.stringify(postData));

    let postCommentCriteria = {
      _id:payloadData.commentId
    }
    let postCommentData= await Service.PostCommentService.getData(postCommentCriteria,{},{});
    if(postCommentData.length==0){
      throw STATUS_MSG.ERROR.INVALID_POST_COMMENT_ID
    }
    postCommentData = JSON.parse(JSON.stringify(postCommentData));

    let dataToSet = {
      commentAuthor: UserData._id,
      // postId:payloadData.postId,
      commentText: payloadData.commentText,
      isEdited: true,
      editedAt: Date()
    }
    if(payloadData.parentId){ console.log("if");
      dataToSet.parentId = payloadData.parentId;
      //dataToSet.isChildCommentExists =true;
    }//console.log("dataToSet",dataToSet);
    let updateIntoDb = await Service.PostCommentService.updateData(postCommentCriteria, dataToSet, options); 
    let updateCriteria = {_id:payloadData.postId}
    let postDataToSet = {$inc:{totalComment:1}}
    //let update= await Service.PostService.updateData(updateCriteria,postDataToSet,options);    
    let notificationText = UserData.fullName+" has commented on  your post("+postData[0].postTitle+").";
    let notificationData = {
      senderId:UserData._id,
      receiverId:postData[0].postAuthor,
      textMessage:notificationText,
      notificationType:NOTIFICATION_TYPE.USER_COMMENT_POST,
    }; //console.log("notificationData",notificationData);
    // let notification =  await Service.NotificationService.InsertData(notificationData); //uncomment if save
    
    /* if(postData[0].postAuthor._id.toString()!=UserData._id.toString()){ //uncomment if needed
      let queryResult= await Promise.all([
        Service.PostService.updateData(updateCriteria,postDataToSet,options),
        Service.NotificationService.InsertData(notificationData)
      ]);
    }else{
      let queryResult= await Promise.all([
        Service.PostService.updateData(updateCriteria,postDataToSet,options),
        //Service.NotificationService.InsertData(notificationData)
      ]);
    } */
    if(postData[0].postAuthor.deviceToken && postData[0].postAuthor._id.toString()!=UserData._id.toString()){
      let pushNotificationData = {
        deviceToken:postData[0].postAuthor.deviceToken,
        fullName:UserData.fullName,
        message:notificationText,
        userData:{
          customerFrom:UserData._id,
          customerName:UserData.fullName,
          customerImage:UserData.imageURL.original || '',
          postId:payloadData.postId,
          status:NOTIFICATION_TYPE.USER_COMMENT_POST,
          type:NOTIFICATION_TYPE.USER_COMMENT_POST
        }
      }
      // UniversalFunctions.sendNotificationUsingFCM(pushNotificationData);  //uncomment if send push
    }
    return {comment:updateIntoDb}; 
  }catch(err){
     throw err;
  }
}

const commentOnOff  = async (payloadData,UserData)=> {
  try{
    let criteria = {_id:payloadData.postId};
    // let pojection = {accessToken:0,__v:0,password:0,location:0,otp:0,deviceType:0,deviceToken:0,isDeleted:0}
    let dataToSet = {commentOnOff:payloadData.commentOnOff}
    // let options = {lean:true};
    // let queryResult= await Service.CustomerService.getData(criteria,{_id:1},{});
    let comment = await Service.PostService.updateData(criteria,dataToSet,{lean:true});
    return {}
  }catch(err){
    throw err;
  }  
}

const updatePostCommentOnOff  = async (payloadData)=> {
  try{
    let criteria = {};
    // let pojection = {accessToken:0,__v:0,password:0,location:0,otp:0,deviceType:0,deviceToken:0,isDeleted:0}
    let dataToSet = {commentOnOff:true}
    // let options = {lean:true};
    // let queryResult= await Service.CustomerService.getData(criteria,{_id:1},{});
    let comment = await Service.PostService.updateData(criteria,dataToSet,{lean:true});
    return {}
  }catch(err){
    throw err;
  }  
}

const getComment  = async (payloadData,UserData)=> {
  try{
    let criteria = {
      postId:payloadData.postId,
      isDeleted:false,
      parentId: {$exists: false}
    }
    let options = {skip:payloadData.skip,limit:payloadData.limit,sort:{createdAt:1}}
    let collectionOptions =[
      {
        path: 'commentAuthor',
        //model: 'customer',
        select: '_id fullName email imageURL',
        options: {lean: true}
      }
    ];
    let queryResult= await Promise.all([
      Service.PostCommentService.getData(criteria,{_id:1},{}),
      Service.DAOService.getDataWithReferenceFixed(Models.PostComment,criteria,{totalLike:0,__v:0},options,collectionOptions)
    ])
    let postComment = queryResult[1] || [];
    let commentlength = postComment.length || 0;
    if(commentlength>0){
      postComment = JSON.parse(JSON.stringify(postComment));
    }
    let finalCommentData = [];
    for(let i=0;i<commentlength;i++){
      let tempData = postComment[i];
      let childCriteria = {
        postId:payloadData.postId,
        isDeleted:false,
        parentId:tempData._id
      }
      let childComment = [];      
        childComment =  await Service.DAOService.getDataWithReferenceFixed(Models.PostComment,childCriteria,{totalLike:0,__v:0},options,collectionOptions); 
        if(childComment.length>0){
          childComment = JSON.parse(JSON.stringify(childComment));
        }
        tempData.childComment = childComment; 
      
      finalCommentData.push(tempData);
    }
    let totalMyPost = queryResult[0].length || 0;
    return {
      totalComment:totalMyPost,
      comments:finalCommentData
    }
  }catch(err){
    throw err;
  }  
}

const deleteComment  = async (payloadData,UserData)=> {
  console.log("payloadData.postId",payloadData.postId);
  try{
    let deleteComment=false;
    let collection =[
      {
        path: 'postId',
        //model: 'customer',
        select: '_id postStatus postAuthor postType postAutoIncrementId',
        options: {lean: true}
      }
    ];
    let criteria = {
      _id:payloadData.commenttId
    }
    let options = {new:true}
    let commentPostData= await Service.DAOService.getDataWithReferenceFixed(Models.PostComment,criteria,{},{lean:true},collection);

    commentPostData = JSON.parse(JSON.stringify(commentPostData));
    //console.log("commentPostData",commentPostData[0].postId.postAuthor);
    payloadData.postId=commentPostData[0].postId._id;
    if(commentPostData.length==0){
        throw STATUS_MSG.ERROR.INVALID_COMMENT_ID
    } 
    if(commentPostData.length>0 && commentPostData[0].commentAuthor==UserData._id){
      //throw STATUS_MSG.ERROR.YOU_CAN_NOT_PERFORM_THIS_ACTION
      deleteComment =true;
    }  
    
    if(commentPostData.length>0 && commentPostData[0].postId && commentPostData[0].postId.postAuthor && commentPostData[0].postId.postAuthor==UserData._id){
      //throw STATUS_MSG.ERROR.YOU_CAN_NOT_PERFORM_THIS_ACTION
      deleteComment =true;
    }  
    if(deleteComment){
      let updateCriteria = {_id:payloadData.commenttId}
      let update= await Service.PostCommentService.updateData(updateCriteria,{isDeleted:true},options);

      let updateCriteria1 = {_id:payloadData.postId}
    let postDataToSet = {$inc:{totalComment:-1}}
    let incUpdate= await Service.PostService.updateData(updateCriteria1,postDataToSet,{new:true});//console.log("incUpdate",incUpdate,updateCriteria1,payloadData.postId);
    }    
    return {}
  }catch(err){
    throw err;
  }  
}


const likeUnlikePost = async (payloadData,UserData)=> {
  let notificationText ="",notificationType="";
  try{
    let criteria = {
      _id:payloadData.postId,
      isDeleted:false
    }
    let likeCriteria = {
      postId:payloadData.postId,
      userId:UserData._id,
      isDeleted : false,
      // likeType: APP_CONSTANTS.LIKE_TYPE.LIKE
    }    
    let collection =[
      {
        path: 'postAuthor',
        //model: 'customer',
        select: '_id fullName email deviceToken deviceType',
        options: {lean: true}
      }
    ];
    //let postData= await Service.PostService.getData(criteria,{},{lean:true});
    let postData= await Service.DAOService.getDataWithReferenceFixed(Models.Post,criteria,{},{lean:true},collection);
    if(postData.length==0){
      throw STATUS_MSG.ERROR.INVALID_POST_ID
    }
    postData = JSON.parse(JSON.stringify(postData));
    let checklikeExistsOrNot  = await Service.PostLikeService.getData(likeCriteria,{},{lean:true});    
    console.log(checklikeExistsOrNot,'--checklikeExistsOrNot--');
    if(checklikeExistsOrNot.length>0 && payloadData.isLike){
      if(checklikeExistsOrNot[0].isLike){
        throw STATUS_MSG.ERROR.YOU_ALREADY_LIKED_POST  
      }
    }     
    let totalLike = postData[0].totalLike;
    let totalDislike = postData[0].totalDislike ? postData[0].totalDislike : 0;
    let dataToSet = {
      userId:UserData._id,
      postId:payloadData.postId,
      //likeDateAt:Date(),
      isLike:payloadData.isLike
    }    
    if(payloadData.isLike){
      dataToSet.likeDateAt=Date()
      totalLike = parseInt(totalLike)+1
      notificationText = UserData.fullName+" has liked your post("+postData[0].postTitle+").";
      notificationType=NOTIFICATION_TYPE.USER_LIKE_POST
      let dislikeCriteriaUpdate = {
        postId:payloadData.postId,
        userId:UserData._id,
        isDeleted : false,
        // likeType: APP_CONSTANTS.LIKE_TYPE.LIKE
      }
      let checkdislikeExistsOrNotUpdate  = await Service.PostLikeService.getData(dislikeCriteriaUpdate,{},{lean:true}); 
      console.log(checkdislikeExistsOrNotUpdate,'---checkdislikeExistsOrNotUpdate--');
      if(checkdislikeExistsOrNotUpdate.length>0 && payloadData.isLike) {
        totalDislike = parseInt(totalDislike)-1
        await Service.PostLikeService.updateData({_id: checkdislikeExistsOrNotUpdate[0]._id},{isDislike: false},{new:true});
      }
    }else{
      dataToSet.unlikeDateAt=Date()
      totalLike =  parseInt(totalLike)-1;
      notificationText = UserData.fullName+" has unliked your post("+postData[0].postTitle+").";
      notificationType=NOTIFICATION_TYPE.USER_UNLIKE_POST
    }
    let postDataToSet = {totalLike:totalLike<0 ? 0 : totalLike, totalDislike : totalDislike < 0 ? 0 : totalDislike}
    let queryResult= await  Service.PostService.updateData(criteria,postDataToSet,{new:true});
    let notificationData = {
      postId:payloadData.postId,
      senderId:UserData._id,
      receiverId:postData[0].postAuthor,
      textMessage:notificationText,
      notificationType:notificationType,
    }; //console.log("postData",postData[0].postAuthor);
    if(postData[0].postAuthor && postData[0].postAuthor.deviceToken && postData[0].postAuthor._id.toString()!=UserData._id.toString()){
      let pushNotificationData = {
        deviceToken:postData[0].postAuthor.deviceToken,
        fullName:UserData.fullName,
        message:notificationText,
        userData:{
          customerFrom:UserData._id,
          customerName:UserData.fullName,
          customerImage:UserData.imageURL.original || '',
          postId:payloadData.postId,
          status:notificationType,
          type:notificationType
        }
      }
      UniversalFunctions.sendNotificationUsingFCM(pushNotificationData);  
    }

    if(checklikeExistsOrNot.length==0 && payloadData.isLike){
      if(postData[0].postAuthor._id.toString()!=UserData._id.toString()){
        let queryResult= await Promise.all([
          Service.PostLikeService.InsertData(dataToSet),
          Service.NotificationService.InsertData(notificationData)
        ]) 
      }else{
        let queryResult= await Promise.all([
          Service.PostLikeService.InsertData(dataToSet),
          //Service.NotificationService.InsertData(notificationData)
        ]) 
      }      
    }

    // if(checklikeExistsOrNot.length>0 && !payloadData.isLike){
    if(checklikeExistsOrNot.length>0){
      if(postData[0].postAuthor._id.toString()!=UserData._id.toString()){
        let queryResult= await Promise.all([
          // Service.PostLikeService.deleteData(likeCriteria),
          Service.PostLikeService.updateData({_id: checklikeExistsOrNot[0]._id},dataToSet,{new:true}),
          Service.NotificationService.InsertData(notificationData)
        ])
      }else{
        let queryResult= await Promise.all([
          Service.PostLikeService.updateData({_id: checklikeExistsOrNot[0]._id},dataToSet,{new:true}),
          // Service.PostLikeService.deleteData(likeCriteria),
          //Service.NotificationService.InsertData(notificationData)
        ]) 
      }      
    }
    return {}
  }catch(err){
    throw err;
  }
}

const dislikePost = async (payloadData,UserData)=> {
  let notificationText ="",notificationType="";
  try{
    let criteria = {
      _id:payloadData.postId,
      isDeleted:false
    }
    let likeCriteria = {
      postId:payloadData.postId,
      userId:UserData._id,
      isDeleted : false,
      // likeType: APP_CONSTANTS.LIKE_TYPE.DISLIKE
    }    
    let collection =[
      {
        path: 'postAuthor',
        //model: 'customer',
        select: '_id fullName email deviceToken deviceType',
        options: {lean: true}
      }
    ];
    //let postData= await Service.PostService.getData(criteria,{},{lean:true});
    let postData= await Service.DAOService.getDataWithReferenceFixed(Models.Post,criteria,{},{lean:true},collection);
    if(postData.length==0){
      throw STATUS_MSG.ERROR.INVALID_POST_ID
    }
    postData = JSON.parse(JSON.stringify(postData));
    let checklikeExistsOrNot  = await Service.PostLikeService.getData(likeCriteria,{},{lean:true});    
    if(checklikeExistsOrNot.length>0 && payloadData.isDislike){
      if(checklikeExistsOrNot[0].isDislike){
        throw STATUS_MSG.ERROR.YOU_ALREADY_DISLIKED_POST  
      }
    }     
    console.log(postData[0],'---postData[0]---');
    let totalLike = postData[0].totalLike;
    let totalDislike = postData[0].totalDislike ? postData[0].totalDislike : 0;
    let dataToSet = {
      userId:UserData._id,
      postId:payloadData.postId,
      //likeDateAt:Date(),
      isDislike: payloadData.isDislike,
      // likeType: LIKE_TYPE.DISLIKE
    }    
    if(payloadData.isDislike){
      dataToSet.dislikeDateAt=Date()
      totalDislike = parseInt(totalDislike)+1
      notificationText = UserData.fullName+" has dis-liked your post("+postData[0].postTitle+").";
      notificationType=NOTIFICATION_TYPE.USER_LIKE_POST;
      let likeCriteriaUpdate = {
        postId:payloadData.postId,
        userId:UserData._id,
        isDeleted : false,
        // likeType: APP_CONSTANTS.LIKE_TYPE.LIKE
      }
      let checklikeExistsOrNotUpdate  = await Service.PostLikeService.getData(likeCriteriaUpdate,{},{lean:true}); 
      if(checklikeExistsOrNotUpdate.length>0 && payloadData.isDislike) {
        totalLike = parseInt(totalLike)-1
        await  Service.PostLikeService.updateData({_id: checklikeExistsOrNotUpdate[0]._id},{isLike: false},{new:true});
      }
    }else{
      dataToSet.unlikeDateAt=Date()
      totalDislike =  parseInt(totalDislike)-1;
      notificationText = UserData.fullName+" has unliked your post("+postData[0].postTitle+").";
      notificationType=NOTIFICATION_TYPE.USER_UNLIKE_POST
    }
    let postDataToSet = {totalDislike:totalDislike<0 ? 0 : totalDislike, totalLike : totalLike < 0 ? 0 : totalLike}
    let queryResult= await  Service.PostService.updateData(criteria,postDataToSet,{new:true});
    let notificationData = {
      postId:payloadData.postId,
      senderId:UserData._id,
      receiverId:postData[0].postAuthor,
      textMessage:notificationText,
      notificationType:notificationType,
    }; //console.log("postData",postData[0].postAuthor);
    if(postData[0].postAuthor && postData[0].postAuthor.deviceToken && postData[0].postAuthor._id.toString()!=UserData._id.toString()){
      let pushNotificationData = {
        deviceToken:postData[0].postAuthor.deviceToken,
        fullName:UserData.fullName,
        message:notificationText,
        userData:{
          customerFrom:UserData._id,
          customerName:UserData.fullName,
          customerImage:UserData.imageURL.original || '',
          postId:payloadData.postId,
          status:notificationType,
          type:notificationType
        }
      }
      UniversalFunctions.sendNotificationUsingFCM(pushNotificationData);  
    }
    console.log(dataToSet,'--dataToSet--');

    if(checklikeExistsOrNot.length==0 && payloadData.isDislike){
      if(postData[0].postAuthor._id.toString()!=UserData._id.toString()){
        let queryResult= await Promise.all([
          Service.PostLikeService.InsertData(dataToSet),
          Service.NotificationService.InsertData(notificationData)
        ]) 
      }else{
        let queryResult= await Promise.all([
          Service.PostLikeService.InsertData(dataToSet),
          //Service.NotificationService.InsertData(notificationData)
        ]) 
      }      
    }

    // if(checklikeExistsOrNot.length>0 && !payloadData.isDislike){
    if(checklikeExistsOrNot.length>0){
      if(postData[0].postAuthor._id.toString()!=UserData._id.toString()){
        let queryResult= await Promise.all([
          // Service.PostLikeService.deleteData(likeCriteria),
          Service.PostLikeService.updateData({_id: checklikeExistsOrNot[0]._id},dataToSet,{new:true}),,
          Service.NotificationService.InsertData(notificationData)
        ])
      }else{
        let queryResult= await Promise.all([
          // Service.PostLikeService.deleteData(likeCriteria),
          Service.PostLikeService.updateData({_id: checklikeExistsOrNot[0]._id},dataToSet,{new:true}),
          //Service.NotificationService.InsertData(notificationData)
        ]) 
      }      
    }
    return {}
  }catch(err){
    throw err;
  }
}


const createPortfolio  = async (payloadData,UserData)=> {
let imagePrefix = "portFolioImage_";  
let thumbnailPrefix = "portFolioThumbnail_";  
try{  
  let dataImageArray=[];
        if(payloadData.mediaFile0){     
              let imageList= await UniversalFunctions.uploadDocumentOnLocalMachineUsingFile(payloadData.mediaFile0,{_id:1},imagePrefix+"_");  
              dataImageArray.push(imageList);    
          }    
          if(payloadData.mediaFile1){     
            let imageList= await UniversalFunctions.uploadDocumentOnLocalMachineUsingFile(payloadData.mediaFile1,{_id:1},imagePrefix+"_");  
            dataImageArray.push(imageList);    
        } 
        if(payloadData.mediaFile2){     
          let imageList= await UniversalFunctions.uploadDocumentOnLocalMachineUsingFile(payloadData.mediaFile2,{_id:1},imagePrefix+"_");  
          dataImageArray.push(imageList);    
      } 
      if(payloadData.mediaFile3){     
        let imageList= await UniversalFunctions.uploadDocumentOnLocalMachineUsingFile(payloadData.mediaFile3,{_id:1},imagePrefix+"_");  
        dataImageArray.push(imageList);    
      } 
      if(payloadData.mediaFile4){     
        let imageList= await UniversalFunctions.uploadDocumentOnLocalMachineUsingFile(payloadData.mediaFile4,{_id:1},imagePrefix+"_");  
        dataImageArray.push(imageList);    
      }
        
      //upload thumbnail
      let dataThumbnailArray=[];
      if(payloadData.thumbnailFile0){     
              let imageList= await UniversalFunctions.uploadDocumentOnLocalMachineUsingFile(payloadData.thumbnailFile0,{_id:1},thumbnailPrefix+"_");  
              dataThumbnailArray.push(imageList);    
          }    
          if(payloadData.thumbnailFile1){     
            let imageList= await UniversalFunctions.uploadDocumentOnLocalMachineUsingFile(payloadData.thumbnailFile1,{_id:1},thumbnailPrefix+"_");  
            dataThumbnailArray.push(imageList);    
        } 
        if(payloadData.thumbnailFile2){     
          let imageList= await UniversalFunctions.uploadDocumentOnLocalMachineUsingFile(payloadData.thumbnailFile2,{_id:1},thumbnailPrefix+"_");  
          dataThumbnailArray.push(imageList);    
      } 
      if(payloadData.thumbnailFile3){     
        let imageList= await UniversalFunctions.uploadDocumentOnLocalMachineUsingFile(payloadData.thumbnailFile3,{_id:1},thumbnailPrefix+"_");  
        dataThumbnailArray.push(imageList);    
      } 
      if(payloadData.thumbnailFile4){     
        let imageList= await UniversalFunctions.uploadDocumentOnLocalMachineUsingFile(payloadData.thumbnailFile4,{_id:1},thumbnailPrefix+"_");  
        dataThumbnailArray.push(imageList);    
      }
    
    let arr=[]
    for(let i in dataImageArray){
      let dataToSet ={
          userId:UserData._id,
          fileType:payloadData.fileType,
          imageURL:dataImageArray[i], 
          thumbnailURL: (dataThumbnailArray.length > 0) ? dataThumbnailArray[i] : null
      }  
      arr.push(dataToSet)
    }
    // dataImageArray.forEach(function(item){     

    //     let dataToSet ={
    //       userId:UserData._id,
    //       imageURL:item, 
    //   }  
    //   arr.push(dataToSet)  
    // })
   
 let insertIntoDb = await Service.PostService.PortfolioInsertData(arr); 
  
  return insertIntoDb;
  }
catch(err){
  throw err;
}
}

const createPortfolioOld  = async (payloadData,UserData)=> {
let imagePrefix = "portFolioImage_";  
let thumbnailPrefix = "portFolioThumbnail_";  
try{  
  let dataImageArray=[];
        if(payloadData.mediaFile0){     
              let imageList= await UniversalFunctions.uploadDocumentOnLocalMachineUsingFile(payloadData.mediaFile0,{_id:1},imagePrefix+"_");  
              dataImageArray.push(imageList);    
          }    
          if(payloadData.mediaFile1){     
            let imageList= await UniversalFunctions.uploadDocumentOnLocalMachineUsingFile(payloadData.mediaFile1,{_id:1},imagePrefix+"_");  
            dataImageArray.push(imageList);    
        } 
        if(payloadData.mediaFile2){     
          let imageList= await UniversalFunctions.uploadDocumentOnLocalMachineUsingFile(payloadData.mediaFile2,{_id:1},imagePrefix+"_");  
          dataImageArray.push(imageList);    
      } 
      if(payloadData.mediaFile3){     
        let imageList= await UniversalFunctions.uploadDocumentOnLocalMachineUsingFile(payloadData.mediaFile3,{_id:1},imagePrefix+"_");  
        dataImageArray.push(imageList);    
      } 
      if(payloadData.mediaFile4){     
        let imageList= await UniversalFunctions.uploadDocumentOnLocalMachineUsingFile(payloadData.mediaFile4,{_id:1},imagePrefix+"_");  
        dataImageArray.push(imageList);    
      }
        
      //upload thumbail
      if(payloadData.thumbnailFile0){     
              let imageList= await UniversalFunctions.uploadDocumentOnLocalMachineUsingFile(payloadData.thumbnailFile0,{_id:1},thumbnailPrefix+"_");  
              dataImageArray.push(imageList);    
          }    
          if(payloadData.thumbnailFile1){     
            let imageList= await UniversalFunctions.uploadDocumentOnLocalMachineUsingFile(payloadData.thumbnailFile1,{_id:1},thumbnailPrefix+"_");  
            dataImageArray.push(imageList);    
        } 
        if(payloadData.thumbnailFile2){     
          let imageList= await UniversalFunctions.uploadDocumentOnLocalMachineUsingFile(payloadData.thumbnailFile2,{_id:1},thumbnailPrefix+"_");  
          dataImageArray.push(imageList);    
      } 
      if(payloadData.thumbnailFile3){     
        let imageList= await UniversalFunctions.uploadDocumentOnLocalMachineUsingFile(payloadData.thumbnailFile3,{_id:1},thumbnailPrefix+"_");  
        dataImageArray.push(imageList);    
      } 
      if(payloadData.thumbnailFile4){     
        let imageList= await UniversalFunctions.uploadDocumentOnLocalMachineUsingFile(payloadData.thumbnailFile4,{_id:1},thumbnailPrefix+"_");  
        dataImageArray.push(imageList);    
      }
    
    let arr=[]
    dataImageArray.forEach(function(item){     

        let dataToSet ={
          userId:UserData._id,
          imageURL:item, 
      }  
      arr.push(dataToSet)  
    })
   
 let insertIntoDb = await Service.PostService.PortfolioInsertData(arr); 
  
  return insertIntoDb;
  }
catch(err){
  throw err;
}
}


const sendPushNotificationAndSaveInDb = async(payloadData,UserData,NotificationType,message)=> {

}

module.exports ={
  
  createPost:createPost,
  editPost,
  getmyPost:getmyPost,
  deleteMyPost:deleteMyPost,
  deleteMyPortfolio:deleteMyPortfolio,
  postComment:postComment,
  getComment:getComment,
  deleteComment:deleteComment,
  likeUnlikePost:likeUnlikePost,
  getAnotherUsersPost:getAnotherUsersPost,
  getAllFriendsPost:getAllFriendsPost,
  postDetail:postDetail,
  createPortfolio:createPortfolio,
  getMyPortfolio:getMyPortfolio,
  getAnotherUsersPortfolio:getAnotherUsersPortfolio,
  commentOnOff,
  updatePostCommentOnOff,
  dislikePost,
  editPostComment
}