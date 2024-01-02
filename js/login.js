import { setupWs } from "./websocket.js";

let currentUser;

function login() {
  var email = document.getElementById("email").value;
  var password = document.getElementById("password").value;

  var data = {
    email: email,
    password: password,
  };

  fetch("/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then(function (response) {
      if (!response.ok) {
        throw new Error("HTTP error " + response.status);
      }
      return response.json();
    })
    .then(function (response) {
      if (response.loginSuccessful) {
        currentUser = response.currentUser;
        //addCookie(response);
        setupWs();
        window.navigate("homepage");
      } else {
        alert(response.errorMessage);
      }
    })
    .catch(function (error) {
      console.log("Error: " + error);
      // Handle network errors
    });
}

function logout() {
  document.cookie = "username=; Max-age=0; path=/";
  window.navigate("login");
}

export { login, currentUser, logout };
