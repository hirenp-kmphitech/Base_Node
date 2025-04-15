

const PushNotification = require('../services/notification');
const Messages = require('../../models/Messages');


const initSocket = async function (io) {

    // for chat
    async function saveMessage(socket, message, senderId, receiverId, messageType, CreatedAt) {
        try {

            let newMsg = Messages();
            newMsg.msg = message;
            newMsg.senderId = senderId;
            newMsg.receiverId = receiverId;
            newMsg.createdAt = CreatedAt;
            newMsg.msgType = messageType;
            var result = await newMsg.save();

            var msgId = result._id;
            emitEventFromAPI(socket, msgId, receiverId);
        } catch (error) {
            let errorMsg = error.message ?? "Something went wrong";
            console.log('errorMsg-saveMessage->>', errorMsg);
            errorSocketEmit(socket, "setNewMessage", errorMsg);
        }

    }

    async function emitEventFromAPI(socket, msgId, receiverId) {
        try {
            var newMsg = await Messages.findById(msgId);
            if (newMsg.msgType == "image") {
                newMsg.msg = APP_URL + "/public/chat_img/" + newMsg.msg;
            }


            // set new user in list
            var chatList = newMsg;

            socket.to(receiverId.toString()).emit('setNewMessage', {
                resData: newMsg
            });


            if (chatList.msgType == "image") {
                chatList.msg = APP_URL + "/public/chat_img/" + chatList.msg;
            }

            if ((chatList._doc.receiverId._id).toString() == receiverId.toString()) {
                chatList._doc.user_detail = chatList.receiverId; delete chatList._doc.receiverId; delete chatList._doc.senderId;
            }
            else {
                chatList._doc.user_detail = chatList.senderId; delete chatList._doc.receiverId; delete chatList._doc.senderId;
            }
            chatList._doc.user_detail.profile = global.APP_URL + "/public/profile/" + chatList._doc.user_detail.profile;

            socket.to(receiverId.toString()).emit('updateChatList', {
                resData: chatList
            });

            /* let receiverToken = chatList._doc.user_detail.deviceToken ?? "";
            if (receiverToken && receiverToken != "") {
                let notiData = { notificationType: "message", type: "chat" }
                var notiMsg = newMsg.msg;
                if (chatList.msgType == "image") {
                    notiMsg = "Image";
                }
                await sendFirebaseNotifcation(receiverToken, global.APP_NAME, notiMsg, notiData);
            } */
            // over new user set


        } catch (error) {
            let errorMsg = error.message ?? "Somethig went wrong";
            console.log('errorMsg-emitevent->>', errorMsg);
            errorSocketEmit(socket, "setNewMessage", errorMsg);
        }

    }

    io.on('connection', (socket) => {
        console.log("socket connected");

        socket.on('socketJoin', (userId) => {
            if (!socket.rooms.has(userId.toString())) {
                console.log('roomJoin-->>>', userId);
                socket.join(userId.toString());
            }
        });

        socket.on('socketLeave', (userId) => {
            if (socket.rooms.has(userId.toString())) {
                console.log('roomLeave-->>>', userId);
                socket.leave(userId.toString());
            }
        });

        socket.on('getChatUserlist', async (loginId) => {
            try {
                const jsonObj = { loginId };
                if (!checkJsonParam(jsonObj, ['loginId'], socket, 'setChatUserlist')) {
                    return;
                }
                else {
                    if (!socket.rooms.hasOwnProperty(loginId.toString())) {
                        socket.join(loginId.toString());
                    }

                    let filter = { $or: [{ senderId: loginId }, { receiverId: loginId }] };
                    var result = await Messages.list(filter, "msg msgType updatedAt", { _id: -1 });

                    var uniqUsers = result.filter((obj, index) => {
                        let getIndex = -1;
                        if ((obj._doc.senderId._id).toString() == loginId.toString()) {
                            getIndex = result.findIndex(o => (obj._doc.receiverId._id).toString() == (o._doc.receiverId._id).toString())
                        }
                        else {
                            getIndex = result.findIndex(o => (obj._doc.senderId._id).toString() == (o._doc.senderId._id).toString())
                        }

                        return index === getIndex;
                    })

                    var chatList = uniqUsers;
                    chatList = chatList.map((data) => {
                        if (data.senderId._id == loginId) {
                            data._doc.user_detail = data.receiverId; delete data._doc.receiverId; delete data._doc.senderId;
                        }
                        else {
                            data._doc.user_detail = data.senderId; delete data._doc.receiverId; delete data._doc.senderId;
                        }

                        if (data.msgType == "image") {
                            data._doc.msg = global.APP_URL + "/public/chat_img/" + data._doc.msg;
                        }
                        data._doc.user_detail.profile = global.APP_URL + "/public/profile/" + data._doc.user_detail.profile;
                        return data;
                    });
                    chatList = chatList.filter((obj, index) => {
                        return index === chatList.findIndex(o => (obj._doc.user_detail._id).toString() == (o._doc.user_detail._id).toString());
                    });

                    socket.emit('setChatUserlist', {
                        resData: chatList
                    });

                }
            } catch (error) {
                let errorMsg = error.message ?? "Somethig went wrong";
                console.log('errorMsg-setChatUserlist->>', errorMsg);
                errorSocketEmit(socket, "setChatUserlist", errorMsg);
            }

        });


        socket.on('getMessageList', async (loginId, receiverId) => {
            try {
                const jsonObj = { loginId, receiverId };
                if (!checkJsonParam(jsonObj, ['loginId', 'receiverId'], socket, 'setMessageList')) {
                    return;
                }
                else {

                    let filter = { $or: [{ $and: [{ senderId: loginId }, { receiverId: receiverId }] }, { $and: [{ senderId: receiverId }, { receiverId: loginId }] }] };
                    var result = await Messages.list(filter, "msg msgType");

                    var MsgList = result.map((data) => {
                        if (data.msgType == "image") {
                            data._doc.msg = APP_URL + "/public/chat_img/" + data.msg;
                        }
                        return data;
                    });

                    socket.emit('setMessageList', {
                        resData: MsgList
                    });

                }
            } catch (error) {
                let errorMsg = error.message ?? "Somethig went wrong";
                console.log('errorMsg-setMessageList->>', errorMsg);
                errorSocketEmit(socket, "setMessageList", errorMsg);
            }
        });


        socket.on('sendMessage', async (data, senderId, receiverId, messageType, CreatedAt) => {
            try {
                const jsonObj = { data, senderId, receiverId, messageType, CreatedAt };
                if (!checkJsonParam(jsonObj, ['data', 'senderId', 'receiverId', 'messageType', 'CreatedAt'], socket, 'setNewMessage')) {
                    return;
                }
                else {
                    // console.log('jsonObj =======>',jsonObj);
                    var message = "";
                    if (messageType == 'image') {
                        message = data;
                        saveMessage(socket, message, senderId, receiverId, messageType, CreatedAt);
                    }
                    else {
                        message = data;
                        saveMessage(socket, message, senderId, receiverId, messageType, CreatedAt);
                    }

                }
            } catch (error) {
                let errorMsg = error.message ?? "Somethig went wrong";
                console.log('errorMsg-setNewMessage->>', errorMsg);
                errorSocketEmit(socket, "setNewMessage", errorMsg);
            }
        });

        // when the user disconnects.. perform this
        socket.on('disconnect', () => {
            console.log("socket disconnected");
        });


    });



    function checkJsonParam(jsonObj, check_keys, socket, socketEvent) {

        var is_valid = true;
        var missing_parameter = "";

        check_keys.forEach(function (key, indexOf) {
            if (!jsonObj.hasOwnProperty(key) || jsonObj[key] == "" || jsonObj[key] == undefined) {
                is_valid = false;
                missing_parameter += key + " ";
            }
        });
        if (!is_valid) {
            errorSocketEmit(socket, socketEvent, "Missing parameter  :" + missing_parameter);
        }
        return is_valid;

    }

    function errorSocketEmit(socket, socketEvent, errorMsg) {
        let response = { "success": 0, "Message": errorMsg, resData: {} };
        socket.emit(socketEvent, response);
    }

}
module.exports = initSocket