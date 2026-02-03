'use strict';

const Models = require('../Models');
const Config = require('../Config');
const APP_CONSTANTS   =  Config.APP_CONSTANTS;
const STATUS_MSG      =  APP_CONSTANTS.STATUS_MSG
const CategoryModel      = Models.Category

const async = require("async");
//Get Users from DB
var getCategory = function (criteria, projection, options) {
    return new Promise((resolve, reject) => {
        CategoryModel.find(criteria, projection, options).then(data=>{  //console.log("data",data,criteria);
             return resolve(data);
        }).catch(err => {
             return reject(err);
        });
    })
    
};

var createCategory = function (objToSave) {  //console.log("objToSave==",objToSave);
    return new Promise((resolve, reject) => {
        new CategoryModel(objToSave).save().then(data => {
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
var updateCategory = function (criteria, dataToSet, options) {
    return new Promise((resolve, reject) => {
        CategoryModel.findOneAndUpdate(criteria, dataToSet, options).then(data => {
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
var deleteCategory = function (criteria) {    
    return new Promise((resolve, reject) => {
        CategoryModel.findOneAndRemove(criteria).then(data=>{  //console.log("data",data,criteria);
             return resolve(data);
        }).catch(err => {
             return reject(err);
        });
    })
};


module.exports = {
    getCategory    : getCategory,
    createCategory : createCategory,
    updateCategory : updateCategory,
    deleteCategory : deleteCategory,
};
