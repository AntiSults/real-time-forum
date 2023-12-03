import { register } from "./register.js";
import { login } from "./login.js";
import { createPost, showPosts, submitComment } from "./posts.js";
import { setupWs, testSend, populateUsers, goToChat } from "./websocket.js";

var pages = {
  register: function () {
    var html = `<div class="registration">
        <form action="/register">
          <label for="nickname">Nickname:</label>
          <input type="text" id="nickname" name="nickname" placeholder="Nickname [2+ characters]"required />
          <label for="age">age:</label>
          <input type="number" id="age" name="age" placeholder="Age[0+]"required />
          <p>Gender:</p>
          <input type="radio" id="male" name="gender" value="male" required />
          <label for="male">male</label>
          <input type="radio" id="female" name="gender" value="female" />
          <label for="female">female</label>
          <input type="radio" id="other" name="gender" value="other" />
          <label for="other">other</label>
          <label for="fname">first name:</label>
          <input type="text" id="fname" name="fname" placeholder="First name [2+ characters]"required />
          <label for="lname">last name:</label>
          <input type="text" id="lname" name="lname" required placeholder="Last name [2+ characters]"/>
          <label for="email">email:</label>
          <input type="text" id="email" name="email" required placeholder="Email [valid email aadress]"/>
          <label for="password">password:</label>
          <input type="password" id="password" name="password" required placeholder="Password [2+ characters]"/>
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
          <input type="password" id="password" name="password" required/>
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
        login();
        //setupWs();
      });
  },
  homepage: function () {
    var html = `<div class="top-bar">
      <div class="bar-content">
        <button id="home">HOME</button>
        <button id="create-post">New post!</button>
        <button id="pm">PM</button>
      </div>
    </div>
    <div class="content" id="content"></div>
    <div id="users"></div>`;
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
    document.getElementById("pm").addEventListener("click", function () {
      //setupWs();
      navigate("pm");
    });
    populateUsers();
    showPosts();
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
        <input type="checkbox" id="animal1" name="animal1" value="Cats" />
        <label for="animal1"> Cats</label><br />
        <input type="checkbox" id="animal2" name="animal2" value="Dogs" />
        <label for="animal2"> Dogs</label><br />
        <input type="checkbox" id="animal3" name="animal3" value="Other" />
        <label for="animal3"> Other</label><br />
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
        <div id="post-title"></div>
        <div id="post-poster"></div>
      </div>
      <div id="post-content"></div>
    </div>
    <div id="comment-container">
      <form action="/">
      <label for="comment">Comment</label>
        <textarea
          name="comment-box"
          id="comment-box"
          cols="30"
          rows="10"
          required
        ></textarea>
        <button id="comment-submit">Comment!</button>
      </form>
    </div>
    <div id="comment-section"></div>`;
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
    document
      .getElementById("comment-submit")
      .addEventListener("click", function (e) {
        e.preventDefault();
        submitComment();
      });
  },
  pm: function () {
    var html = `
    <div class="top-bar">
      <div class="bar-content">
        <button id="home">HOME</button>
        <button id="create-post">New post!</button>
        <button id="sendmessage">SendMessage</button>
      </div>
    </div>
    <div id="users"></div>
    `;
    var appDiv = document.getElementById("app");
    appDiv.innerHTML = html;
    populateUsers();
    document.getElementById("home").addEventListener("click", function () {
      navigate("homepage");
    });
    document
      .getElementById("sendmessage")
      .addEventListener("click", function () {
        testSend();
      });
  },
  chat: function (user) {
    var html = `
    <div class="top-bar">
      <div class="bar-content">
        <button id="home">HOME</button>
        <button id="create-post">New post!</button>
        <button id="sendmessage">SendMessage</button>
      </div>
    </div>
    <div id="chat"></div>
    <div class="chatbox">
      <form action="/">
        <textarea
          name="send-message"
          id="send-message"
          cols="30"
          rows="10"
          required
        ></textarea>
        <button id="submit-message">Send</button>
      </form>
    </div>
    `;
    var appDiv = document.getElementById("app");
    appDiv.innerHTML = html;
    goToChat(user);
    document
      .getElementById("sendmessage")
      .addEventListener("click", function () {
        testSend();
      });
    document.getElementById("home").addEventListener("click", function () {
      navigate("homepage");
    });
  },
};

window.navigate = function (page, ...args) {
  pages[page].apply(null, args);
};

navigate("register");
