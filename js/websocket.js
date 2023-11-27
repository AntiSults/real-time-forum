import { currentUser } from "./login.js";
var conn;

function testSend() {
  var recipient = prompt("Enter the recipient's username");
  var message = prompt("Enter your message");
  conn.send(message + "|" + recipient);
}

function sendMessage(event) {
  event.preventDefault();
  console.log(event.currentTarget);
  var recipient = event.target.dataset.recipient;
  var message = document.getElementById("send-message").value;
  conn.send(message + "|" + recipient);

  let date = new Date();
  let day = String(date.getDate()).padStart(2, "0");
  let month = String(date.getMonth() + 1).padStart(2, "0"); // January is 0!
  let year = date.getFullYear();

  let currentDate = month + "-" + day + "-" + year;
  const chat = document.getElementById("chat");

  const container = document.createElement("div");
  container.classList.add("msg");
  const h = document.createElement("h1");
  h.classList.add("sender");
  const p = document.createElement("p");
  p.classList.add("timestamp");
  const msg = document.createElement("p");
  msg.classList.add("message");
  h.innerText = currentUser;
  p.innerText = currentDate;
  msg.innerText = message;

  container.append(h, p, message);
  chat.append(container);
}

function setupWs() {
  console.log(currentUser);
  conn = new WebSocket("ws://localhost:5000/ws?username=" + currentUser);
  conn.onopen = function (e) {
    console.log("Connection established!");
  };
  conn.onmessage = function (e) {
    const chat = document.getElementById("chat");
    let data = e.data.split("|");
    let message = data[0];
    let sender = data[1];
    let time = data[2];

    const container = document.createElement("div");
    container.classList.add("msg");
    const h = document.createElement("h1");
    h.classList.add("sender");
    const p = document.createElement("p");
    p.classList.add("timestamp");
    const msg = document.createElement("p");
    msg.classList.add("message");
    h.innerText = sender;
    p.innerText = time;
    msg.innerText = message;

    container.append(h, p, message);
    chat.append(container);
  };
}

function populateUsers() {
  fetch("/getUsers", { method: "GET" })
    .then((response) => response.json())
    .then((response) => {
      const userDiv = document.getElementById("users");
      for (let user of response) {
        const div = document.createElement("div");
        div.classList.add("user");
        div.dataset.user = user.nickname;
        div.addEventListener("click", function () {
          navigate("chat", user.nickname);
        });
        const p = document.createElement("p");
        p.innerText = user.nickname;
        div.append(p);
        userDiv.append(div);
      }
    });
}

function goToChat(recipient) {
  console.log("JOUJOUJOU", currentUser, recipient);
  const btn = document.getElementById("submit-message");
  btn.dataset.recipient = recipient;
  btn.addEventListener("click", sendMessage);
  fetch(`/loadChat?user=${currentUser}&recipient=${recipient}`)
    .then((response) => response.json())
    .then((response) => {
      console.log(response);
      const chat = document.getElementById("chat");
      for (let msg of response) {
        const container = document.createElement("div");
        container.classList.add("msg");
        const h = document.createElement("h1");
        h.classList.add("sender");
        const p = document.createElement("p");
        p.classList.add("timestamp");
        const message = document.createElement("p");
        message.classList.add("message");
        h.innerText = msg.user;
        p.innerText = msg.timestamp;
        message.innerText = msg.message;

        container.append(h, p, message);
        chat.append(container);
      }
    });
}

export { populateUsers, setupWs, testSend, goToChat };
