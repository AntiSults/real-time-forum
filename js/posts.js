import { currentUser } from "./login.js";

function createPost() {
  var title = document.getElementById("title").value;
  var content = document.getElementById("content").value;

  var data = {
    poster: currentUser,
    title: title,
    content: content,
    categories: "kaka, peer",
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
      console.log(posts);
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
  let id = event.target.dataset.postid;
  fetch(`/post/${id}`, {
    method: "GET",
  })
    .then((response) => response.json())
    .then((p) => {
      navigate("postPage");
      let title = document.getElementById("post-title");
      title.innerText = p.title;
    })
    .catch((error) => console.error(error));
}

export { createPost, showPosts };
