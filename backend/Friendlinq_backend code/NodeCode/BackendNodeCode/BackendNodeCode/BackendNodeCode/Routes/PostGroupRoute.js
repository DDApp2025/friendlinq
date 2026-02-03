const BaseJoi             =  require('joi');
const Extension           =  require('joi-date-extensions');
const Joi                 =  BaseJoi.extend(Extension);
const UniversalFunctions  =  require('../Utils/UniversalFunctions');
const Controller          =  require('../Controllers');
const CONFIG              =  require('../Config');
const APP_CONSTANTS       =  CONFIG.APP_CONSTANTS;
const DEVICE_TYPES        =  APP_CONSTANTS.DEVICE_TYPES;
const SOCIAL_MODE_TYPE    =  APP_CONSTANTS.SOCIAL_MODE_TYPE;
const RIDE_STATUS         =  APP_CONSTANTS.RIDE_STATUS; 

const checkAccessToken = UniversalFunctions.getTokenFromDBForCustomer;

const createGroup = {
  method: 'POST',
  path: '/api/v1/postGroup/createGroup',
  handler: function (request, reply) {
  	let UserData = request.pre.verify || {}; 
    return Controller.PostGroupController.createGroup(request.payload,UserData).then(response =>{ //console.log("response",response);
      return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => { //console.log("error",error); 
        return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'send Message',
    tags: ['api', 'Post-Group'],
    pre: [{ method: checkAccessToken, assign: 'verify' }],
    validate: {
      payload: {
        groupName   : Joi.string().required().trim(), 
        // groupIcon: Joi.any().meta({swaggerType: 'file'}).description('groupIcon'), 
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


const updateGroupIcon = {
  method: 'POST',
  path: '/api/v1/postGroup/updateGroupIcon',
  handler: function (request, reply) {
  	let UserData = request.pre.verify || {}; 
    return Controller.PostGroupController.updateGroupIcon(request.payload,UserData).then(response =>{ //console.log("response",response);
      return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => { //console.log("error",error); 
        return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'send Message',
    tags: ['api', 'Post-Group'],
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
        id   : Joi.string().required().trim(), 
        groupIcon: Joi.any().meta({swaggerType: 'file'}).description('groupIcon'), 
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

const addMember = {
  method: 'POST',
  path: '/api/v1/postGroup/addMember',
  handler: function (request, reply) {
  	let UserData = request.pre.verify || {}; 
    return Controller.PostGroupController.addMember(request.payload,UserData).then(response =>{ //console.log("response",response);
      return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => { //console.log("error",error); 
        return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'send Message',
    tags: ['api', 'Post-Group'],
    pre: [{ method: checkAccessToken, assign: 'verify' }],
    validate: {
      payload: {
        groupId         : Joi.string().required().trim(),
        memberId        : Joi.string().required().trim(),  
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


const getGroupList = {
  method: 'GET',
  path: '/api/v1/postGroup/getGroupList',
  handler: function (request, reply) {
    let UserData = request.pre.verify || {}; 
    return Controller.PostGroupController.getGroupList(request.query,UserData).then(response =>{ //console.log("response",response);
      return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => { //console.log("error",error); 
        return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'get Message',
    tags: ['api', 'Post-Group'],
    pre: [{ method: checkAccessToken, assign: 'verify' }],
    validate: {
      query: {
        skip         : Joi.number().required(),
        limit        : Joi.number().required(),
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

let getMemberOfGroup =  {
  method: 'POST',
  path: '/api/v1/postGroup/getMemberOfGroup',
  handler: function (request, reply) {  console.log("====route===="); 
    var payloadData = request.payload;  
    var UserData = request.pre.verify || {};  
    return Controller.PostGroupController.getMemberOfGroup(payloadData,UserData).then(response =>{
      return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => {  
        return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'chatMedia',
    tags: ['api', 'Post-Group'],
    pre: [{ method: checkAccessToken, assign: 'verify' }],
    validate: {
      payload: {
        groupId  : Joi.string().required().trim(),
        skip     : Joi.number().required(),
        limit    : Joi.number().required(),
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

let  createGroupPost =  {
  method: 'POST',
  path: '/api/v1/postGroup/createGroupPost',
  handler: function (request, reply) {  console.log("====route===="); 
    var payloadData = request.payload;  
    var UserData = request.pre.verify || {};  
    return Controller.PostGroupController.createGroupPost(payloadData,UserData).then(response =>{
      return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => {  
        return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'createGroupPost',
    tags: ['api', 'Post-Group'],
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
        postTitle    :     Joi.string().required().min(2).trim(),
        groupId      : Joi.string().required().trim(),
        isdating      : Joi.string().optional(),
        postContent  :     Joi.string().allow(null).allow('').optional().trim(),
        isMediaFileUploaded:Joi.boolean().required(),
        isMediaTypeVideo:Joi.boolean().required(),
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

let getGroupPost = {
  method: 'POST',
  path: '/api/postGroup/getGroupPost',
  handler: function (request, reply) {
    let UserData = request.pre.verify || {};
    return Controller.PostGroupController.getGroupPost(request.payload,UserData).then(response =>{
        return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => {   //console.log("errr=====",error);
        return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'Logout user',
    tags: ['api', 'Post-Group'],
    pre: [{ method: checkAccessToken, assign: 'verify' }],
    validate: {
      payload:{
        groupId      : Joi.string().required().trim(),
        skip: Joi.number().integer().required(),
        limit: Joi.number().integer().required(),
      },     
      headers: Joi.object({'authorization': Joi.string().trim().required()}).options({allowUnknown: true}),
      failAction: UniversalFunctions.failActionFunction,  
    },      
    plugins: {
      'hapi-swagger': {
        payloadType : 'form',
        responseMessages: APP_CONSTANTS.swaggerDefaultResponseMessages
      }
    }
  }
}

let deleteMemberOfGroup = {
  method: 'POST',
  path: '/api/postGroup/deleteMemberOfGroup',
  handler: function (request, reply) {
    let UserData = request.pre.verify || {};
    return Controller.PostGroupController.deleteMemberOfGroup(request.payload,UserData).then(response =>{
        return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => {   //console.log("errr=====",error);
        return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: ' ',
    tags: ['api', 'Post-Group'],
    pre: [{ method: checkAccessToken, assign: 'verify' }],
    validate: {
      payload:{
        groupId       : Joi.string().required().trim(),
        groupMemberId : Joi.string().required().trim(),
      },     
      headers: Joi.object({'authorization': Joi.string().trim().required()}).options({allowUnknown: true}),
      failAction: UniversalFunctions.failActionFunction,  
    },      
    plugins: {
      'hapi-swagger': {
        payloadType : 'form',
        responseMessages: APP_CONSTANTS.swaggerDefaultResponseMessages
      }
    }
  }
}
let deleteGroup = {
  method: 'POST',
  path: '/api/postGroup/deleteGroup',
  handler: function (request, reply) {
    let UserData = request.pre.verify || {};
    return Controller.PostGroupController.deleteGroup(request.payload,UserData).then(response =>{
        return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => {   //console.log("errr=====",error);
        return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: ' ',
    tags: ['api', 'Post-Group'],
    pre: [{ method: checkAccessToken, assign: 'verify' }],
    validate: {
      payload:{
        groupId       : Joi.string().required().trim(),
      },     
      headers: Joi.object({'authorization': Joi.string().trim().required()}).options({allowUnknown: true}),
      failAction: UniversalFunctions.failActionFunction,  
    },      
    plugins: {
      'hapi-swagger': {
        payloadType : 'form',
        responseMessages: APP_CONSTANTS.swaggerDefaultResponseMessages
      }
    }
  }
}

let leftGroup = {
  method: 'POST',
  path: '/api/postGroup/leftGroup',
  handler: function (request, reply) {
    let UserData = request.pre.verify || {};
    return Controller.PostGroupController.leftGroup(request.payload,UserData).then(response =>{
        return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => {   //console.log("errr=====",error);
        return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: ' ',
    tags: ['api', 'Post-Group'],
    pre: [{ method: checkAccessToken, assign: 'verify' }],
    validate: {
      payload:{
        groupId       : Joi.string().required().trim(),
      },     
      headers: Joi.object({'authorization': Joi.string().trim().required()}).options({allowUnknown: true}),
      failAction: UniversalFunctions.failActionFunction,  
    },      
    plugins: {
      'hapi-swagger': {
        payloadType : 'form',
        responseMessages: APP_CONSTANTS.swaggerDefaultResponseMessages
      }
    }
  }
}

let updateGroupChannel = {
  method: 'POST',
  path: '/api/postGroup/updateGroupChannel',
  handler: function (request, reply) {
    let UserData = request.pre.verify || {};
    return Controller.PostGroupController.updateGroupChannel(request.payload,UserData).then(response =>{
        return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => {   //console.log("errr=====",error);
        return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: ' ',
    tags: ['api', 'Post-Group'],
    pre: [{ method: checkAccessToken, assign: 'verify' }],
    validate: {
      payload:{
        groupId       : Joi.string().required().trim(),
        isActive      : Joi.boolean().required(),
        channelId     : Joi.string().required().trim(),
        callType     : Joi.string().required().trim()
      },     
      headers: Joi.object({'authorization': Joi.string().trim().required()}).options({allowUnknown: true}),
      failAction: UniversalFunctions.failActionFunction,  
    },      
    plugins: {
      'hapi-swagger': {
        payloadType : 'form',
        responseMessages: APP_CONSTANTS.swaggerDefaultResponseMessages
      }
    }
  }
}

let getGroupDetails = {
  method: 'POST',
  path: '/api/postGroup/getGroupDetails',
  handler: function (request, reply) {
    let UserData = request.pre.verify || {};
    return Controller.PostGroupController.getGroupDetails(request.payload,UserData).then(response =>{
        return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => {   //console.log("errr=====",error);
        return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: ' ',
    tags: ['api', 'Post-Group'],
    pre: [{ method: checkAccessToken, assign: 'verify' }],
    validate: {
      payload:{
        groupId       : Joi.string().required().trim(),
      },     
      headers: Joi.object({'authorization': Joi.string().trim().required()}).options({allowUnknown: true}),
      failAction: UniversalFunctions.failActionFunction,  
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
  createGroup,
  addMember,
  getGroupList,
  getMemberOfGroup,
  createGroupPost,
  getGroupPost,
  deleteMemberOfGroup,
  deleteGroup,
  leftGroup,
  updateGroupIcon,
  updateGroupChannel,
  getGroupDetails
]