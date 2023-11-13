import { register } from "./register.js";
import { login } from "./login.js";
import { createPost } from "./posts.js";

var pages = {
  register: function () {
    var html = `<div class="registration">
        <form action="/register">
          <label for="nickname">Nickname:</label>
          <input type="text" id="nickname" name="nickname" required />
          <label for="age">age:</label>
          <input type="text" id="age" name="age" required />
          <p>Gender:</p>
          <input type="radio" id="male" name="gender" value="male" required />
          <label for="male">male</label>
          <input type="radio" id="female" name="gender" value="female" />
          <label for="female">female</label>
          <input type="radio" id="other" name="gender" value="other" />
          <label for="other">other</label>
          <label for="fname">first name:</label>
          <input type="text" id="fname" name="fname" required />
          <label for="lname">last name:</label>
          <input type="text" id="lname" name="lname" required />
          <label for="email">email:</label>
          <input type="text" id="email" name="email" required />
          <label for="password">password:</label>
          <input type="text" id="password" name="password" required />
          <button id="submitreg">Submit</button>
          <p>Already got an account? <a id="login" href="#">Log in</a></p>
        </form>
      </div>`;
    var appDiv = document.getElementById("app");
    appDiv.innerHTML = html;
    document
      .getElementById("submitreg")
      .addEventListener("click", function (event) {
        if (!document.querySelector("form").checkValidity()) {
          return;
        }
        event.preventDefault();
        register();
      });

    document
      .getElementById("login")
      .addEventListener("click", function (event) {
        console.log(event);
        event.preventDefault();
        navigate("login");
      });
  },
  login: function () {
    var html = `<div class="container">
      <div class="login">
        <form action="/login">
          <label for="email">Email: </label>
          <input type="text" id="email" name="email" required/>
          <label for="password">Password: </label>
          <input type="text" id="password" name="password" required/>
          <button id="submitlogin">Log in</button>
        </form>
      </div>
    </div>`;
    var appDiv = document.getElementById("app");
    appDiv.innerHTML = html;
    document
      .getElementById("submitlogin")
      .addEventListener("click", function (event) {
        event.preventDefault();
        console.log(event);
        login();
      });
  },
  homepage: function () {
    var html = `<div class="top-bar">
      <div class="bar-content">
        <button id="home">HOME</button>
        <button id="create-post">New post!</button>
      </div>
    </div>
    <div class="content"></div>`;
    var appDiv = document.getElementById("app");
    appDiv.innerHTML = html;
    document
      .getElementById("create-post")
      .addEventListener("click", function () {
        navigate("createPost");
      });
  },
  createPost: function () {
    var html = `<div class="top-bar">
      <div class="bar-content">
        <button id="home">HOME</button>
      </div>
    </div>
    <div class="post-creating">
      <h1>Create a new post!</h1>
      <form action="/createPost">
        <label for="title">Post title</label>
        <input type="text" id="title" name="title" />
        <input type="checkbox" id="vehicle1" name="vehicle1" value="Bike">
  <label for="vehicle1"> I have a bike</label><br>
  <input type="checkbox" id="vehicle2" name="vehicle2" value="Car">
  <label for="vehicle2"> I have a car</label><br>
        <textarea name="content" id="content" cols="30" rows="10"></textarea>
        <button id="submit-post">Post!</button>
      </form>
    </div>`;
    var appDiv = document.getElementById("app");
    appDiv.innerHTML = html;
    document
      .getElementById("submit-post")
      .addEventListener("click", function (event) {
        event.preventDefault();
        createPost();
      });
  },
};

window.navigate = function (page) {
  pages[page]();
};

navigate("register");
