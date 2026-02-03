'use strict';
const MongoClient = require('mongoose');
//const mysql = require("mysql");

//const url = 'mongodb://natural:Q4uppPfxO9jLgphT@cluster0.g6n5mru.mongodb.net/?authSource=natural'; 

// const url = "mongodb://mongoadmindev:RMSDev5673##points#@107.180.75.184:27017/natural?authSource=admin";
const url = "mongodb://mongoadmindev:RMSDev5673%23%23points%23@107.180.75.184:27017/?authSource=admin&readPreference=primary&appname=MongoDB%20Compass&directConnection=true&ssl=false"
// const url = "mongodb://localhost:27017/natural";

let mongodb = (payloadData) => { console.log("here");
  return new Promise(async (resolve, reject) => {
      try {
        const client = await MongoClient.connect(url, { useNewUrlParser: true, dbName:'natural' })
          console.log('*************************************************mongodb db connected sucessfully*************************************************');
          return resolve(client);
      }
      catch (error) {
          console.log(error, '====db connection Error==');
          return reject(error);
      }
  })
};
mongodb();


module.exports ={
  
}; 


