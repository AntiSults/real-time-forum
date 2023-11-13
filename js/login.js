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
        console.log("Login successful");
        currentUser = response.currentUser;
        window.navigate("homepage");
        // Redirect to another page or update the UI
      } else {
        console.log("Login failed: " + response.errorMessage);
        alert(response.errorMessage);
      }
    })
    .catch(function (error) {
      console.log("Error: " + error);
      // Handle network errors
    });
}

export { login, currentUser };
