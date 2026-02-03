/**
 * Created by Anurag on 13/04/2020.
 */
const Path = require('path');
const _ = require('underscore');
//const fs = require('fs').promises;
//const readFilePromise = require('fs-readfile-promise');
const Mongoose = require('mongoose');
const nodemailer = require('nodemailer');

const FCM = require('fcm-node');

const Service = require('../Services');
const Models  = require('../Models');
const Config = require('../Config');
const UniversalFunctions      = require('../Utils/UniversalFunctions');
const APP_CONSTANTS   =  Config.APP_CONSTANTS;
const NOTIFICATION_TYPE  =  APP_CONSTANTS.NOTIFICATION_TYPE;
const axios = require('axios');

var FCM_KEY =  APP_CONSTANTS.FCM_KEY;

const createCall  = async (payloadData,UserData)=> {
    try{
      console.log(payloadData,'---payload----');
      payloadData.memberEmails = payloadData.emails.split(',')
      await Service.CallHistoryService.InsertScheduleCallData({
        ...payloadData
      }); 
      if(payloadData.memberEmails.length > 0){
        // Create a Nodemailer transporter with SMTP transport
        const transporter = nodemailer.createTransport({
          host: "smtpout.secureserver.net",
          port: 80,
          secure: false, // false for TLS; true for SSL
          auth: {
              user: "info@friendlinq.com",
              pass: "robert@1234567"
          }
        });

        for(let i in payloadData.memberEmails) {
          // Define email message
          const mailOptions = {
            from: 'info@friendlinq.com',
            to: payloadData.memberEmails[i],
            subject: `Meeting Schedule-(${payloadData.scheduleDate} - ${payloadData.scheduleTime})  Development(${payloadData.title})`,
            html: `<body>
              Hello, <br><br>

              Meeting has been schedule at: ${payloadData.scheduleDate} - ${payloadData.scheduleTime}
              Click on the link to join: <br>
               <a target="_blank" href="${payloadData.inviteLink}">  ${payloadData.inviteLink} </a>
            </body>`
          };
          console.log(mailOptions,'---mailOptions---');
  
          // Send email
          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error occurred:', error.message);
                return;
            }
            console.log('Email sent successfully!');
            console.log('Message ID:', info.messageId);
          });
        }
        /* const emailBody = {
          // "Emails": payloadData.memberEmails,
          "EmailList": payloadData.memberEmails.join(';'),
          "Date": payloadData.scheduleDate,
          "Time": payloadData.scheduleTime,
          "Title": payloadData.title,
          "Url": payloadData.inviteLink
        }
        console.log(emailBody,'----emailBody---');
        let config = {
          method: 'post',
          // maxBodyLength: Infinity,
          // url: `https://unpokedfolks.com/api/Schedule/NotifyMeetingSchedule`,
          url: 'https://unpokedfolks.com/api/Schedule/NotifyMeetingScheduleForm',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
           },
          body: JSON.stringify(emailBody),
          form: JSON.stringify(emailBody)
        };
        console.log(config,'--config--');
        
        axios.request(config)
        .then((response) => {
          console.log(JSON.stringify(response.data));
          console.log(response.data,'---data---');
        }) */
      }

      return {}
    }catch(err){  //console.log("err",err);
       throw err;
    }
}

const updateCall  = async (payloadData,UserData)=> {
  try{
    console.log(payloadData,'---payload----');
    const criteria = {
      _id: payloadData.callId
    };
    const dataToSet = {
      isEnded: true
    };
    await Service.CallHistoryService.updateScheduleCallHistory(criteria, dataToSet, {}); 
    
    return {}
  }catch(err){  //console.log("err",err);
     throw err;
  }
}

const getAllCall  = async (payloadData,UserData)=> {
  try{
    const result = await Service.CallHistoryService.getAllScheduleCallHistory({}, {}, {});
    return result;
  }catch(err){  //console.log("err",err);
      throw err;
  }

}

const getSingleCall  = async (payloadData,UserData)=> {
  try{
    // payloadData.email = [payloadData.email];
    console.log(payloadData,'--payloadData---');
    // const criteria = {
    //   channelId: payloadData.channelId,
    //   memberEmails: { $in: [payloadData.email] },
    //   // memberEmails: payloadData.email,
    //   // memberEmails: { $regex: payloadData.email.join('|') },
    // }
    // const emailArray = payloadData.email.split(',').map(email => email.trim()); // Split and trim email addresses
    // const criteria = {
    //   channelId: payloadData.channelId,
    //   memberEmails: { $in: emailArray } // Match against the array of email addresses
    // };
    const emailRegex = new RegExp(`(^|,)${payloadData.email}($|,)`);
    const criteria = {
      channelId: payloadData.channelId,
      memberEmails: emailRegex
    };
    const currentDate = new Date();
    const currentDateTime = currentDate.toISOString(); // Get current date and time in ISO format
    
    const result = await Service.CallHistoryService.getSingleScheduleCallHistory(criteria, {}, {});
    console.log(result, '-result-');
    
    if (!result) {
      throw new Error('Not invited to call');
    } else if (result.isEnded) {
      console.log('111111111111111111');
      throw new Error('Call has ended');
    } else if (result.scheduleDate && result.scheduleTime) {
      console.log('22222222222');
      const scheduleDateTime = new Date(`${result.scheduleDate}T${result.scheduleTime}`);
      console.log(scheduleDateTime < currentDate,'---------22222222222');
      console.log(scheduleDateTime,'-------------------', currentDate,'---------22222222222');
      if (scheduleDateTime < currentDate) {
        console.log('333333333333');
        throw new Error('Call has expired');
      } else {
        return result;
      }
    } else {
      console.log('4444444444');
      return result;
    }
  }catch(err){  //console.log("err",err);
      throw err;
  }

}


module.exports ={
  createCall,
  getAllCall,
  getSingleCall,
  updateCall
}