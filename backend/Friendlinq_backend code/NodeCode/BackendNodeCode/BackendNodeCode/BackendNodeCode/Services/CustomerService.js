'use strict';

const Models = require('../Models');
const Config = require('../Config');
const APP_CONSTANTS   =  Config.APP_CONSTANTS;
const STATUS_MSG      =  APP_CONSTANTS.STATUS_MSG
const Customer        = Models.Customer

const async = require("async");
//Get Users from DB
var getData = function (criteria, projection, options) { //console.log("==========CustomerService========getData======init======",criteria);
    return new Promise((resolve, reject) => {
        Customer.find(criteria, projection, options).then(data=>{   
             return resolve(data);
        }).catch(err => { //console.log("err",err);
             return reject(err);
        });
    })
    
};

var getTopFourFriendData = function (criteria, projection, options) { //console.log("==========CustomerService========getData======init======",criteria);
    return new Promise((resolve, reject) => {
        Models.TopFourFriend.find(criteria, projection, options).then(data=>{   
             return resolve(data);
        }).catch(err => { //console.log("err",err);
             return reject(err);
        });
    })
    
};

var InsertData = function (objToSave) {  //console.log("===========InsertData========objToSave========",objToSave);
    return new Promise((resolve, reject) => {
        new Customer(objToSave).save().then(data => {
            return resolve(data);
        }).catch(err => { 
            if (err.code == 11000 || 11001 === err.code) { 
                if (err.errmsg.indexOf('email_1') > -1) return reject(STATUS_MSG.ERROR.EMAIL_ALREADY_EXISTS); 
                if (err.errmsg.indexOf('mobileNumber_1') > -1) return reject(STATUS_MSG.ERROR.MOBILE_NUMBER_ALREADY_EXISTS); 
                if (err.errmsg.indexOf('deviceToken_1') > -1) return reject(STATUS_MSG.ERROR.DEVICE_TOKEN_ALREADY_EXISTS); 
                return reject(err);
            } else {
                return reject(err);
            }
        })
    })
};

var InsertTopFourFriendData = function (objToSave) {  //console.log("===========InsertData========objToSave========",objToSave);
    return new Promise((resolve, reject) => {
        new Models.TopFourFriend(objToSave).save().then(data => {
            return resolve(data);
        }).catch(err => { 
            if (err.code == 11000 || 11001 === err.code) { 
                return reject(err);
            } else {
                return reject(err);
            }
        })
    })
};

//Update User in DB
var updateData = function (criteria, dataToSet, options) {
    return new Promise((resolve, reject) => {
        Customer.findOneAndUpdate(criteria, dataToSet, options).then(data => {
            return resolve(JSON.parse(JSON.stringify(data)));
        }).catch(err => {
            if (err.code == 11000 || 11001 === err.code) {
               // if (err.errmsg.indexOf('categoryName_1_restaurant_1') > -1) return reject(STATUS_MSG.ERROR.CATEGORY_NAME_EXISTS);
                return reject(err);
            } else {
                return reject(err);
            }
        })
    })
};

var deleteOldTopFourFriend = function (criteria) {
    return new Promise((resolve, reject) => {
        Models.TopFourFriend.deleteMany(criteria).then(data => {
            return resolve(JSON.parse(JSON.stringify(data)));
        }).catch(err => {
            if (err.code == 11000 || 11001 === err.code) {
               // if (err.errmsg.indexOf('categoryName_1_restaurant_1') > -1) return reject(STATUS_MSG.ERROR.CATEGORY_NAME_EXISTS);
                return reject(err);
            } else {
                return reject(err);
            }
        })
    })
};

let updateMultipleDocuments = function (criteria, dataToSet, options) {
    return new Promise((resolve, reject) => {
        Customer.updateMany(criteria, dataToSet, options).then(data => {
            return resolve(data);
        }).catch(err => {
            if (err.code == 11000 || 11001 === err.code) {
                if (err.errmsg.indexOf('categoryName_1_restaurant_1') > -1) return reject(STATUS_MSG.ERROR.CATEGORY_NAME_EXISTS);
                return reject(err);
            } else {
                return reject(err);
            }
        })
    })
};

let dropIndex =  (IndexName)=>{
    return new Promise((resolve, reject) => {
        Customer.collection.dropIndex(IndexName).then(() => {
            return resolve();
        }).catch(err => {
            return reject(err);             
        })
    })
};


// let checkIndexExists =  (IndexName)=>{
//     try{
//         return new Promise((resolve, reject) => {
//           //let IndexExistsOrNot = Customer.collection.exists(IndexName);
//           let IndexExistsOrNot = Customer.collection.indexes.find({'name':'indexname'});
//           console.log("checkIndexExists",checkIndexExists);
//             return resolve(IndexExistsOrNot);
//         })
//     }catch(err){ 
//         console.log("err",err);
//         return reject(err);
//     }
    
// };
//checkIndexExists('deviceToken_1');
module.exports = {
    getData    : getData,
    InsertData : InsertData,
    updateData : updateData,
    updateMultipleDocuments:updateMultipleDocuments,
    getTopFourFriendData,
    deleteOldTopFourFriend,
    InsertTopFourFriendData
};
