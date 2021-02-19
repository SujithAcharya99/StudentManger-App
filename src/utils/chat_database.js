const users = [];
const addUser = ({ id, username, room }) => {
 
  username = username.trim().toLowerCase(),
    room = room.trim().toLowerCase()

  if (!username || !room) {
    return {
      error: 'username and room are required'
    }
  }
  const existingUser = users.find((user) => {
    return user.room === room && user.username === username
  })
  if (existingUser) {
    return {
      error: 'Username is in use..!'
    }
  }
  const user = { id, username, room }
  users.push(user)
  return { user }
}

const removeUser = (id) => {
  const index = users.findIndex((user) => user.id === id)
  console.log(index);
  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
}

const getUser = (id) => {
  return users.find((user) => user.id === id)
}

const getusersInRoom = (room) => {
  return users.filter((user) => user.room === room)
}

const generateMessage = (username, text) => {
  return {
    username,
    text,
    createdAt: new Date().getTime()
  }
}

const generateLocationMessage = (username, url) => {
  return {
    username,
    url,
    createdAt: new Date().getTime()
  }
}


module.exports = {
  addUser,
  removeUser,
  getUser,
  getusersInRoom,
  generateMessage,
  generateLocationMessage
}
