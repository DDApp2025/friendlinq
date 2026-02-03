const BaseJoi = require('joi');
const Extension = require('joi-date-extensions');
const Joi = BaseJoi.extend(Extension);
const UniversalFunctions = require('../Utils/UniversalFunctions');
const Controller        =  require('../Controllers');
const CONFIG            =  require('../Config');
const APP_CONSTANTS     =  CONFIG.APP_CONSTANTS;
const DEVICE_TYPES      =  APP_CONSTANTS.DEVICE_TYPES;
const SOCIAL_MODE_TYPE  =  APP_CONSTANTS.SOCIAL_MODE_TYPE;
//console.log("DEVICE_TYPES",APP_CONSTANTS.swaggerDefaultResponseMessages);


const checkAccessToken = UniversalFunctions.getTokenFromDBForAdmin;



let login = {
  method: 'POST',
  path: '/api/v1/admin/login',
  handler: function (request, reply) {
    var payloadData = request.payload;
    return Controller.AdminController.login(payloadData).then(response =>{
      return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => {  
        return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'Login Via Email & Password For  Restaurant',
    tags: ['api', 'Admin'],
    validate: {
        payload: {
      	  email : Joi.string().required().trim(),
          password:     Joi.string().required().min(5).trim(),
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

let logout = {
    method: 'PUT',
    path: '/api/admin/logout',
    handler: function (request, reply) {
         let UserData = request.pre.verify || {};  
        return Controller.AdminController.logout(UserData).then(response =>{
            return  UniversalFunctions.successResponse(null, response)  ;   
        }).catch(error => {   //console.log("errr=====",error);
            return UniversalFunctions.sendError(error) ;  
        });
    },
    config: {
      description: 'Logout Driver',
      tags: ['api', 'Admin'],
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

let changePassword = {
  method: 'POST',
  path: '/api/v1/admin/changePassword',
  handler: function (request, reply) {  
    let UserData = request.pre.verify || {}; 
    return Controller.AdminController.changePassword(request.payload,UserData).then(response =>{
        return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => {   //console.log("errr=====",error);
        return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'Change Password Admin',
      tags: ['api', 'Admin'],
      pre: [{ method: checkAccessToken, assign: 'verify' }],
      validate: {
        payload: {
          oldPassword: Joi.string().required().min(5).trim(),
          newPassword: Joi.string().required().min(5).trim()
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

let blockUnBlockUser = {
  method: 'POST',
  path: '/api/v1/admin/blockUnBlockUser',
  handler: function (request, reply) {  
    let UserData = request.pre.verify || {}; 
    return Controller.AdminController.blockUnBlockUser(request.payload,UserData).then(response =>{
        return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => {   //console.log("errr=====",error);
        return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'Change Password Admin',
      tags: ['api', 'Admin'],
      pre: [{ method: checkAccessToken, assign: 'verify' }],
      validate: {
        payload: {
          userId:Joi.string().required().length(24).trim(),
          isBlock:Joi.boolean().required(),
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

let getUserList = {
  method: 'POST',
  path: '/api/admin/getUserList',
  handler: function (request, reply) {
    let UserData = request.pre.verify || {};
    return Controller.AdminController.userList(request.payload,UserData).then(response =>{
        return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => {   //console.log("errr=====",error);
        return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'Logout user',
    tags: ['api', 'Admin'],
    pre: [{ method: checkAccessToken, assign: 'verify' }],
    validate: {
      payload:{
        searchText:Joi.string(),
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

/*

let verifyOtp = {
  method: 'PUT',
  path: '/api/customer/verifyOtp',
  handler: function (request, reply) {
    let UserData = request.pre.verify || {};  
    return Controller.CustomerController.verifyOtp(request.payload).then(response =>{
        return  UniversalFunctions.sendSucces(null, response)  ;   
    }).catch(error => {   //console.log("errr=====",error);
        return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'verifyOtp',
    tags: ['api', 'Customer'],
    //pre: [{ method: checkAccessToken, assign: 'verify' }],
    validate: {
      payload: {
        countryCode:Joi.string().required().trim(),
        mobileNumber: Joi.string().required().min(5).trim(),
        otp: Joi.string().required().min(3).trim(),
        isForgotPassword:Joi.boolean().required(),
      },     
      //headers: Joi.object({'authorization': Joi.string().trim().required()}).options({allowUnknown: true}),
      failAction: UniversalFunctions.failActionFunction,  
    },      
    plugins: {
      'hapi-swagger': {
        responseMessages: APP_CONSTANTS.swaggerDefaultResponseMessages
      }
    }
  }
};

let forgotPassword ={
  method: 'PUT',
  path: '/api/v1/customer/forgotPassword',
  handler: function (request, reply) {  
      return Controller.CustomerController.forgotPassword(request.payload,{}).then(response =>{
          return  UniversalFunctions.sendSucces(null, response);   
      }).catch(error => {   console.log("====errr=====",error);
          return UniversalFunctions.sendError(error) ;  
      });
  },
  config: {
    description: 'Sends Otp on email',
    tags: ['api', 'Customer'],
    validate: {
      payload: {
        countryCode:Joi.string().required().trim(),
        mobileNumber: Joi.string().required().min(5).trim(),
      },
      failAction: UniversalFunctions.failActionFunction
    },
    plugins: {
      'hapi-swagger': {
          responseMessages: APP_CONSTANTS.swaggerDefaultResponseMessages
      }
    }
  }
}

let resetPassword =  {
  method: 'PUT',
  path: '/api/customer/resetPassword',
  handler: function (request, reply) {
    let queryData = request.payload;
    //let queryData = request.query;
    return Controller.CustomerController.resetPassword(queryData).then(response=>{
        return  UniversalFunctions.sendSucces(null, response); 
    }).catch(error => {   //console.log("====errr===resetPassword====",error);
       return UniversalFunctions.sendError(error) ;     
    });
  },
  config: {
    description: 'Reset Password For Customer',
    tags: ['api', 'Customer'],
    validate: {
      payload: {
        passwordResetToken: Joi.string().required(),
        newPassword : Joi.string().min(5).required()
      },
      failAction: UniversalFunctions.failActionFunction
    },
    plugins: {
      'hapi-swagger': {
        responseMessages: APP_CONSTANTS.swaggerDefaultResponseMessages
      }
    }
  }
}
*/
module.exports = [
  login,
  changePassword,
  logout,
  getUserList,
  blockUnBlockUser
  // verifyOtp,
  // forgotPassword,
  // resetPassword

]