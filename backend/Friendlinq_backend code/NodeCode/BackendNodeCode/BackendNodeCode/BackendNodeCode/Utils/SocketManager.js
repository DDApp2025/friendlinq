'use strict';
/**
 * Created by Anurag on 31/12/2020.
 */
var Config = require('../Config');
const Service = require('../Services');
//var TokenManager = require('./TokenManager');
const {RtcTokenBuilder, RtcRole} = require('agora-access-token');



exports.connectSocket = function (server) {
    const io = require('socket.io')({cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }});
    let connectedPeers = new Map();
    
    io.listen(3155);
    io.on("connection", ioCallback);

    function ioCallback(socket) {
        console.log(`Socket id: ${socket.id}`);
        connectedPeers.set(socket.id, socket);
    
        socket.on("disconnect", async () => {
          console.log("disconnect");
          connectedPeers.delete(socket.id);
          let updateCriteria = {socketID:socket.id}
          let dataToSet ={
            isOnline:false
          }
         await Service.CustomerService.updateData(updateCriteria,dataToSet,{new: true,lean:false});
        });
    
        socket.on("userID", async (data) => {
          console.log("userID event ******");
          console.log("userID event ******", data.payload);
          let updateCriteria = {_id:data.payload}
          let dataToSet ={
            socketID:socket.id,
            isOnline:true
          }
         const data2 = await Service.CustomerService.updateData(updateCriteria,dataToSet,{new: true,upsert:true});
        //  console.log(data2,'--data2---');
          /*Hardial
        data.payload is the id of user connected with  socket
         save socket id in db*/
          console.log(data);
          console.log(data.socketID, data.payload);
        });
    
        socket.on("createOffer", async (data) => {
          console.log("connectedPeers ==== ", connectedPeers);
          const criteria = {_id:data.callerID2}
          // console.log("criteria ==== ", criteria)
          const  userData    =   await Service.CustomerService.getData(criteria,{},{lean:true});  //console.log("userData",userData);
          console.log("userData ==== ", userData)
          for (const [socketID, socket] of connectedPeers.entries()) {
            if (userData && userData[0] && userData && userData[0] && userData[0].accessToken && socketID == userData[0].socketID) {
              console.log(socketID, data.payload.type);
              console.log("socketID ==== ", socketID)
              console.log("userData.socketID ==== ", userData[0].socketID)
              /*Hardial 
             data.callerID2 is the reciever id  ....get socket id of receiver from db and send offer to this user*/
             socket.emit(
                "onOffer",
                data.payload,
                data.callType,
                data.callerName1,
                data.callerName2,
                data.callerID1,
                data.callerID2
              );
            }
          }
        });
    
        socket.on("createAnswer", async(data) => {
          console.log("createAnswer ******* ", data)
          // send to the other peer(s) if any
          const criteria = {_id:data.callerID2}
          const  userData    =   await Service.CustomerService.getData(criteria,{},{}); 
          console.log("userData ******* ", userData)
          for (const [socketID, socket] of connectedPeers.entries()) {
            // don't send to self
            if (userData && userData[0] && socketID == userData[0].socketID) {
              console.log(socketID, data.payload.type);
              /*Hardial 
             data.callerID2 is the caller id ....get socket id of caller from db and send onAnswer to this user
             */
              socket.emit(
                "onAnswer",
                data.payload,
                data.callType,
                data.callerName1,
                data.callerName2,
                data.callerID1,
                data.callerID2
              );
            }
          }
        });
    
        socket.on("candidate", async (data) => {
          // send candidate to the other peer(s) if any
          const criteria = {_id:data.callerID2}
          const  userData    =   await Service.CustomerService.getData(criteria,{},{}); 
          for (const [socketID, socket] of connectedPeers.entries()) {
            // don't send to self
            if (userData && userData[0] && socketID == userData[0].socketID) {
              console.log(socketID, data.payload);
              /*Hardial 
             data.callerID2 is id of user ....get socket id of caller from db and send candidate to this user
             */
              socket.emit("candidate", data.payload);
            }
          }
        });
    
        socket.on("cancelCall", (data) => {
          // send candidate to the other peer(s) if any
          for (const [socketID, socket] of connectedPeers.entries()) {
            // don't send to self
            if (socketID !== data.socketID) {
              console.log(socketID, data.payload);
              /*Hardial 
             data.callerID2 is id of user ....get socket id of caller from db and send cancel to this user
             */
              socket.emit("cancelCall", data.payload);
            }
          }
        });
        socket.on('new-message', (message) => {
          socket.emit("new-message-received", message);
          socket.broadcast.emit("new-message-received", message);
        });

        socket.on("callToUser", async (data) => {
          try{
              let criteria = { 
                $or: [ {callerId: data.callerId }, { receiverId: data.callerId  } ],
                status:[1,2] 
              }
              const  my_ongoing_call  =  await Service.CallHistoryService.getCallHistory(criteria,{},{}); 
        
              if (my_ongoing_call) {
                let obj = {
                    status: 1,
                    message:'you are on another call'
                  }
                  return socket.emit('callData', obj);
              }
              let criteria_ = {
                $or: [ {callerId: data.receiverId }, { receiverId: data.receiverId  } ],
                status:[1,2]
              }
            const  other_ongoing_call  =  await Service.CallHistoryService.getCallHistory(criteria_,{},{}); 

            if (other_ongoing_call) {
              let obj = {
                  status: 1,
                  message:'busy on another call'
                }
                return socket.emit('callData', obj);
            }

            const appID = '427e7b1f9a704dc6a1656854d62df007';
            const appCertificate = '1d192da989bf40c58d66488180733476';
            function makeid(length) {
              var result           = '';
              var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
              var charactersLength = characters.length;
              for ( var i = 0; i < length; i++ ) {
                result += characters.charAt(Math.floor(Math.random() * charactersLength));
              }
              return result;
            }

            const channel_name =  makeid(20);
            const uid = 0;
            
            const expirationTimeInSeconds = 3600
            
            const currentTimestamp = Math.floor(Date.now() / 1000)
            
            const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds

            // IMPORTANT! Build token with either the uid or with the user account. Comment out the option you do not want to use below.
                
            // Build token with uid
            const token = RtcTokenBuilder.buildTokenWithUid(appID, appCertificate, channel_name, uid,  privilegeExpiredTs);
            console.log("Token With Integer Number Uid: " + token);
            let insertValues = {
              callerId:data.callerId,
              receiverId:data.receiverId,
              type:data.type, // audio, video
              duration:data.duration,
              status:1,   // 1=calling, 2=accepted, 3=decline	
              token:token,
              channel_name:channel_name
            }
            await Service.CallHistoryService.InsertData(insertValues);
        
            if (data) {
              let whereConditionSender = {
                _id: data.callerId
              }
              var sender  =  await Service.CustomerService.getData(whereConditionSender,{},{}); 
              let whereConditionReceiver = {
                _id: data.receiverId
              }
              var reciever  =  await Service.CustomerService.getData(whereConditionReceiver,{},{}); 
              var deviceType = 'ANDROID'
    
              var message = ` Incoming ${data.type==='audio' ? "voice" : "video" } call `
              var deviceToken = reciever.length > 0 ? reciever[0].deviceToken : ""
    
              var notification_data={
                "title":sender.length > 0 ? sender[0].fullName : "",
                "type" : 1,
                "message" : message,
                "callType":data.type,
                "callerId":data.callerId,
                "callerName":sender.length > 0 ? sender[0].fullName : "",
                "callerImage":sender.length > 0 ? sender[0].imageURL?.original : "",
                "receiverId": data.receiverId,
                "receiverName":reciever.length>0 ? reciever[0].fullName : "",
                "receiverImage":reciever.length > 0 ? reciever[0].imageURL?.original : "",
                "token":token,
                "call_status":1,
                "channelName":channel_name
              }
            
              var get_user_details  =  await Service.CustomerService.getData({_id : data.receiverId},{},{});
              var get_sender_user  =  await Service.CustomerService.getData({_id : data.callerId},{},{}); 
          
              deviceToken = get_user_details.length > 0 ? get_user_details[0].deviceToken :  ""
              deviceType = get_user_details.length > 0 ? get_user_details[0].deviceType : ""

              // let dataValue = {
              //   receiverDeviceToken : get_user_details.deviceToken,
              //   callerDeviceToken : get_sender_user.deviceToken,
              //   callerId : get_sender_user._id,
              //   receiverId : get_user_details._id,
              //   callerName : get_sender_user.fullName,
              //   receiverName : get_user_details.fullName,
              //   type : 6,
              //   message : data.type==='audio' ? "You have a new audio call" :  "You have a new video call",
              //   receiverImage : get_user_details.imageURL?.original,
              //   callerImage : get_sender_user.imageURL?.original,
              //   callType : data.type,
              //   channelName : channel_name,
              //   token: token,
              // }
              // let saveNotiData = {
              //   message : message,
              //   callerId : data.callerId,
              //   receiverId : data.receiverId,
              // }
              // if (deviceType === 'IOS') {
              //   let pushKitToken = get_user_details.push_kit_token;
                // console.log(get_user_details, "get_user_details")
                // await my_function.PushNotificationIosCall(pushKitToken, deviceType, dataValue);
              // }
              // if(deviceType==='ANDROID'){
              //    await helper.send_push_notification(deviceToken, deviceType, saveNotiData, dataValue)
              // }
              var get_id  =  await Service.CustomerService.getData({_id : data.receiverId},{},{}); 
              if(get_id.length > 0 ){
                io.to(get_id[0].socketID).emit('callToUser', notification_data);
              }
              socket.emit('callToUser', notification_data);
            }
          }catch(err){
            console.log(err, "========error=========");
          }
        });

        socket.on('callStatus', async (data) => {
          try {
            let dataToSet = {
              status:data.status,
              duration:data.duration
            }
            let updateCriteria = {channel_name:data.channel_name}
         
            const update = await Service.CallHistoryService.updateCallHistory(updateCriteria,dataToSet,{new: true,lean:false});
  
            if(update){
              var callingData  =  await Service.CallHistoryService.getCallHistory({channel_name:data.channel_name},{},{}); 
              var message = `${data.status == 4 ? 'Missed call' : data.status == 2 ? 'call Accepted ' : data.status == 3 ? 'call Rejected' : 'Completed'}`
              
              let whereConditionSender = {
                _id: data.callerId
              }
              var sender  =  await Service.CustomerService.getData(whereConditionSender,{},{});
              let whereConditionReceiver = {
                _id: data.receiverId
              }
              var reciever  =  await Service.CustomerService.getData(whereConditionReceiver,{},{});
              var deviceType = 'ANDROID'
            
              var notification_data={
                "title":sender.length > 0  ? sender[0].fullName  : "",
                "type" : 2,
                "message" : message,
                "callType":callingData.type,
                "callerId":data.callerId,
                "callerName": sender.length > 0 ? sender[0].fullName : "",
                "callerImage":sender.length > 0 ? sender[0].imageURL?.original : "",
                "receiverId": data.callerId,
                "receiverName":reciever.length > 0 ?  reciever[0].fullName : "",
                "receiverImage":reciever.length > 0 ? reciever[0].imageURL?.original : "",
                "token":callingData.token || '',
                "callStatus":data.status,
                "channelName":callingData.channel_name || ''
              }
         
              var get_user_details  =  await Service.CustomerService.getData({_id:data.receiverId},{},{});
              var get_user  =  await Service.CustomerService.getData({_id:data.callerId},{},{});
            
              var deviceToken = get_user_details.length > 0 ? get_user_details[0]?.deviceToken : ""
              var deviceType =  get_user_details.length > 0 ? get_user_details[0]?.deviceType : ""
  
              // let dataValue = {
              //   type : 6,
              //   message : message,
              //   callerImage : get_user.imageURL?.original,
              //   callerName : get_user.fullName,
              //   callerId : get_user._id,
              //   callType : callingData.type,
              //   channel_name : data.channel_name,
              //   token : callingData.token,
              // }
              // let saveNotiData = {
              //   message : message,
              //   callerId : data.callerId,
              //   receiverId : data.receiverId,
              // }
  
              // if(deviceType==='IOS' && data.status !=3){
                // await my_function.PushNotificationIosCall(device_token, device_type, dataValue);
              // }
              // if(deviceType==='ANDROID' && data.status !=3){
                // let send_push_notification = await my_function.send_push_notification(device_token, device_type, dataValue)
              // }
              // console.log(device_token,"adededed");
              // let send_push_notification = await helper.send_push_notification([deviceToken], device_type, notification_data)
      
                if (callingData) {
                  var get_id  =  await Service.CustomerService.getData({_id : data.receiverId},{},{}); 
                  socket.emit('acceptReject', notification_data);
                  if(get_id.length > 0){
                      io.to(get_id[0].socketID).emit('acceptReject', notification_data);
                  }
                }
            }
          }
          catch (er) {
            console.log(er);    
          }
          
        });
      }

};
