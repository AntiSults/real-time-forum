var conn;

function testSend() {
  var recipient = prompt("Enter the recipient's username");
  var message = prompt("Enter your message");
  conn.send(message + "|" + recipient);
}

function sendMessage(event) {
  event.preventDefault();

  var recipient = event.target.dataset.recipient;
  var message = document.getElementById("message-input").value;
  conn.send(message + "|" + recipient);
  document.getElementById("message-input").value = "";
  let date = new Date();
  let day = String(date.getDate()).padStart(2, "0");
  let month = String(date.getMonth() + 1).padStart(2, "0");
  let minutes = String(date.getMinutes()).padStart(2, "0");
  let hours = String(date.getHours()).padStart(2, "0");

  let currentDate = day + "-" + month + "  " + hours + "." + minutes;
  const chat = document.getElementById("chat-messages");

  const container = document.createElement("div");
  container.classList.add("msg");
  container.classList.add("user-sender");
  const h = document.createElement("h1");
  h.classList.add("sender");
  const p = document.createElement("p");
  p.classList.add("timestamp");
  const msg = document.createElement("p");
  msg.classList.add("message");
  h.innerText = "me";
  p.innerText = currentDate;
  msg.innerText = message;

  container.append(h, p, msg);
  chat.append(container);
  scrollToBottom();
  populateUsers();
}

function setupWs() {
  let currentUser = document.cookie.split("=")[1];
  conn = new WebSocket("ws://localhost:5000/ws?username=" + currentUser);
  conn.onopen = function (e) {
    console.log("Connection established!");
  };
  conn.onmessage = function (e) {
    let messageType = JSON.parse(e.data);
    if (messageType.type === "private_message") {
      const chat = document.getElementById("chat-messages");
      populateUsers();
      if (
        chat &&
        messageType.sender == document.getElementById("chat-username").innerText
      ) {
        let message = messageType.message;
        let sender = messageType.sender;
        let time = messageType.time;

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

        container.append(h, p, msg);
        chat.append(container);
        scrollToBottom();
      } else {
        const topBar = document.querySelector(".top-bar");
        const popup = document.createElement("dialog");
        popup.classList.add("pop-up");
        const popupMessage = document.createElement("p");
        popupMessage.innerText = `New message from ${messageType.sender}`;
        popup.append(popupMessage);
        topBar.append(popup);
        popup.showModal();
        setTimeout(() => {
          popup.close();
        }, 5000);
      }
    } else if (messageType.type === "user_status_update") {
      let userDiv = document.querySelector(
        `div[data-user="${messageType.user}"]`
      );
      if (userDiv) {
        if (messageType.status === "online") {
          userDiv.dataset.status = "online";
        } else {
          userDiv.dataset.status = "offline";
        }
      }
    }
  };
}

function populateUsers() {
  let currentUser = document.cookie.split("=")[1];
  fetch("/getUsers", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ currentUser: currentUser }),
  })
    .then((response) => response.json())
    .then((response) => {
      const userDiv = document.getElementById("users");
      if (userDiv.childElementCount > 0) {
        userDiv.innerHTML = "";
      }
      for (let user of response) {
        const div = document.createElement("div");
        div.classList.add("user");
        div.dataset.user = user.nickname;
        div.dataset.status = user.status;
        div.addEventListener("click", function () {
          goToChat(user.nickname);
        });
        const span = document.createElement("span");
        span.classList.add("activity");
        const p = document.createElement("p");
        p.innerText = user.nickname;
        div.append(span, p);
        userDiv.append(div);
      }
    });
}

function goToChat(recipient) {
  let currentUser = document.cookie.split("=")[1];
  const btn = document.getElementById("send-message");
  if (!btn.dataset.listenerAdded) {
    btn.dataset.recipient = recipient;
    btn.addEventListener("click", sendMessage);
    btn.dataset.listenerAdded = true; // Set the flag
  }
  document.getElementById("chat-username").textContent = recipient;
  const chatDiv = document.getElementById("chat-container");
  chatDiv.style.display = "block";
  const chat = document.getElementById("chat-messages");
  chat.innerHTML = "";
  const clone = chat.cloneNode(true);
  chat.parentNode.replaceChild(clone, chat);
  const loaded = document.getElementById("chat-messages");
  loadInitialMessages(currentUser, recipient, loaded);
}

function scrollToBottom() {
  const chatMessages = document.getElementById("chat-messages");
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function fetchMessages(offset, currentUser, recipient) {
  let temp = document.getElementById("chat-messages").scrollTop;
  fetch(`/loadChat?user=${currentUser}&recipient=${recipient}&offset=${offset}`)
    .then((response) => response.json())
    .then((response) => {
      if (response.length > 0) {
        const chat = document.getElementById("chat-messages");

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
          p.innerText = msg.formatted_timestamp;
          message.innerText = msg.message;
          if (msg.user == currentUser) {
            container.classList.add("user-sender");
            h.innerText = "me";
          }
          container.append(h, p, message);
          chat.prepend(container);
        }
        scrollToCurrentPosition(temp);
      }
    });
}

function loadInitialMessages(currentUser, recipient, loaded) {
  loaded.addEventListener("scroll", function () {
    if (loaded.scrollTop === 0) {
      loadMoreMessages(currentUser, recipient);
    }
  });

  fetchMessages(0, currentUser, recipient);
}

function loadMoreMessages(currentUser, recipient) {
  const chat = document.getElementById("chat-messages");
  let offset = chat.childElementCount;
  fetchMessages(offset, currentUser, recipient);
}

function scrollToCurrentPosition(offset) {
  const chatMessages = document.getElementById("chat-messages");
  if (offset == 0) offset = 1196;
  chatMessages.scrollTop = offset;
}

export { populateUsers, setupWs, testSend, goToChat };
