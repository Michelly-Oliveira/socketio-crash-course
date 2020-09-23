// Information about the users, in memory
const users = [];

function userJoinRoom(id, username, room) {
  const user = { id, username, room };

  users.push(user);

  return user;
}

function getCurrentUser(id) {
  return users.find((user) => user.id === id);
}

function userLeaveRoom(id) {
  const userIndex = users.findIndex((user) => user.id === id);

  if (userIndex !== -1) {
    // splice returns an array containing the user removed from the room, so we get the first element
    return users.splice(userIndex, 1)[0];
  }
}

function getRoomUsers(room) {
  return users.filter((user) => user.room === room);
}

module.exports = {
  userJoinRoom,
  getCurrentUser,
  userLeaveRoom,
  getRoomUsers,
};
