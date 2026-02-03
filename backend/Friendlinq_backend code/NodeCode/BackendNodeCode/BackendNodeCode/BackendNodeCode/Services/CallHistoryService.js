'use strict';

const Models = require('../Models');
const Config = require('../Config');
const APP_CONSTANTS   =  Config.APP_CONSTANTS;
const STATUS_MSG      =  APP_CONSTANTS.STATUS_MSG
const TableName       = Models.CallHistory
const ScheduleCallTableName      = Models.ScheduleCall

const async = require("async");
//Get Users from DB
var getCallHistory = function (criteria, projection, options) {
    return new Promise((resolve, reject) => {
        TableName.findOne(criteria, projection, options).then(data=>{  //console.log("data",data,criteria);
             return resolve(data);
        }).catch(err => {
             return reject(err);
        });
    })
    
};

var InsertData = function (objToSave) {  //console.log("===========InsertData========objToSave========",objToSave);
    return new Promise((resolve, reject) => {
        new TableName(objToSave).save().then(data => {
            return resolve(data);
        }).catch(err => { 
            return reject(err);
        })
    })
};

var InsertScheduleCallData = function (objToSave) {  //console.log("===========InsertData========objToSave========",objToSave);
    return new Promise((resolve, reject) => {
        new ScheduleCallTableName(objToSave).save().then(data => {
            return resolve(data);
        }).catch(err => { 
            return reject(err);
        })
    })
};

var getAllScheduleCallHistory = function (criteria, projection, options) {
    return new Promise((resolve, reject) => {
        ScheduleCallTableName.find(criteria, projection, options).then(data=>{  //console.log("data",data,criteria);
             return resolve(data);
        }).catch(err => {
             return reject(err);
        });
    })
    
};

var getSingleScheduleCallHistory = function (criteria, projection, options) {
    console.log(criteria,'--criteria--');
    return new Promise((resolve, reject) => {
        ScheduleCallTableName.findOne(criteria, projection, options).then(data=>{  //console.log("data",data,criteria);
             return resolve(data);
        }).catch(err => {
             return reject(err);
        });
    })
    
};

var updateScheduleCallHistory = function (criteria, dataToSet, options) {
    return new Promise((resolve, reject) => {
        ScheduleCallTableName.findOneAndUpdate(criteria, dataToSet, options).then(data => {
            return resolve(data);
        }).catch(err => {
            return reject(err);
        })
    })
};

//Update User in DB
var updateCallHistory = function (criteria, dataToSet, options) {
    return new Promise((resolve, reject) => {
        TableName.findOneAndUpdate(criteria, dataToSet, options).then(data => {
            return resolve(data);
        }).catch(err => {
            return reject(err);
        })
    })
};
module.exports = {
    getCallHistory :  getCallHistory,
    InsertData : InsertData,
    updateCallHistory :  updateCallHistory,
    InsertScheduleCallData,
    getAllScheduleCallHistory,
    getSingleScheduleCallHistory,
    updateScheduleCallHistory
};
