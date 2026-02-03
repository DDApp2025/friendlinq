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
const branchio = require('branchio-sdk')

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
      payloadData.memberNames = payloadData.names.split(',')
      await Service.CallHistoryService.InsertScheduleCallData({
        ...payloadData
      }); 
      if(payloadData.memberEmails.length > 0){
        // Create a Nodemailer transporter with SMTP transport
        const transporter = nodemailer.createTransport({
          host: "dedrelay.secureserver.net",
          port: 25,
          secure: false, // false for TLS; true for SSL
          auth: {
              user: "info@friendlinq.com",
              pass: "robert@1234567"
          }
        });
        // Meeting has been scheduled at: ${payloadData.scheduleDate} - ${payloadData.scheduleTime}

        const inputDateStr = payloadData.scheduleDate;

        // Parse the input date string into a Date object
        const inputDate = new Date(inputDateStr);

        // Adjust the date to the previous day
        inputDate.setDate(inputDate.getDate() - 1);

        // Format the date into the desired output format
        const formattedDate = `${(inputDate.getMonth() + 1).toString().padStart(2, '0')}-` +
                              `${inputDate.getDate().toString().padStart(2, '0')}-` +
                              `${inputDate.getFullYear()} at ` +
                              `${inputDate.getHours().toString().padStart(2, '0')}:` +
                              `${inputDate.getMinutes().toString().padStart(2, '0')}`;

        console.log(formattedDate);

        for(let i in payloadData.memberEmails) {
          // Define email message
          const mailOptions = {
            from: 'info@friendlinq.com',
            to: payloadData.memberEmails[i],
            // subject: `Meeting Schedule-(${payloadData.scheduleDate} - ${payloadData.scheduleTime}) (${payloadData.title})`,
            subject: `Meeting Schedule-(${payloadData.scheduleDate}) (${payloadData.title})`,
            html: `<body>
              Hello, <br><br>
              Users scheduled for call are listed below: <br><br>
              ${payloadData.names}
              <br><br>
              A meeting has been scheduled on: ${formattedDate}
              Click the link to join: <br>
               <a target="_blank" href="${payloadData.inviteLink}">  ${payloadData.inviteLink} </a>
            </body>`
          };
          console.log(mailOptions,'---mailOptions---1111---');
          console.log(transporter,'---transporter---1111---');
  
          // Send email
          transporter.sendMail(mailOptions, (error, info) => {
            console.log('-----');
            
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

const createCallWeb  = async (payloadData,UserData)=> {
    try{
      console.log(payloadData,'---payload----');
      payloadData.memberEmails = payloadData.emails.split(',')
      payloadData.memberNames = payloadData.names.split(',')
      const client = branchio({ 
        appId: "1299425169005105887",
        key: "key_test_azpMkkUgw4ZlraXTC7PM0difFBbGXyX1",  // initialize branchio with either appId or branch key and branch secret but not both
        secret: "secret_test_GcyFhGznXP2jffm0l7fXEmBq92TewlQG"
      })

      // const rand = min + Math.random() * (max - min);
      let channelId = payloadData.channelId;
      const { url } = await client.link({ 
        alias: '',
        stage: 'Call user',
        channel: channelId,
        feature: 'dashboard',
        // campaign: 'content 123',
        // tags: [ 'tag1', 'tag2', 'tag3' ],
        data: {
          'custom_bool': true,
          'channel': payloadData.channelId,
          'title': payloadData.channelId,
          'callType': payloadData.callType,
          'hostId': payloadData.hostId,
        }
      })
      console.log(url,'--url--');
      // return;
      payloadData.inviteLink = url;
      await Service.CallHistoryService.InsertScheduleCallData({
        ...payloadData
      }); 
      if(payloadData.memberEmails.length > 0){
        // Create a Nodemailer transporter with SMTP transport
        const transporter = nodemailer.createTransport({
          host: "dedrelay.secureserver.net",
          port: 25,
          secure: false, // false for TLS; true for SSL
          auth: {
              user: "info@friendlinq.com",
              pass: "robert@1234567"
          }
        });
        // Meeting has been scheduled at: ${payloadData.scheduleDate} - ${payloadData.scheduleTime}

        const inputDateStr = payloadData.scheduleDate;

        // Parse the input date string into a Date object
        const inputDate = new Date(inputDateStr);

        // Adjust the date to the previous day
        inputDate.setDate(inputDate.getDate() - 1);

        // Format the date into the desired output format
        const formattedDate = `${(inputDate.getMonth() + 1).toString().padStart(2, '0')}-` +
                              `${inputDate.getDate().toString().padStart(2, '0')}-` +
                              `${inputDate.getFullYear()} at ` +
                              `${inputDate.getHours().toString().padStart(2, '0')}:` +
                              `${inputDate.getMinutes().toString().padStart(2, '0')}`;

        console.log(formattedDate);

        for(let i in payloadData.memberEmails) {
          // Define email message
          const mailOptions = {
            from: 'info@friendlinq.com',
            to: payloadData.memberEmails[i],
            // subject: `Meeting Schedule-(${payloadData.scheduleDate} - ${payloadData.scheduleTime}) (${payloadData.title})`,
            subject: `Meeting Schedule-(${payloadData.scheduleDate}) (${payloadData.title})`,
            html: `<body>
              Hello, <br><br>

              Users scheduled for call are listed below: <br><br>
              ${payloadData.names}
              <br><br>
              A meeting has been scheduled on: ${formattedDate}
              Click the link to join: <br>
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
        throw new Error('Call has ended');
    // } else if (result.scheduleDate && result.scheduleTime) {
    } else if (result.scheduleDate) {
        // const scheduleDateTime = new Date(`${result.scheduleDate}T${result.scheduleTime}`);
        const scheduleDateTime = new Date(result.scheduleDate);
        console.log(currentDate,'--currentDate--');
        console.log(scheduleDateTime,'--scheduleDateTime--');
        const thirtyMinutesBeforeScheduledTime = new Date(scheduleDateTime.getTime() - 15 * 60 * 1000); // 15 minutes before scheduled time
        console.log(thirtyMinutesBeforeScheduledTime,'--thirtyMinutesBeforeScheduledTime--');
        const threeHoursBeforeCurrentTime = new Date(currentDate.getTime() - 3 * 60 * 60 * 1000); // 3 hours before current time
        console.log(threeHoursBeforeCurrentTime,'--threeHoursBeforeCurrentTime--');
    
        if (currentDate < thirtyMinutesBeforeScheduledTime) {
            throw new Error('Call can only be accessed 30 minutes before scheduled time');
        } else if (scheduleDateTime < threeHoursBeforeCurrentTime) {
            throw new Error('Call has expired (more than 3 hours before scheduled time)');
        } else {
            return result;
        }
    } else {
        return result;
    }
  }catch(err){  //console.log("err",err);
      throw err;
  }

}


module.exports ={
  createCall,
  createCallWeb,
  getAllCall,
  getSingleCall,
  updateCall
}