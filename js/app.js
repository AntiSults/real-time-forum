import { register } from "./register.js";
import { login } from "./login.js";
import { createPost, showPosts } from "./posts.js";

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
    <div class="content" id="content"></div>`;

    var appDiv = document.getElementById("app");
    appDiv.innerHTML = html;
    document
      .getElementById("create-post")
      .addEventListener("click", function () {
        navigate("createPost");
      });
    document.getElementById("home").addEventListener("click", function () {
      navigate("homepage");
    });
    showPosts();
  },
  createPost: function () {
    var html = `<div class="top-bar">
      <div class="bar-content">
        <button id="home">HOME</button>
        <button id="create-post">New post!</button>
      </div>
    </div>
    <div id="post-page-container">
      <div class="post-header">
        <div id="post-title">Kaka</div>
        <div id="post-poster">aadu</div>
      </div>
      <div id="post-content"></div>
      </form>
      </div>
      <form action="/">
        <textarea name="comment" id="comment-box" cols="30" rows="10"></textarea>
        <button id="comment-submit">Comment!</button>`;
    var appDiv = document.getElementById("app");
    appDiv.innerHTML = html;
    document
      .getElementById("submit-post")
      .addEventListener("click", function (event) {
        event.preventDefault();
        createPost();
      });
    document.getElementById("home").addEventListener("click", function () {
      navigate("homepage");
    });
  },
  postPage: function () {
    var html = `<div class="top-bar">
      <div class="bar-content">
        <button id="home">HOME</button>
        <button id="create-post">New post!</button>
      </div>
    </div>
    <div id="post-page-container">
      <div class="post-header">
        <div id="post-title">Kaka</div>
        <div id="post-poster">aadu</div>
      </div>
      <div id="post-content"></div>
      <button id="comment-submit">Comment!</button>
    </div>`;
    var appDiv = document.getElementById("app");
    appDiv.innerHTML = html;
    document
      .getElementById("create-post")
      .addEventListener("click", function () {
        navigate("createPost");
      });
    document.getElementById("home").addEventListener("click", function () {
      navigate("homepage");
    });
  },
};

window.navigate = function (page) {
  pages[page]();
};

navigate("register");
