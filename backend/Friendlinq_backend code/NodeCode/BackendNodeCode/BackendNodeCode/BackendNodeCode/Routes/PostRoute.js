const BaseJoi = require('joi');
const Extension = require('joi-date-extensions');
const Joi = BaseJoi.extend(Extension);
const UniversalFunctions = require('../Utils/UniversalFunctions');
const Controller        =  require('../Controllers');
const CONFIG            =  require('../Config');
const APP_CONSTANTS     =  CONFIG.APP_CONSTANTS;
const DEVICE_TYPES      =  APP_CONSTANTS.DEVICE_TYPES;
const GENDER_TYPES      =  APP_CONSTANTS.GENDER_TYPES;
const SOCIAL_MODE_TYPE  =  APP_CONSTANTS.SOCIAL_MODE_TYPE;
//console.log("DEVICE_TYPES",APP_CONSTANTS.swaggerDefaultResponseMessages);
const POST_TYPES    =  APP_CONSTANTS.POST_TYPES;

const checkAccessToken = UniversalFunctions.getTokenFromDBForCustomer;



let  createPost =  {
  method: 'POST',
  path: '/api/v1/post/createPost',
  handler: function (request, reply) {  console.log("====route===="); 
    var payloadData = request.payload;  
    var UserData = request.pre.verify || {};  
    return Controller.PostController.createPost(payloadData,UserData).then(response =>{
      return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => {  
        return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'createPost',
    tags: ['api', 'Post'],
    payload: {
      maxBytes: 1000 * 1000 * 50, // 50 Mb
      output: 'stream',
      parse: true,
      allow: 'multipart/form-data',
      timeout: false,
    },
    pre: [{ method: checkAccessToken, assign: 'verify' }],
    validate: {
      payload: {
        //postTitle    :     Joi.string().required().min(2).trim(),
        postTitle    :     Joi.string().required().min(2).trim(),
        postContent  :     Joi.string().allow(null).allow('').optional().trim(),
        postType: Joi.string().optional().trim(),
        broadcastId: Joi.string().optional().trim(),
        isMediaFileUploaded:Joi.boolean().required(),
        isMediaTypeVideo:Joi.boolean().required(),
        isdating      : Joi.string().optional(),
        videoThumbnail:Joi.any().meta({swaggerType: 'file'}).description('mediaFile'), 
        mediaFile: Joi.any().meta({swaggerType: 'file'}).description('mediaFile'), 
        tagFriendList:Joi.array().items(Joi.string()).optional()
      },
      headers: Joi.object({'authorization': Joi.string().trim().required()}).options({allowUnknown: true}),
      failAction: UniversalFunctions.failActionFunction
    },
    plugins: {
      'hapi-swagger': {
        payloadType : 'form',
        responseMessages: APP_CONSTANTS.swaggerDefaultResponseMessages
      }
    }
  }
}

let  editPost =  {
  method: 'PUT',
  path: '/api/v1/post/editPost',
  handler: function (request, reply) {  console.log("====route===="); 
    var payloadData = request.payload;  
    var UserData = request.pre.verify || {};  
    return Controller.PostController.editPost(payloadData,UserData).then(response =>{
      return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => {  
        return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'createPost',
    tags: ['api', 'Post'],
    payload: {
      maxBytes: 1000 * 1000 * 50, // 50 Mb
      output: 'stream',
      parse: true,
      allow: 'multipart/form-data',
      timeout: false,
    },
    pre: [{ method: checkAccessToken, assign: 'verify' }],
    validate: {
      payload: {
        postId: Joi.string().required(),
        //postTitle    :     Joi.string().required().min(2).trim(),
        postTitle    :     Joi.string().required().min(2).trim(),
        postContent  :     Joi.string().allow(null).allow('').optional().trim(),
        postType: Joi.string().optional().trim(),
        broadcastId: Joi.string().optional().trim(),
        isMediaFileUploaded:Joi.boolean().optional(),
        isMediaTypeVideo:Joi.boolean().optional(),
        videoThumbnail:Joi.any().meta({swaggerType: 'file'}).description('mediaFile'), 
        mediaFile: Joi.any().meta({swaggerType: 'file'}).description('mediaFile'), 
        tagFriendList:Joi.array().items(Joi.string()).optional()
      },
      headers: Joi.object({'authorization': Joi.string().trim().required()}).options({allowUnknown: true}),
      failAction: UniversalFunctions.failActionFunction
    },
    plugins: {
      'hapi-swagger': {
        payloadType : 'form',
        responseMessages: APP_CONSTANTS.swaggerDefaultResponseMessages
      }
    }
  }
}


let  createPortfolio =  {
  method: 'POST',
  path: '/api/v1/post/createPortfolio',
  handler: function (request, reply) {  console.log("====route===="); 
    var payloadData = request.payload;  
    var UserData = request.pre.verify || {};  
    return Controller.PostController.createPortfolio(payloadData,UserData).then(response =>{
      return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => {  
        return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'createPortfolio',
    tags: ['api', 'Post'],
    payload: {
      maxBytes: 10000 * 10000 * 50, // 50 Mb
      output: 'stream',
      parse: true,
      allow: 'multipart/form-data',
      timeout: false,
    },
    pre: [{ method: checkAccessToken, assign: 'verify' }],
    validate: {
      payload: {
       
        mediaFile0: Joi.any().meta({swaggerType: 'file'}).description('mediaFile0'), 
        mediaFile1: Joi.any().meta({swaggerType: 'file'}).description('mediaFile1'), 
        mediaFile2: Joi.any().meta({swaggerType: 'file'}).description('mediaFile2'), 
        mediaFile3: Joi.any().meta({swaggerType: 'file'}).description('mediaFile3'), 
        mediaFile4: Joi.any().meta({swaggerType: 'file'}).description('mediaFile4'),     
        
        thumbnailFile0: Joi.any().meta({swaggerType: 'file'}).description('thumbnailFile0'), 
        thumbnailFile1: Joi.any().meta({swaggerType: 'file'}).description('thumbnailFile1'), 
        thumbnailFile2: Joi.any().meta({swaggerType: 'file'}).description('thumbnailFile2'), 
        thumbnailFile3: Joi.any().meta({swaggerType: 'file'}).description('thumbnailFile3'), 
        thumbnailFile4: Joi.any().meta({swaggerType: 'file'}).description('thumbnailFile4'),  
           
        fileType: Joi.number().description('1=image, 2=video')  
      },
      headers: Joi.object({'authorization': Joi.string().trim().required()}).options({allowUnknown: true}),
      failAction: UniversalFunctions.failActionFunction
    },
    plugins: {
      'hapi-swagger': {
        payloadType : 'form',
        responseMessages: APP_CONSTANTS.swaggerDefaultResponseMessages
      }
    }
  }
}

let getAllFriendsPost = {
  method: 'POST',
  path: '/api/post/getAllFriendsPost',
  handler: function (request, reply) {
    let UserData = request.pre.verify || {};
    return Controller.PostController.getAllFriendsPost(request.payload,UserData).then(response =>{
        return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => {   //console.log("errr=====",error);
        return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'Logout user',
    tags: ['api', 'Post'],
    pre: [{ method: checkAccessToken, assign: 'verify' }],
    validate: {
      payload:{
        skip: Joi.number().integer().required(),
        limit: Joi.number().integer().required(),
      },     
      headers: Joi.object({'authorization': Joi.string().trim().required()}).options({allowUnknown: true}),
      failAction: UniversalFunctions.failActionFunction,  
    },      
    plugins: {
      'hapi-swagger': {
          responseMessages: APP_CONSTANTS.swaggerDefaultResponseMessages
      }
    }
  }
}

let getmyPost = {
  method: 'POST',
  path: '/api/post/getMyPost',
  handler: function (request, reply) {
    let UserData = request.pre.verify || {};
    return Controller.PostController.getmyPost(request.payload,UserData).then(response =>{
        return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => {   //console.log("errr=====",error);
        return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'Logout user',
    tags: ['api', 'Post'],
    pre: [{ method: checkAccessToken, assign: 'verify' }],
    validate: {
      payload:{
        skip: Joi.number().integer().required(),
        limit: Joi.number().integer().required(),
      },     
      headers: Joi.object({'authorization': Joi.string().trim().required()}).options({allowUnknown: true}),
      failAction: UniversalFunctions.failActionFunction,  
    },      
    plugins: {
      'hapi-swagger': {
          responseMessages: APP_CONSTANTS.swaggerDefaultResponseMessages
      }
    }
  }
}

let getMyPortfolio = {
  method: 'POST',
  path: '/api/v1/post/getMyPortfolio',
  handler: function (request, reply) {
    let UserData = request.pre.verify || {};
    return Controller.PostController.getMyPortfolio(request.payload,UserData).then(response =>{
        return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => {   //console.log("errr=====",error);
        return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'Logout user',
    tags: ['api', 'Post'],
    pre: [{ method: checkAccessToken, assign: 'verify' }],
    validate: {
      payload:{
        skip: Joi.number().integer().required(),
        limit: Joi.number().integer().required(),
      },     
      headers: Joi.object({'authorization': Joi.string().trim().required()}).options({allowUnknown: true}),
      failAction: UniversalFunctions.failActionFunction,  
    },      
    plugins: {
      'hapi-swagger': {
          responseMessages: APP_CONSTANTS.swaggerDefaultResponseMessages
      }
    }
  }
}


let postDetail = {
  method: 'POST',
  path: '/api/post/postDetail',
  handler: function (request, reply) {
    let UserData = request.pre.verify || {};
    return Controller.PostController.postDetail(request.payload,UserData).then(response =>{
        return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => {   //console.log("errr=====",error);
        return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'postDetail',
    tags: ['api', 'Post'],
    pre: [{ method: checkAccessToken, assign: 'verify' }],
    validate: {
      payload:{
        postId: Joi.string().required(),
      },     
      headers: Joi.object({'authorization': Joi.string().trim().required()}).options({allowUnknown: true}),
      failAction: UniversalFunctions.failActionFunction,  
    },      
    plugins: {
      'hapi-swagger': {
          responseMessages: APP_CONSTANTS.swaggerDefaultResponseMessages
      }
    }
  }
}

let getAnotherUsersPost = {
  method: 'POST',
  path: '/api/post/getAnotherUsersPost',
  handler: function (request, reply) {
    let UserData = request.pre.verify || {};
    return Controller.PostController.getAnotherUsersPost(request.payload,UserData).then(response =>{
        return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => {   //console.log("errr=====",error);
        return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'Logout user',
    tags: ['api', 'Post'],
    pre: [{ method: checkAccessToken, assign: 'verify' }],
    validate: {
      payload:{
        userToId: Joi.string().required(),
        skip: Joi.number().integer().required(),
        limit: Joi.number().integer().required(),
      },     
      headers: Joi.object({'authorization': Joi.string().trim().required()}).options({allowUnknown: true}),
      failAction: UniversalFunctions.failActionFunction,  
    },      
    plugins: {
      'hapi-swagger': {
          responseMessages: APP_CONSTANTS.swaggerDefaultResponseMessages
      }
    }
  }
}
let getAnotherUsersPortfolio = {
  method: 'POST',
  path: '/api/v1/post/getAnotherUsersPortfolio',
  handler: function (request, reply) {
    let UserData = request.pre.verify || {};
    return Controller.PostController.getAnotherUsersPortfolio(request.payload,UserData).then(response =>{
        return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => {   //console.log("errr=====",error);
        return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'Logout user',
    tags: ['api', 'Post'],
    pre: [{ method: checkAccessToken, assign: 'verify' }],
    validate: {
      payload:{
        userToId: Joi.string().required(),
        skip: Joi.number().integer().required(),
        limit: Joi.number().integer().required(),
      },     
      headers: Joi.object({'authorization': Joi.string().trim().required()}).options({allowUnknown: true}),
      failAction: UniversalFunctions.failActionFunction,  
    },      
    plugins: {
      'hapi-swagger': {
          responseMessages: APP_CONSTANTS.swaggerDefaultResponseMessages
      }
    }
  }
}

let deleteMyPost = {
  method: 'POST',
  path: '/api/post/deleteMyPost',
  handler: function (request, reply) {
    let UserData = request.pre.verify || {};
    return Controller.PostController.deleteMyPost(request.payload,UserData).then(response =>{
        return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => {   //console.log("errr=====",error);
        return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'deleteMyPost',
    tags: ['api', 'Post'],
    pre: [{ method: checkAccessToken, assign: 'verify' }],
    validate: {
      payload:{
        postId: Joi.string().required()
      },     
      headers: Joi.object({'authorization': Joi.string().trim().required()}).options({allowUnknown: true}),
      failAction: UniversalFunctions.failActionFunction,  
    },      
    plugins: {
      'hapi-swagger': {
          responseMessages: APP_CONSTANTS.swaggerDefaultResponseMessages
      }
    }
  }
}
let deleteMyPortfolio = {
  method: 'POST',
  path: '/api/v1/post/deleteMyPortfolio',
  handler: function (request, reply) {
    let UserData = request.pre.verify || {};
    return Controller.PostController.deleteMyPortfolio(request.payload,UserData).then(response =>{
        return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => {   //console.log("errr=====",error);
        return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'deleteMyPortfolio',
    tags: ['api', 'Post'],
    pre: [{ method: checkAccessToken, assign: 'verify' }],
    validate: {
      payload:{
        portfolioId: Joi.string().required()
      },     
      headers: Joi.object({'authorization': Joi.string().trim().required()}).options({allowUnknown: true}),
      failAction: UniversalFunctions.failActionFunction,  
    },      
    plugins: {
      'hapi-swagger': {
          responseMessages: APP_CONSTANTS.swaggerDefaultResponseMessages
      }
    }
  }
}
let  postComment =  {
  method: 'POST',
  path: '/api/v1/post/postComment',
  handler: function (request, reply) {  console.log("====route===="); 
    var payloadData = request.payload;  
    var UserData = request.pre.verify || {};  
    return Controller.PostController.postComment(payloadData,UserData).then(response =>{
      return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => {  
        return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'createPost',
    tags: ['api', 'Post'],
    pre: [{ method: checkAccessToken, assign: 'verify' }],
    validate: {
      payload: {
        postId: Joi.string().required(),
        parentId:Joi.string(),
        commentText  : Joi.string().required().min(2).trim(),
      },
      headers: Joi.object({'authorization': Joi.string().trim().required()}).options({allowUnknown: true}),
      failAction: UniversalFunctions.failActionFunction
    },
    plugins: {
      'hapi-swagger': {
        payloadType : 'form',
        responseMessages: APP_CONSTANTS.swaggerDefaultResponseMessages
      }
    }
  }
}

let  editPostComment =  {
  method: 'PUT',
  path: '/api/v1/post/editPostComment',
  handler: function (request, reply) {  console.log("====route===="); 
    var payloadData = request.payload;  
    var UserData = request.pre.verify || {};  
    return Controller.PostController.editPostComment(payloadData,UserData).then(response =>{
      return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => {  
        return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'createPost',
    tags: ['api', 'Post'],
    pre: [{ method: checkAccessToken, assign: 'verify' }],
    validate: {
      payload: {
        postId: Joi.string().required(),
        parentId:Joi.string(),
        commentId:Joi.string().required(),
        commentText  : Joi.string().required().min(2).trim(),
      },
      headers: Joi.object({'authorization': Joi.string().trim().required()}).options({allowUnknown: true}),
      failAction: UniversalFunctions.failActionFunction
    },
    plugins: {
      'hapi-swagger': {
        payloadType : 'form',
        responseMessages: APP_CONSTANTS.swaggerDefaultResponseMessages
      }
    }
  }
}

let commentOnOff = {
  method: 'POST',
  path: '/api/v1/post/commentOnOff',
  handler: function (request, reply) {  
    let UserData = request.pre.verify || {}; 
    return Controller.PostController.commentOnOff(request.payload,UserData).then(response =>{
        return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => {   //console.log("errr=====",error);
        return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'Comment on off',
      tags: ['api', 'Post'],
      pre: [{ method: checkAccessToken, assign: 'verify' }],
      validate: {
        payload: {
          postId: Joi.string().required(),
          // userId:Joi.string().required().length(24).trim(),
          commentOnOff:Joi.boolean().required(),
        },
      headers: Joi.object({'authorization': Joi.string().trim().required()}).options({allowUnknown: true}),
      failAction: UniversalFunctions.failActionFunction
    },
    plugins: {
      'hapi-swagger': {
        payloadType : 'form',
        responseMessages: APP_CONSTANTS.swaggerDefaultResponseMessages
      }
    }
  }
}

let updatePostCommentOnOff = {
  method: 'POST',
  path: '/api/v1/post/updatePostCommentOnOff',
  handler: function (request, reply) {
    return Controller.PostController.updatePostCommentOnOff(request.payload).then(response =>{
        return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => {   //console.log("errr=====",error);
        return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'Comment on off',
      tags: ['api', 'Post'],
      pre: [{ method: checkAccessToken, assign: 'verify' }],
      validate: {
        payload: {
          postId: Joi.string().required(),
          // userId:Joi.string().required().length(24).trim(),
          // commentOnOff:Joi.boolean().required(),
        },
      headers: Joi.object({'authorization': Joi.string().trim().required()}).options({allowUnknown: true}),
      failAction: UniversalFunctions.failActionFunction
    },
    plugins: {
      'hapi-swagger': {
        payloadType : 'form',
        responseMessages: APP_CONSTANTS.swaggerDefaultResponseMessages
      }
    }
  }
}

let getPostComment = {
  method: 'POST',
  path: '/api/post/getPostComment',
  handler: function (request, reply) {
    let UserData = request.pre.verify || {};
    return Controller.PostController.getComment(request.payload,UserData).then(response =>{
        return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => {   //console.log("errr=====",error);
        return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'Logout user',
    tags: ['api', 'Post'],
    pre: [{ method: checkAccessToken, assign: 'verify' }],
    validate: {
      payload:{
        postId: Joi.string().required(),
        skip: Joi.number().integer().required(),
        limit: Joi.number().integer().required(),
      },     
      headers: Joi.object({'authorization': Joi.string().trim().required()}).options({allowUnknown: true}),
      failAction: UniversalFunctions.failActionFunction,  
    },      
    plugins: {
      'hapi-swagger': {
          responseMessages: APP_CONSTANTS.swaggerDefaultResponseMessages
      }
    }
  }
}

let deleteComment = {
  method: 'POST',
  path: '/api/post/deleteComment',
  handler: function (request, reply) {
    let UserData = request.pre.verify || {};
    return Controller.PostController.deleteComment(request.payload,UserData).then(response =>{
        return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => {   //console.log("errr=====",error);
        return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'deleteComment',
    tags: ['api', 'Post'],
    pre: [{ method: checkAccessToken, assign: 'verify' }],
    validate: {
      payload:{
        commenttId: Joi.string().required()
      },     
      headers: Joi.object({'authorization': Joi.string().trim().required()}).options({allowUnknown: true}),
      failAction: UniversalFunctions.failActionFunction,  
    },      
    plugins: {
      'hapi-swagger': {
          responseMessages: APP_CONSTANTS.swaggerDefaultResponseMessages
      }
    }
  }
}

let  likeUnlikePost =  {
  method: 'POST',
  path: '/api/v1/post/likeUnlikePost',
  handler: function (request, reply) {  console.log("====route===="); 
    var payloadData = request.payload;  
    var UserData = request.pre.verify || {};  
    return Controller.PostController.likeUnlikePost(payloadData,UserData).then(response =>{
      return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => {  
        return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'likeUnlikePost',
    tags: ['api', 'Post'],
    pre: [{ method: checkAccessToken, assign: 'verify' }],
    validate: {
      payload: {
        postId: Joi.string().required(),
        isLike:Joi.boolean().required(),
      },
      headers: Joi.object({'authorization': Joi.string().trim().required()}).options({allowUnknown: true}),
      failAction: UniversalFunctions.failActionFunction
    },
    plugins: {
      'hapi-swagger': {
        payloadType : 'form',
        responseMessages: APP_CONSTANTS.swaggerDefaultResponseMessages
      }
    }
  }
}

let  dislikePost =  {
  method: 'POST',
  path: '/api/v1/post/dislikePost',
  handler: function (request, reply) {  console.log("====route===="); 
    var payloadData = request.payload;  
    var UserData = request.pre.verify || {};  
    return Controller.PostController.dislikePost(payloadData,UserData).then(response =>{
      return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => {  
        return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'dislikePost',
    tags: ['api', 'Post'],
    pre: [{ method: checkAccessToken, assign: 'verify' }],
    validate: {
      payload: {
        postId: Joi.string().required(),
        isDislike:Joi.boolean().required(),
      },
      headers: Joi.object({'authorization': Joi.string().trim().required()}).options({allowUnknown: true}),
      failAction: UniversalFunctions.failActionFunction
    },
    plugins: {
      'hapi-swagger': {
        payloadType : 'form',
        responseMessages: APP_CONSTANTS.swaggerDefaultResponseMessages
      }
    }
  }
}

module.exports = [
  createPost,
  editPost,
  getmyPost,
  getAnotherUsersPost,
  getAllFriendsPost,
  deleteMyPost,
  postComment,
  getPostComment,
  deleteComment,
  likeUnlikePost,
  dislikePost,
  postDetail,
  createPortfolio,
  getMyPortfolio,
  deleteMyPortfolio,
  getAnotherUsersPortfolio,
  commentOnOff,
  updatePostCommentOnOff,
  editPostComment
]