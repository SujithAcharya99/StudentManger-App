const express = require('express');
require('./db/mongoose');
const http = require('http');
const path = require('path');
const socketio = require('socket.io');
const hbs = require('hbs');
const bodyparser = require('body-parser');
const router = require('./routers/studentroutes');
// const Server_chat = require('./server');
// const { name, roll} = require('./routers/studentroutes');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, '../public');
const viewsPath = path.join(__dirname, '../views/views');
const partialsPath = path.join(__dirname, '../views/partials')
// require('./server');

// const viewsPath = path.join(__dirname,'../views');
app.set('view engine', 'hbs');
app.set('views', viewsPath);

hbs.registerPartials(partialsPath);
app.use(express.static(publicDirectoryPath));
app.use(router);
// app.use(Server_chat)
app.use(express.json());
app.use(bodyparser.urlencoded({
  extended: true
}));

//*******************chat System******************************* */
// const {ans} = require('./routers/studentroutes');

// console.log(studentRouter.value);

const Filter = require('bad-words');
// const { generateMessage, generateLocationMessage } = require('./utils/messages');
// const {Chat} = require('./models/chat_database');
const { addUser, removeUser, getUser, getusersInRoom, generateHistoryMessage, generateMessage, generateLocationMessage } = require('./models/chat_database');
const Room = require('./models/room');
// const Student = require('./models/student');
const User = require('./models/users');
// const Teacher = require('./models/teacher');
let room;


