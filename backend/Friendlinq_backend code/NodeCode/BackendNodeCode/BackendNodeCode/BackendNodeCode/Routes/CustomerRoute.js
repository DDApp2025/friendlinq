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

console.log('in routes---');
const customerRegister = {
  method: 'POST',
  path: '/api/v1/user/registration',
  handler: function (request, reply) {
    return Controller.CustomerController.registration(request.payload).then(response =>{ 
      console.log("response",response);
      if(response.customerData.email){
        UniversalFunctions.sendSMS({
          message : "Hi Robert, "+response.customerData.email+" Signup in our FL app. please contact this new user"
        });
      }
      return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => { //console.log("error",error); 
        return UniversalFunctions.sendError(error) ;  
    });
  },
  config: { 
    description: 'Login Via Email & Password For  customer',
    tags: ['api', 'User'],
    validate: {
      payload: Joi.object({
        fullName: Joi.string().regex(/^[a-zA-Z ]+$/).allow(null).allow('').optional().trim(),
        email: Joi.string().email().required(),
        password: Joi.string().required().min(5).trim(),
        age: Joi.allow(null).allow('').optional(),
        country: Joi.string().allow(null).allow('').optional().trim(),
        gender: Joi.string().allow(null).allow('').optional().trim(),
        deviceType: Joi.string().required().valid([DEVICE_TYPES.IOS,DEVICE_TYPES.ANDROID]),
        deviceToken: Joi.string().trim(),          
        usertype: Joi.string().trim(),          
      }).unknown(),
      failAction: UniversalFunctions.failActionFunction
    },
    plugins: {
      'hapi-swagger': {
          //payloadType : 'form',
          responseMessages: APP_CONSTANTS.swaggerDefaultResponseMessages
      }
    }
  }
}

let login = {
  method: 'POST',
  path: '/api/v1/user/login',
  handler: function (request, reply) {
    var payloadData = request.payload;
    console.log(">>>>>>>>>>>>>>>",payloadData)
    return Controller.CustomerController.login(payloadData).then(response =>{
      return  UniversalFunctions.successResponse(null, response) ;   
    }).catch(error => {  
        return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'Login Via Email & Password For  Restaurant',
    tags: ['api', 'User'],
    validate: {
        payload: {
      	  email: Joi.string().email().required(),
          password:     Joi.string().required().min(5).trim(),
          deviceType:  Joi.string().required().valid([DEVICE_TYPES.IOS,DEVICE_TYPES.ANDROID]),
          deviceToken: Joi.string().trim().required(),
          latitude :   Joi.number().required(),
          longitude :  Joi.number().required(),
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

let getUserByEmail = {
  method: 'POST',
  path: '/api/v1/user/getUserByEmail',
  handler: function (request, reply) {
    var payloadData = request.payload;
    return Controller.CustomerController.getUserByEmail(payloadData).then(response =>{
      return  UniversalFunctions.successResponse(null, response) ;   
    }).catch(error => {  
        return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'Get User By Email',
    tags: ['api', 'User'],
    validate: {
        payload: {
      	  email: Joi.string().email().required()         
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


let loginWithGoogle = {
  method: 'POST',
  path: '/api/v1/user/loginWithGoogle',
  handler: function (request, reply) {
    var payloadData = request.payload;
    return Controller.CustomerController.loginWithGoogle(payloadData).then(response =>{
      if(response.customerData.email){
        UniversalFunctions.sendSMS({
          message : "Hi Robert , "+response.customerData.email+" Signup in our FL app. please contact this new user"
        });
      }
      return  UniversalFunctions.successResponse(null, response) ;   
    }).catch(error => {  
        return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'Login Via Email & Password For  Restaurant',
    tags: ['api', 'User'],
    validate: {
        payload: {
      	  email: Joi.string().email().required(),
          googleId:     Joi.string().required().min(2).trim(),
          deviceType:  Joi.string().required().valid([DEVICE_TYPES.IOS,DEVICE_TYPES.ANDROID]),
          deviceToken: Joi.string().trim().required(),
          latitude :   Joi.number().required(),
          longitude :  Joi.number().required(),
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

let  uploadsBannerImage =  {
  method: 'POST',
  path: '/api/v1/user/uploadsBannerImage',
  handler: function (request, reply) {  console.log("====route===="); 
    var payloadData = request.payload;  
    var UserData = request.pre.verify || {};  
    return Controller.CustomerController.uploadBannerImage(payloadData,UserData).then(response =>{
      return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => {  
        return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'uploadsBannerImage',
    tags: ['api', 'User'],
    payload: {
      maxBytes: 300000000000,
      output: 'stream',
      parse: true,
      allow: 'multipart/form-data',
      timeout: false,
      parse: true,
    },
    pre: [{ method: checkAccessToken, assign: 'verify' }],
    validate: {
      payload: {
        document: Joi.any().meta({swaggerType: 'file'}).required().description('document file'), 
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

let  uploadsProfilePic =  {
  method: 'POST',
  path: '/api/v1/user/uploadsProfilePic',
  handler: function (request, reply) {  console.log("====route===="); 
    var payloadData = request.payload;  
    var UserData = request.pre.verify || {};  
    return Controller.CustomerController.uploadFiles(payloadData,UserData).then(response =>{
      return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => {  
        return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'uploadsProfilePic',
    tags: ['api', 'User'],
    payload: {
      maxBytes: 300000000000,
      output: 'stream',
      parse: true,
      allow: 'multipart/form-data',
      timeout: false,
      parse: true,
    },
    pre: [{ method: checkAccessToken, assign: 'verify' }],
    validate: {
      payload: {
        document: Joi.any().meta({swaggerType: 'file'}).required().description('document file'), 
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

let  saveProfileData =  {
  method: 'POST',
  path: '/api/v1/user/saveProfileData',
  handler: function (request, reply) {  console.log("====route===="); 
    var payloadData = request.payload;  
    var UserData = request.pre.verify || {};  
    return Controller.CustomerController.saveProfileData(payloadData,UserData).then(response =>{
      return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => {  
        return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'uploadsProfilePic',
    tags: ['api', 'User'],
    pre: [{ method: checkAccessToken, assign: 'verify' }],
    validate: {
      payload: Joi.object({
        fullName: Joi.string().regex(/^[a-zA-Z ]+$/).trim(),
        //email: Joi.string().email().required(),
        //age: Joi.number().required(),
        //weight: Joi.string().required().trim(),
        country: Joi.string().trim(),
        city:  Joi.string().allow(null).allow('').optional().trim(),
        state:  Joi.string().allow(null).allow('').optional().trim(),
        phoneNumber: Joi.string().allow(null).allow('').optional().trim(),
        about: Joi.string().allow(null).allow('').optional().trim(),
        gender: Joi.string().valid([GENDER_TYPES.Male,GENDER_TYPES.Female, GENDER_TYPES.Other]),
      }).unknown(),
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

let changePassword = {
  method: 'POST',
  path: '/api/v1/user/changePassword',
  handler: function (request, reply) {  
    let UserData = request.pre.verify || {}; 
    return Controller.CustomerController.changePassword(request.payload,UserData).then(response =>{
        return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => {    
        return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'Change Password user',
      tags: ['api', 'User'],
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

let logout = {
    method: 'PUT',
    path: '/api/user/logout',
    handler: function (request, reply) {
         let UserData = request.pre.verify || {};  
        return Controller.CustomerController.logout(UserData).then(response =>{
            return  UniversalFunctions.successResponse(null, response)  ;   
        }).catch(error => {   //console.log("errr=====",error);
            return UniversalFunctions.sendError(error) ;  
        });
    },
    config: {
      description: 'Logout user',
      tags: ['api', 'User'],
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

let getProfile = {
  method: 'GET',
  path: '/api/user/getProfile',
  handler: function (request, reply) {
    let UserData = request.pre.verify || {};
    return Controller.CustomerController.getProfile(request.query,UserData).then(response =>{
        return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => {   //console.log("errr=====",error);
        return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'Logout user',
    tags: ['api', 'User'],
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


let getProfileofAnotherUser = {
  method: 'POST',
  path: '/api/user/getProfileofAnotherUser',
  handler: function (request, reply) {
    let UserData = request.pre.verify || {};
    return Controller.CustomerController.getProfileofAnotherUser(request.payload,UserData).then(response =>{
        return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => {   //console.log("errr=====",error);
        return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'Logout user',
    tags: ['api', 'User'],
    pre: [{ method: checkAccessToken, assign: 'verify' }],
    validate: {
      payload:{
        userId: Joi.string().required(),
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
};

let searchUser = {
  method: 'POST',
  path: '/api/user/searchUser',
  handler: function (request, reply) {
    let UserData = request.pre.verify || {};
    return Controller.CustomerController.searchUser(request.payload,UserData).then(response =>{
        return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => {   //console.log("errr=====",error);
        return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'Logout user',
    tags: ['api', 'User'],
    pre: [{ method: checkAccessToken, assign: 'verify' }],
    validate: {
      payload:{
        searchText: Joi.string().required(),
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
};

let sendFriendRequest = {
  method: 'POST',
  path: '/api/user/sendFriendRequest',
  handler: function (request, reply) {
    let UserData = request.pre.verify || {};
    return Controller.CustomerController.sendFriendRequest(request.payload,UserData).then(response =>{
        return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => {   //console.log("errr=====",error);
        return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'Logout user',
    tags: ['api', 'User'],
    pre: [{ method: checkAccessToken, assign: 'verify' }],
    validate: {
      payload:{
       userToId: Joi.string().required(),
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
};



let acceptFriendRequest = {
  method: 'POST',
  path: '/api/user/acceptFriendRequest',
  handler: function (request, reply) {
    let UserData = request.pre.verify || {};
    return Controller.CustomerController.acceptFriendRequest(request.payload,UserData).then(response =>{
        return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => {   //console.log("errr=====",error);
        return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'Logout user',
    tags: ['api', 'User'],
    pre: [{ method: checkAccessToken, assign: 'verify' }],
    validate: {
      payload:{
       //friendRequestId:Joi.string().required(),
       userToId: Joi.string().required(),
       status:Joi.string().required().valid([
         FRIEND_REQUEST_TYPE.ACCEPTED,FRIEND_REQUEST_TYPE.REJECTED,
         FRIEND_REQUEST_TYPE.UNFRIEND,FRIEND_REQUEST_TYPE.CANCELED])
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
};

let getFriendList = {
  method: 'POST',
  path: '/api/user/getFriendList',
  handler: function (request, reply) {
    console.log('----in frientlst routes------------');
    let UserData = request.pre.verify || {};
    return Controller.CustomerController.getFriendList(request.payload,UserData).then(response =>{
        return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => {   //console.log("errr=====",error);
        return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'Logout user',
    tags: ['api', 'User'],
    pre: [{ method: checkAccessToken, assign: 'verify' }],
    validate: {
      payload:{
        skip: Joi.number().integer().required(),
        limit: Joi.number().integer().required(),
        status:Joi.string().required().valid([FRIEND_REQUEST_TYPE.ACCEPTED,
          FRIEND_REQUEST_TYPE.INVITATION,
          FRIEND_REQUEST_TYPE.SEND
        ])
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
};


let verifyOtp = {
  method: 'POST',
  path: '/api/user/verifyOtp',
  handler: function (request, reply) {
    let UserData = request.pre.verify || {};  
    return Controller.CustomerController.verifyOtp(request.payload).then(response =>{
        return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => {   //console.log("errr=====",error);
        return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'verifyOtp',
    tags: ['api', 'User'],
    //pre: [{ method: checkAccessToken, assign: 'verify' }],
    validate: {
      payload: {
        email:Joi.string().email().required().trim(),
        otp: Joi.string().required().min(3).trim(),
        isForgotPassword:Joi.boolean().required(),
      },     
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
  method: 'POST',
  path: '/api/v1/user/forgotPassword',
  handler: function (request, reply) {  
      return Controller.CustomerController.forgotPassword(request.payload,{}).then(response =>{
          return  UniversalFunctions.successResponse(null, response);   
      }).catch(error => {   console.log("====errr=====",error);
          return UniversalFunctions.sendError(error) ;  
      });
  },
  config: {
    description: 'Sends Otp on email',
    tags: ['api', 'User'],
    validate: {
      payload: {
        email:Joi.string().email().required().trim(),
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
  method: 'POST',
  path: '/api/user/resetPassword',
  handler: function (request, reply) {
    let queryData = request.payload;
    //let queryData = request.query;
    return Controller.CustomerController.resetPassword(queryData).then(response=>{
        return  UniversalFunctions.successResponse(null, response); 
    }).catch(error => {   //console.log("====errr===resetPassword====",error);
       return UniversalFunctions.sendError(error) ;     
    });
  },
  config: {
    description: 'Reset Password For Customer',
    tags: ['api', 'User'],
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

let commentOnOff = {
  method: 'POST',
  path: '/api/v1/user/commentOnOff',
  handler: function (request, reply) {  
    let UserData = request.pre.verify || {}; 
    return Controller.CustomerController.commentOnOff(request.payload,UserData).then(response =>{
        return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => {   //console.log("errr=====",error);
        return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'Comment on off',
      tags: ['api', 'User'],
      pre: [{ method: checkAccessToken, assign: 'verify' }],
      validate: {
        payload: {
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

let autoRefresh = {
  method: 'POST',
  path: '/api/v1/user/autoRefresh',
  handler: function (request, reply) {  
    let UserData = request.pre.verify || {}; 
    return Controller.CustomerController.autoRefresh(request.payload,UserData).then(response =>{
        return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => {   //console.log("errr=====",error);
        return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'Autorefresh on off',
      tags: ['api', 'User'],
      pre: [{ method: checkAccessToken, assign: 'verify' }],
      validate: {
        payload: {
          // userId:Joi.string().required().length(24).trim(),
          autoRefresh:Joi.boolean().required(),
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

let updateWallpaperData = {
  method: 'POST',
  path: '/api/v1/user/updateWallpaperData',
  handler: function (request, reply) {  
    let UserData = request.pre.verify || {}; 
    return Controller.CustomerController.updateWallpaperData(request.payload,UserData).then(response =>{
        return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => {   //console.log("errr=====",error);
        return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'Wallpaper update',
      tags: ['api', 'User'],
      pre: [{ method: checkAccessToken, assign: 'verify' }],
      validate: {
        payload: {
          // userId:Joi.string().required().length(24).trim(),
          wallpaper:Joi.string().required(),
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

let updateUserVideo = {
  method: 'POST',
  path: '/api/v1/user/updateUserVideo',
  handler: function (request, reply) {  
    let UserData = request.pre.verify || {}; 
    return Controller.CustomerController.updateUserVideo(request.payload,UserData).then(response =>{
        return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => {   //console.log("errr=====",error);
        return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'Wallpaper update',
      tags: ['api', 'User'],
      pre: [{ method: checkAccessToken, assign: 'verify' }],
      validate: {
        payload: {
          // userId:Joi.string().required().length(24).trim(),
          userVideo:Joi.string(),
          userVideoThumbnail:Joi.string(),
          userVideoDating:Joi.string(),
          userVideoThumbnailDating:Joi.string(),
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

let addTopFourFriend = {
  method: 'POST',
  path: '/api/v1/user/addTopFourFriend',
  handler: function (request, reply) {  
    let UserData = request.pre.verify || {}; 
    return Controller.CustomerController.addTopFourFriend(request.payload,UserData).then(response =>{
        return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => {   //console.log("errr=====",error);
        return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'Wallpaper update',
      tags: ['api', 'User'],
      pre: [{ method: checkAccessToken, assign: 'verify' }],
      validate: {
        payload: {
          // userId:Joi.string().required().length(24).trim(),
          friendList:Joi.required(),
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

let addTopFourImage = {
  method: 'POST',
  path: '/api/v1/user/addTopFourImage',
  handler: function (request, reply) {  
    let UserData = request.pre.verify || {}; 
    return Controller.CustomerController.addTopFourImage(request.payload,UserData).then(response =>{
        return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => {   //console.log("errr=====",error);
        return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'Wallpaper update',
      tags: ['api', 'User'],
      pre: [{ method: checkAccessToken, assign: 'verify' }],
      validate: {
        payload: {
          // userId:Joi.string().required().length(24).trim(),
          image:Joi.required(),
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
  customerRegister,
  login,
  loginWithGoogle,
  uploadsBannerImage,
  uploadsProfilePic,
  saveProfileData,
  changePassword,
  logout,
  getProfile,
  getProfileofAnotherUser,
  searchUser,
  sendFriendRequest,
  verifyOtp,
  forgotPassword,
  resetPassword,
  acceptFriendRequest,
  getFriendList,
  getUserByEmail,
  commentOnOff,
  updateWallpaperData,
  autoRefresh,
  updateUserVideo,
  addTopFourFriend,
  addTopFourImage
]
