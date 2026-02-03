'use strict';

const Models = require('../Models');
const Config = require('../Config');
const APP_CONSTANTS   =  Config.APP_CONSTANTS;
const STATUS_MSG      =  APP_CONSTANTS.STATUS_MSG
const PostTagModel      = Models.PostTag

const async = require("async");



var InsertData = function (objToSave) {  //console.log("objToSave==",objToSave);
    return new Promise((resolve, reject) => {
        console.log(">>>>>>>>>>>>>Obj TO Save",objToSave)
        new PostTagModel(objToSave).save().then(data => {
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



module.exports = {
    InsertData : InsertData,  
};