io.on('connection', (socket) => {
  console.log('New webSocket Connection');
  socket.on('join', async (options, callback) => {
    // console.log('options:', options);
    // console.log('username',exports);
    // console.log('value from router ',getUserId());
    // if (options.room === 'student') {
    const mainId = await User.findById({ _id: options.username });
    // console.log('student database::', mainId.name);
    // room = await Room.findOne({ mainUser: options.username });
    room = await Room.findById({ _id: options.room });

    // console.log('from Room Databse::', room)
    const { error, user } = await addUser({ id: socket.id, ...options })
    // console.log('student::', user);
    if (error) {
      return callback(error)
    }

    socket.join(user.room);
    // socket.emit('message', await generateMessage(room.mainUser, 'Admin', 'welcome!'));
    // room = await Room.findById({ _id: options.room });

    const roomMainUser = await Room.findById({ _id: room._id });
    const count = roomMainUser.message.length;
    const limit = 10;
    // console.log(count);
    // let i = 0;
    
    let i = limit;

    if (count <= limit) {
      // while (i < count) {
        i = count;
      while (i > 0) {

        socket.emit('message', await generateHistoryMessage(room._id, count, i));

        // socket.emit('message', await generateHistoryMessage(room._id, i));
        // socket.broadcast.to(user.room).emit('message', await generateHistoryMessage(room.mainUser, i));
        // io.emit('message', await generateHistoryMessage(room.mainUser, i));
        i--;
      }
    } else {
      // while (i < limit) {
      while (i > 0) {

        socket.emit('message', await generateHistoryMessage(room._id, count, i));
        i--;
      }
    }
    // socket.emit('message', await generateMessage(room._id, 'Admin', 'welcome!'));

    // socket.broadcast.to(user.room).emit('message', await generateHistoryMessage(room.mainUser));
    socket.broadcast.to(user.room).emit('message', await generateMessage(room._id, 'Admin', `${mainId.name} has joined!`));

    getusersInRoom(user.room).then((user_value) => {
      // console.log('data from getuserinroom ::', user_value)
      // online.push(user_value.online)
      // online = user_value.online
      let usersOnline = [];
      let usersOffline = [];

      // console.log(user_value[0].offline)
      user_value.forEach(element => {

        // console.log('+',element)
        if (element.online) {
          usersOnline.push({ online: element.online })
        } else if (element.offline) {
          usersOffline.push({ offline: element.offline })
        }
      });
      // console.log('online', usersOnline);
      // console.log('offline', usersOffline)
      // console.log(user_value)
      io.to(user.room).emit('roomData', {
        room: user.room,
        // users: user_value,
        online: usersOnline,
        offline: usersOffline
      });
    }).catch((e) => {
      console.log(e)
    })
    callback();


    // } 

    /*
    else if (options.room === 'teacher'){
      console.log('teacher database ::', mainId.name);
      const mainId = await Teacher.findId({ _id:options.username });
    }
    else if (options.room === 'teacher') {
      // const mainId = await Teacher.findById({ _id: options.username });
      // console.log('teacher database::', mainId.name);
      const room = await Room.findOne({ mainUser: options.username });
      // console.log('from Room Databse::', room)
      const { error, user } = await addUser({ id: socket.id, ...options })
      // console.log('teacher user', user)
      if (error) {
        return callback(error)
      }

      socket.join(user.room);
      const count = roomMainUser.message.length;
      console.log(count);
      let i = 0;
      while (i < count) {
        socket.emit('message', await generateHistoryMessage(room.mainUser, i));
        i++;
      }
      socket.emit('message', generateMessage(room.mainUser, ' Admin', 'welcome!'));
      // socket.broadcast.to(user.room).emit('message', await generateHistoryMessage(id));
      socket.broadcast.to(user.room).emit('message', await generateMessage(room.mainUser, 'Admin', `${user.username} has joined!`));
      getusersInRoom(user.room).then((user_value) => {
        // console.log('users in room', user_value)
        io.emit('roomData', {
          room: user.room,
          users: user_value
        });
      }).catch((e) => {
        console.log(e)
      })
      callback();

    }

    */
    // const { error, user } = addUser({ id: socket.id, ...options })
    // console.log(user)
    // if (error) {
    //   return callback(error)
    // }
    // socket.join(user.room);
    // socket.emit('message', generateMessage('Admin', 'welcome!'));
    // socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${user.username} has joined!`));
    // io.to(user.room).emit('roomData', {

    //  let data = Promise.resolve(getusersInRoom(user.room));
    //   getusersInRoom(user.room).then((user_value) =>{
    //    console.log(user_value);

    //   data = user_value;
    //   return user_value
    // }).catch((e)=> {
    //   console.log(e)
    // })
    // console.log(data)
    // let data = getusersInRoom(user.room);
    // // let a;
    // const printAddress = async () => {
    //    const a = await data;
    //   // console.log(a);
    //   return a;
    // };
    // // console.log(a);
    // let d = printAddress();
    // console.log(d)

    // getusersInRoom(user.room).then((user_value) => {
    //   console.log(user_value);

    //  data = user_value;
    //  return user_value

    // io.emit('roomData', {
    //     room: user.room,
    //     users: user_value
    //   });
    // }).catch((e) => {
    //   console.log(e)
    // })

    // io.emit('roomData', {
    //   room: user.room,
    //   // users: a
    // });
    // console.log(user.room)
    // console.log(getusersInRoom(user.room))
    // callback();

    // io.to(user.room).emit('roomData', {
    //   room: user.room,
    //   users: getusersInRoom(user.room)
    // });
    // callback();
    // *************************

    // const exist = await Chat.find({ name: username });
    // console.log(exist)
    // if (exist) {
    //   return {
    //     error: 'Username is in use..!'
    //   }
    // }

    // **************************

  })

  socket.on('SendMessage', async (msg, callback) => {
    const id = room._id;
    // console.log(room.mainUser)
    // console.log(socket.id)
    const user = await getUser(socket.id);
    // console.log(msg)
    // console.log('username from getuser::',user.username)
    // console.log('room from getuser::',user.room)

    const filter = new Filter()
    if (filter.isProfane(msg)) {
      return callback('Profanity is not allowed...!');
    }
    io.to(user.room).emit('message', await generateMessage(id, user.username, msg));
    callback();
  });

  socket.on('sendLocation', async (sendloc, callback) => {
    const id = room._id;
    // console.log(room.mainUser)
    const user = await getUser(socket.id);
    // console.log('inside location');
    io.to(user.room).emit('locationMessage', await generateLocationMessage(id, user.username, `https://google.com/maps?q=${sendloc.latitude},${sendloc.longitude}`));
    callback();
  })

  socket.on('disconnect', async () => {
    const id = room._id;
    // console.log(room.mainUser)
    // console.log('inside disconnect')

    const user = await removeUser(socket.id);
    // console.log('removed chat data ', user)
    //********************testing***************** */
    if (user) {
      // io.to(user.room).emit('message', await generateMessage(id, 'Admin', `${user.username} has left!`));
      // io.to(user.room).emit('roomData', {
      //   room: user.room,
      //   users: await getusersInRoom(user.room)
      // });

      getusersInRoom(user.room).then((user_value) => {
        let usersOnline = [];
        let usersOffline = [];
        user_value.forEach(element => {
          if (element.online) {
            usersOnline.push({ online: element.online })
          } else if (element.offline) {
            usersOffline.push({ offline: element.offline })
          }
        });
        io.to(user.room).emit('roomData', {
          room: user.room,
          online: usersOnline,
          offline: usersOffline
        });
      }).catch((e) => {
        console.log(e)
      })

    }

    // removeUser(socket.id).then((user)=>{
    // console.log('disconnect massage',user);

    // console.log("console.log('inside console.log('inside of inside of inside console')')");

    // if (user) {
    //   io.to(user.room).emit('message', generateMessage('Admin', `${user.username} has left!`));
    //   io.to(user.room).emit('roomData', {
    //     room: user.room,
    //     users: getusersInRoom(user.room)
    //   });
    // }

    // }).catch((e) => {
    //   console.log(e)
    // })
    // console.log('disconnect massage',user)

    // if (user) {
    //   io.to(user.room).emit('message', generateMessage(id, 'Admin', `${user.username} has left!`));
    //   io.to(user.room).emit('roomData', {
    //     room: user.room,
    //     users: getusersInRoom(user.room)
    //   });
    // }
  })
})

//************************************************************* */
server.listen(port, () => {
  console.log('server is up on port:' + port);
});