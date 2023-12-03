import { currentUser } from "./login.js";

function createPost() {
  var title = document.getElementById("title").value;
  var content = document.getElementById("content").value;
  var categories = [];
  if (document.getElementById("animal1").checked) {
    categories.push(document.getElementById("animal1").value);
  }
  if (document.getElementById("animal2").checked) {
    categories.push(document.getElementById("animal2").value);
  }
  if (document.getElementById("animal3").checked) {
    categories.push(document.getElementById("animal3").value);
  }
  var data = {
    poster: currentUser,
    title: title,
    content: content,
    categories: categories,
  };
  fetch("/createPost", {
    method: "POST",
    headers: {
      "Content-type": "application/json",
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
      console.log(response);
      if (response === "success") {
        window.navigate("homepage");
      }
    });
}

function showPosts() {
  const content = document.getElementById("content");
  fetch("/showPosts", {
    method: "GET",
  })
    .then((response) => response.json())
    .then((posts) => {
      const postsDiv = document.createElement("div");
      postsDiv.setAttribute("id", "posts");
      for (let post of posts) {
        console.log(post);
        let html = `
          <h1 class="post-title">${post.title}</h1>
          <h2 class="post-poster">${post.poster}</h2>`;
        let temp = document.createElement("div");
        temp.classList.add("post");
        temp.innerHTML = html;
        temp.dataset.postid = post.id;
        temp.addEventListener("click", postClicked);
        postsDiv.append(temp);
      }
      content.append(postsDiv);
    })
    .catch((error) => console.error(error));
}

function postClicked(event) {
  let id = event.currentTarget.dataset.postid;
  goToPostPage(id);
}

function submitComment() {
  let comment = document.getElementById("comment-box").value;
  let postID = document.getElementById("post-title").dataset.postid;
  var data = {
    postID: postID,
    user: currentUser,
    comment: comment,
  };
  fetch("/comment", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((respone) => respone.json())
    .then((response) => {
      if (response !== "success") {
        console.log(response);
      } else {
        goToPostPage(postID);
      }
    });
}

function goToPostPage(id) {
  navigate("postPage");
  fetch(`/post/${id}`, {
    method: "GET",
  })
    .then((response) => response.json())
    .then((p) => {
      let title = document.getElementById("post-title");
      title.innerText = p.title;
      document.getElementById("post-poster").innerText = p.poster;
      document.getElementById("post-content").innerText = p.content;
      document.getElementById("post-title").dataset.postid = id;
    })
    .catch((error) => console.error(error));
  fetch(`/showComments/?postid=${id}`, {
    method: "GET",
  })
    .then((response) => response.json())
    .then((response) => {
      for (let comment of response) {
        console.log(comment);
        const commentDiv = document.getElementById("comment-section");
        const div = document.createElement("div");
        div.classList.add("comment-comment");
        const commenter = document.createElement("p");
        commenter.classList.add("commenter");
        commenter.innerText = comment.user;
        const message = document.createElement("p");
        message.classList.add("message");
        message.innerText = comment.comment;
        div.append(commenter, message);
        commentDiv.append(div);
      }
    });
}

export { createPost, showPosts, submitComment };
