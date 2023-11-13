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

export { createPost };
