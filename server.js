exports.mychat = function (db,io) {            
        var usersD = db.collection('users');
        var chatD = db.collection('chat');
     
        var uName;
        var connectedUsers = [];
        var clientNo = 0;

        io.on('connection', function (socket) {
            socket.on('login', function (userName, password) {
                usersD.find().sort({_id: 1}).toArray(function (err, res) {
                    if (res.length == 0) {
                        socket.emit("alert", "No entries in the database");
                    }
                    for (var i = 0; i < res.length; i++) {
                        if (res[i].userName == userName && res[i].password == password) {
                            socket.emit("alert", "You have been logged in successfully", 1);
                            uName = userName;
                            break;
                        }

                    }
                    if (i >= res.length) {
                        socket.emit("alert", "Re-enter Username and password", 0);
                    }
                });
            });

            socket.on("logout", function (userName) {
                var i = connectedUsers.findIndex(x => x.userName == userName
                )
                ;
                if (i != -1) {
                    connectedUsers.splice(i, 1);
                }
                io.emit("online users", connectedUsers);
                socket.emit("alert",userName + " has been logged out!!!");
            });


            socket.on("client name", function () {
                var userData = {
                    userName: uName,
                    sockId: socket.id
                };
                connectedUsers[clientNo++] = userData;
                socket.emit('send client name', uName);
            });

            socket.on('msg to all', function (data, userName) {

                io.emit('msg to all', data, userName);
            });

            socket.on("refresh online users", function () {
                io.emit("online users", connectedUsers);
            });


            socket.on("send message", function (senderId, recieverId, sender, reciever, msg) {
                var chatHistory;
                chatD.find({to: sender, from: reciever}).toArray(function (err, res) {
                    if (err) throw err;
                    else {
                        chatHistory = res[0].chatMessages;
                    }
                });
                socket.broadcast.to(recieverId).emit("get message", senderId, recieverId, sender, reciever, chatHistory);
                var date = new Date();
                var doc = {
                    from: sender,
                    message: msg,
                    time: date.getFullYear() + ":" + (date.getMonth() + 1) + ":" + date.getDate() + ":" + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds()
                };
                socket.broadcast.to(recieverId).emit("show msg", recieverId, senderId, sender, msg);

                chatD.update({to: reciever, from: sender}, {$addToSet: {chatMessages: doc}});
                chatD.update({to: sender, from: reciever}, {$addToSet: {chatMessages: doc}});


            });

            socket.on("create chat", function (sender, reciever) {
                for (var i = 0; i < connectedUsers.length; i++) {
                    if (connectedUsers[i] != null) {
                        if (connectedUsers[i].userName == reciever) {
                            chatD.find().toArray(function (err, res) {
                                var j;
                                var messages1, messages2;
                                for (j = 0; j < res.length; j++) {
                                    if ((res[j].to == reciever && res[j].from == sender) || (res[j].to == sender && res[j].from == reciever)) {
                                        break
                                    }
                                }

                                var socketIdR = connectedUsers[i].sockId;
                                var socketIdS = socket.id;
                                var chatHistory;

                                if (j >= res.length) {
                                    var data1 = {
                                        to: reciever,
                                        from: sender,
                                        chatMessages: [{from: "", message: "", time: ""}]
                                    };

                                    var data2 = {
                                        to: sender,
                                        from: reciever,
                                        chatMessages: [{from: "", message: "", time: ""}]
                                    };
                                    chatD.insert(data1);
                                    chatD.insert(data2);
                                    chatHistory = "";
                                    socket.emit("send socket id", socketIdR, socketIdS, reciever, chatHistory);
                                }
                                else {
                                    chatHistory = "";
                                    chatD.find({to: reciever, from: sender}).toArray(function (err, res) {
                                        if (err) throw err;
                                        else {
                                            chatHistory = res[0].chatMessages;
                                            socket.emit("send socket id", socketIdR, socketIdS, reciever, chatHistory);
                                        }
                                    });

                                }

                            });

                            break;
                        }
                    }
                }
            });


            socket.on("save", function (userName, password) {

                usersD.find().sort({_id: 1}).toArray(function (err, res) {
                    if (err) throw err;
                    for (var i = 0; i < res.length; i++) {
                        if (res[i].userName == userName) {
                            socket.emit("alert", "username already exists", 1);
                            break;
                        }
                    }
                    if (i >= res.length) {
                        var userData = {
                            userName: userName,
                            password: password
                        };
                        usersD.insert(userData);
                        socket.emit("alert", "Your account has been created successfully!!!", 0);

                    }

                });
            });
        });

}

