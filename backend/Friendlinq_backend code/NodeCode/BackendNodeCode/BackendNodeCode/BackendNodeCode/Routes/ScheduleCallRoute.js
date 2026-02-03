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
const FRIEND_REQUEST_TYPE      =  APP_CONSTANTS.FRIEND_REQUEST_TYPE;
//console.log("DEVICE_TYPES",APP_CONSTANTS.swaggerDefaultResponseMessages);


const checkAccessToken = UniversalFunctions.getTokenFromDBForCustomer;

console.log('in routes- schedule--');

let  saveCallData =  {
  method: 'POST',
  path: '/api/v1/call/schedule',
  handler: function (request, reply) {  console.log("====route===="); 
    var payloadData = request.payload;  
    var UserData = request.pre.verify || {};  
    return Controller.ScheduleCallController.createCall(payloadData,UserData).then(response =>{
      return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => {  
        return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'saveCallData',
    tags: ['api', 'Schedule Call'],
    pre: [{ method: checkAccessToken, assign: 'verify' }],
    validate: {
      payload: {
        emails: Joi.string().required(),
        names: Joi.string().required(),
        title: Joi.string().required(),
        channelId: Joi.string().required(),
        scheduleDate: Joi.string().required(),
        // scheduleTime: Joi.string().required(),
        callType: Joi.string().required(),
        inviteLink: Joi.string().required(),
        hostId: Joi.string().required(),
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

let  saveCallDataWeb =  {
  method: 'POST',
  path: '/api/v1/call/web/schedule',
  handler: function (request, reply) {  console.log("====route===="); 
    var payloadData = request.payload;  
    var UserData = request.pre.verify || {};  
    return Controller.ScheduleCallController.createCallWeb(payloadData,UserData).then(response =>{
      return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => {  
        return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'saveCallData',
    tags: ['api', 'Schedule Call'],
    pre: [{ method: checkAccessToken, assign: 'verify' }],
    validate: {
      payload: {
        emails: Joi.string().required(),
        names: Joi.string().required(),
        title: Joi.string().required(),
        channelId: Joi.string().required(),
        scheduleDate: Joi.string().required(),
        // scheduleTime: Joi.string().required(),
        callType: Joi.string().required(),
        // inviteLink: Joi.string().required(),
        hostId: Joi.string().required(),
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

let  updateCallData =  {
  method: 'POST',
  path: '/api/v1/call/updateData',
  handler: function (request, reply) {  console.log("====route===="); 
    var payloadData = request.payload;  
    var UserData = request.pre.verify || {};  
    return Controller.ScheduleCallController.updateCall(payloadData,UserData).then(response =>{
      return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => {  
        return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'saveCallData',
    tags: ['api', 'update Call'],
    pre: [{ method: checkAccessToken, assign: 'verify' }],
    validate: {
      payload: {
        callId: Joi.string().required(),
        // isEnded: Joi.required()
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

let getAllCallRoute = {
  method: 'GET',
  path: '/api/v1/call/allList',
  handler: function (request, reply) {
    let UserData = request.pre.verify || {};
    return Controller.ScheduleCallController.getAllCall(request.query,UserData).then(response =>{
        return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => {   //console.log("errr=====",error);
        return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'Logout user',
    tags: ['api', 'Schedule Call list'],
    pre: [{ method: checkAccessToken, assign: 'verify' }],
    validate: {     
      headers: Joi.object({'authorization': Joi.string().trim().required()}).options({allowUnknown: true}),
      failAction: UniversalFunctions.failActionFunction,  
    },      
    plugins: {
      'hapi-swagger': {
          responseMessages: APP_CONSTANTS.swaggerDefaultResponseMessages
      }
    }
  }
};

let getSingleCallRoute = {
  method: 'GET',
  path: '/api/v1/call/single',
  handler: function (request, reply) {
    let UserData = request.pre.verify || {};
    return Controller.ScheduleCallController.getSingleCall(request.query,UserData).then(response =>{
        return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => {   //console.log("errr=====",error);
        return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'Logout user',
    tags: ['api', 'Schedule Call details'],
    pre: [{ method: checkAccessToken, assign: 'verify' }],
    validate: {   
      /* payload: {
        email: Joi.string().required(),
        channelId: Joi.string().required(),
      },  */ 
      headers: Joi.object({'authorization': Joi.string().trim().required()}).options({allowUnknown: true}),
      failAction: UniversalFunctions.failActionFunction,  
    },      
    plugins: {
      'hapi-swagger': {
          responseMessages: APP_CONSTANTS.swaggerDefaultResponseMessages
      }
    }
  }
};

module.exports = [
  saveCallData,
  saveCallDataWeb,
  getAllCallRoute,
  getSingleCallRoute,
  updateCallData
]
