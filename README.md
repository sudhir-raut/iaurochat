How to use events of char server ?

event : How to use

1. connection : This event is emitted when client pings to server.

2. login : Used for login
           <>.emit('login',username,password);

3. logout : Used for logout
            <>.emit('logout',clientName);

4. online users : Broadcasts list of online users.
                  <>.emit('online users',listOfOnlineUsers);

5. client name : Request to get self name from server.
                 <>.emit('client name');

6. msg to all : Broadcasts msg to all
                <>.emit('msg to all',message,selfName);

7. refresh online users : Updates online user list after login and logout events.
                          <>.emit('refresh online users');

8. send message : sends message to server
                  <>.emit('send message',socketIdSender,socketIdReciever,senderName,recieverName,message);

9. get message : shows chat history. server emits this event.
                 <>.emit('get message',socketIdSender,socketIdReciever,senderName,recieverName,[chat history]);

10. show msg : to show recived message.
                <>.emit('show msg',socketIdSender,socketIdReciever,senderName,message);

11. create chat : initiates chat
                  <>.emit('create chat',senderName,recieverName);

12. send socket id : server sends socked ids of sender and reciver.
                     <>.emit('send socket id',socketIdReciever,socketIdSender,recieverName,[chat history]);

13. save  : saves username and password at server side.
            <>.emit('save',username,password);

14. alert : for alert
            <>.emit('alert',"alert message",<return value>);
            