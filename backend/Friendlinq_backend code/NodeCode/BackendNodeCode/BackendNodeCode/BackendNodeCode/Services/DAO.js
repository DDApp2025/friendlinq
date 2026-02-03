/**
 * Created by Anurag on 25/03/19.
 */

//const log4js = require('log4js');
//const logger = log4js.getLogger('[DAO]');
const Models = require('../Models');
const Config = require('../Config');
const APP_CONSTANTS   =  Config.APP_CONSTANTS;
const STATUS_MSG      =  APP_CONSTANTS.STATUS_MSG

/*
 ---------------------------------------------------------------------------------------------
 WARNING: Not a general module just for category-sub-service tree or for two level tree only
 ---------------------------------------------------------------------------------------------
 */

/*exports.getDataDeepPopulateFixed = function (model, query, projectionQuery, options, populateModel, nestedModel, callback) {

    model.find(query, projectionQuery, options).populate(populateModel)
        .exec(function (err, docs) {

            if (err) {
                return callback(err, docs);
            }
            model.populate(docs, nestedModel,
                function (err, populatedDocs) {
                    if (err) return callback(err);
                    callback(null, populatedDocs);// This object should now be populated accordingly.
                });
        });
};


/*
 ----------------------------------------
 GET DATA WITH REFERENCE
 ----------------------------------------
 */
/*
//Models.OrderTable,criteria, projection, option,populateModel
exports.getDataWithReferenceFixed = function (model, query, projection, options, collectionOptions, callback) { //console.log("options",options);

    model.find(query, projection, options).populate(collectionOptions).exec(function (err, data) {
    //model.find(query).select(projection).populate(collectionOptions).sort(options).exec(function (err, data) {

        if (err) {
            logger.error("Error Data reference: ", err);
            var response = {
                message: STATUS_MSG.ERROR.ERROR_IN_EXECUTION,//constants.responseMessage.ERROR_IN_EXECUTION,
                data: {}
            };
            var errResponse = {
                response: response,
                details: err,
                statusCode: 400
            };

            callback(errResponse);
        }
        else {

            callback(null, data);
        }
    });
};
*/
exports.getDataDeepPopulateFixed = async (model, query, projectionQuery, options, populateModel, nestedModel)=>{
    return new Promise((resolve, reject) => {
       model.find(query, projectionQuery, options).populate(populateModel).exec().then(data=>{
           model.populate(data, nestedModel).then((data1)=>{
              return resolve(data1);
           })
       }).catch(err=>{
           reject(err);
       })
    })
};

exports.getDataWithReferenceFixed = async (model, query, projection, options, collectionOptions)=>{ 
    return new Promise((resolve, reject) => {
        model.find(query, projection, options).populate(collectionOptions).exec().then(data=>{
            data = JSON.parse(JSON.stringify(data));
            return resolve(data);
        }).catch(err => { console.log("getDataWithReferenceFixed=====errr",err);
            var response = {
                    message: STATUS_MSG.ERROR.ERROR_IN_EXECUTION,//constants.responseMessage.ERROR_IN_EXECUTION,
                    data: {}
                };
            var errResponse = {
                    response: response,
                    details: err,
                    statusCode: 400
                };

            reject(errResponse);
        })
    })
};

exports.getDataWithAggregate = function (model,aggregateQuery, options) {
    return new Promise((resolve, reject) => {
        model.aggregate(aggregateQuery).exec().then(data=>{
            data = JSON.parse(JSON.stringify(data));
            return resolve(data);
        }).catch(err => {
            var response = {
                    message: STATUS_MSG.ERROR.ERROR_IN_EXECUTION,//constants.responseMessage.ERROR_IN_EXECUTION,
                    data: {}
                };
            var errResponse = {
                    response: response,
                    details: err,
                    statusCode: 400
                };

            reject(errResponse);
        })
    })
};













exports.findOneAndUpdateData = function (model, conditions, update, options, callback) {
    model.findOneAndUpdate(conditions, update, options, function (error, result) {
        if (error) {
            logger.error("Find one and update", error);
            return callback(error);
        }
        return callback(null, result);
    })
}

exports.UpdateMultipleRecords = function (model, conditions, update, options, callback) {
    model.update(conditions, update, options, function (error, result) {
        if (error) {
            logger.error("update multiple", error);
            return callback(error);
        }
        return callback(null, result);
    })
}
//Models.OrderTable,criteria, {}, option1,populateModel
exports.getDataWithReferenceFixedAndSort = function (model, query, projection, options, collectionOptions, callback) { //console.log("options",options);

    //model.find(query, projection, options).populate(collectionOptions).exec(function (err, data) {
    model.find(query).select(projection).populate(collectionOptions).sort(options).exec(function (err, data) {

        if (err) {
            logger.error("Error Data reference: ", err);
            var response = {
                message: ERROR_MESSAGE.ERROR_IN_EXECUTION,//constants.responseMessage.ERROR_IN_EXECUTION,
                data: {}
            };
            var errResponse = {
                response: response,
                details: err,
                statusCode: 400
            };

            callback(errResponse);
        }
        else {

            callback(null, data);
        }
    });
};
exports.getDataWithSort = function (model,criteria, projection, options, callback) {
    //console.log("asdasd",model,criteria, projection, options);
    model.find(criteria).select(projection).sort(options).exec(function (err, data) {
        if(err) return callback(err);
        return callback(null,data);
    });
};


exports.countData = function (model,criteria,callback) {
    model.count(criteria, callback);
};
