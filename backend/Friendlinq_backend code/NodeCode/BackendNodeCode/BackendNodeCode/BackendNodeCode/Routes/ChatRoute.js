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

const generateChatRoomId = {
  method: 'POST',
  path: '/api/v1/chat/generateChatRoomId',
  handler: function (request, reply) {
  	let UserData = request.pre.verify || {}; 
    return Controller.ChatController.generateChatRoomId(request.payload,UserData).then(response =>{ //console.log("response",response);
      return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => { //console.log("error",error); 
        return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'send Message',
    tags: ['api', 'Chat'],
    pre: [{ method: checkAccessToken, assign: 'verify' }],
    validate: {
      payload: {
        receiverId         : Joi.string().required().trim(), 
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

const sendMessage = {
  method: 'POST',
  path: '/api/v1/chat/sendMessage',
  handler: function (request, reply) {
  	let UserData = request.pre.verify || {}; 
    return Controller.ChatController.sendMessage(request.payload,UserData).then(response =>{ //console.log("response",response);
      return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => { //console.log("error",error); 
        return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'send Message',
    tags: ['api', 'Chat'],
    pre: [{ method: checkAccessToken, assign: 'verify' }],
    validate: {
      payload: {
        receiverId         : Joi.string().required().trim(),
        textMessage        : Joi.string().required().trim(),  
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


const getChatMessage = {
  method: 'GET',
  path: '/api/v1/chat/getChatMessage',
  handler: function (request, reply) {
    let UserData = request.pre.verify || {}; 
    return Controller.ChatController.getChatMessage(request.query,UserData).then(response =>{ //console.log("response",response);
      return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => { //console.log("error",error); 
        return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'get Message',
    tags: ['api', 'Chat'],
    pre: [{ method: checkAccessToken, assign: 'verify' }],
    validate: {
      query: {
        receiverId   : Joi.string().required().trim(),
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

let chatMedia =  {
  method: 'POST',
  path: '/api/v1/chat/chatMedia',
  handler: function (request, reply) {  console.log("====route===="); 
    var payloadData = request.payload;  
    var UserData = request.pre.verify || {};  
    return Controller.ChatController.chatMedia(payloadData,UserData).then(response =>{
      return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => {  
        return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'chatMedia',
    tags: ['api', 'Chat'],
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
        receiverId   : Joi.string().required().trim(),
        isMediaTypeVideo:Joi.boolean().required(),
        isMediaTypeAudio:Joi.boolean().required(),
        videoThumbnail:Joi.any().meta({swaggerType: 'file'}).description('mediaFile'), 
        mediaFile: Joi.any().meta({swaggerType: 'file'}).description('mediaFile'), 
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


const getNotification = {
  method: 'GET',
  path: '/api/v1/notification/getNotification',
  handler: function (request, reply) {
    let UserData = request.pre.verify || {}; 
    return Controller.ChatController.getNotification(request.query,UserData).then(response =>{ //console.log("response",response);
      return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => { //console.log("error",error); 
        return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'get Message',
    tags: ['api', 'Notification'],
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

const viewAllNotification = {
  method: 'POST',
  path: '/api/v1/notification/viewAllNotification',
  handler: function (request, reply) {
    let UserData = request.pre.verify || {}; 
    return Controller.ChatController.viewAllNotification(request.query,UserData).then(response =>{ //console.log("response",response);
      return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => { //console.log("error",error); 
        return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'view All Notification',
    tags: ['api', 'Notification'],
    pre: [{ method: checkAccessToken, assign: 'verify' }],
    validate: {
      payload: {
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

const readNotification = {
  method: 'POST',
  path: '/api/v1/notification/readNotification',
  handler: function (request, reply) {
    let UserData = request.pre.verify || {}; 
    return Controller.ChatController.readNotification(request.payload,UserData).then(response =>{ //console.log("response",response);
      return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => { //console.log("error",error); 
        return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'view All Notification',
    tags: ['api', 'Notification'],
    pre: [{ method: checkAccessToken, assign: 'verify' }],
    validate: {
      payload: {
        notificationId: Joi.string().required().trim(),
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

const testNotification = {
  method: 'POST',
  path: '/v1/test/testFCM',
  handler: function (request, reply) {
    let UserData = request.pre.verify || {}; 
    return Controller.ChatController.sendNotificationTest(request.payload).then(response =>{ //console.log("response",response);
      return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => { //console.log("error",error); 
        return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'get Message',
    tags: ['api', 'test'],
    //pre: [{ method: checkAccessToken, assign: 'verify' }],
    validate: {
      payload: {
        message     : Joi.string().required(),
        deviceToken : Joi.string().required()
      },
      //headers: Joi.object({'authorization': Joi.string().trim().required()}).options({allowUnknown: true}),
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


const SendSMS = {
  method: 'POST',
  path: '/v1/sendSMS',
  handler: function (request, reply) {
    let UserData = request.pre.verify || {}; 
    console.log("there");
    return Controller.ChatController.sendSMS(request.payload).then(response =>{ //console.log("response",response);
      return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => { //console.log("error",error); 
        return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'SEND MESSAGE',
    tags: ['api', 'sms'],
    validate: {
      payload: {
        message     : Joi.string().required(),
        // country_code : Joi.string().required(),
        // phone_no : Joi.string().required()
      },
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
 generateChatRoomId,
 sendMessage,
 getChatMessage,
 chatMedia,
 getNotification,
 viewAllNotification,
 readNotification,
 testNotification,
 SendSMS,


]