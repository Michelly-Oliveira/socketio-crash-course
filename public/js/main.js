const chatForm = document.querySelector("#chat-form");
const chatMessages = document.querySelector(".chat-messages");
const roomName = document.querySelector("#room-name");
const usersList = document.querySelector("#users");

// Get usrname and room from URL
const { username, room } = Qs.parse(location.search, {
  // Don't return the symbols
  ignoreQueryPrefix: true,
});

// socket.io client
const socket = io();

// Handle input from the server
// "message" is the event name - we define it; event name must be the same in the server too
socket.on("message", (message) => {
  outputMessage(message);
});

// Join chatroom
socket.emit("joinRoom", { username, room });

// Get room and users
socket.on("roomUsers", ({ room, users }) => {
  outputRoomName(room);
  outputRoomUsers(users);
});

// Message submit
chatForm.addEventListener("submit", (e) => {
  e.preventDefault();

  // Get the value of the input element
  const msg = e.target.elements.msg.value;

  // Send message to the server
  // 'chatMessage' is another event
  socket.emit("chatMessage", msg);

  // Clear input and focus on input
  e.target.elements.msg.value = "";
  e.target.elements.msg.focus();
});

// Output message to DOM
function outputMessage(msg) {
  const div = document.createElement("div");
  div.classList.add("message");
  div.innerHTML = `
		<p class="meta">${msg.username} <span>${msg.time}</span></p>
		<p class="text">${msg.text}</p>
	`;

  document.querySelector(".chat-messages").appendChild(div);

  // Scroll down
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function outputRoomName(room) {
  roomName.innerHTML = room;
}

function outputRoomUsers(users) {
  const usersOutput = users.map((user) => `<li>${user.username}</li>`).join("");

  usersList.innerHTML = usersOutput;
}
