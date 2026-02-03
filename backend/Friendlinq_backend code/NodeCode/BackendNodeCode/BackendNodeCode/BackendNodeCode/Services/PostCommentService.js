'use strict';

const Models = require('../Models');
const Config = require('../Config');
const APP_CONSTANTS   =  Config.APP_CONSTANTS;
const STATUS_MSG      =  APP_CONSTANTS.STATUS_MSG
const PostCommentModel      = Models.PostComment

const async = require("async");
//Get Users from DB
var getData = function (criteria, projection, options) {
    return new Promise((resolve, reject) => {
        PostCommentModel.find(criteria, projection, options).then(data=>{  //console.log("data",data,criteria);
             return resolve(data);
        }).catch(err => {
             return reject(err);
        });
    })
    
};

var InsertData = function (objToSave) {  //console.log("objToSave==",objToSave);
    return new Promise((resolve, reject) => {
        new PostCommentModel(objToSave).save().then(data => {
            return resolve(data);
        }).catch(err => { 
            if (err.code == 11000 || err.code===11001 ) { 
                console.log("err==27=====",err);
                if (err.errmsg.indexOf('categoryName_1') > -1) return reject(STATUS_MSG.ERROR.CATEGORY_NAME_EXISTS);
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
        PostCommentModel.findOneAndUpdate(criteria, dataToSet, options).then(data => {
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

//Delete User in DB
var deleteData = function (criteria) {    
    return new Promise((resolve, reject) => {
        PostCommentModel.findOneAndRemove(criteria).then(data=>{  //console.log("data",data,criteria);
             return resolve(data);
        }).catch(err => {
             return reject(err);
        });
    })
};


module.exports = {
    getData    : getData,
    InsertData : InsertData,
    updateData : updateData,
    deleteData : deleteData,
};
