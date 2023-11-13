function register() {
  var nickname = document.getElementById("nickname").value;
  var age = document.getElementById("age").value;
  var gender = document.querySelector('input[name="gender"]:checked').value;
  var fname = document.getElementById("fname").value;
  var lname = document.getElementById("lname").value;
  var email = document.getElementById("email").value;
  var password = document.getElementById("password").value;

  var data = {
    nickname: nickname,
    age: age,
    gender: gender,
    fname: fname,
    lname: lname,
    email: email,
    password: password,
  };

  fetch("/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then(function (response) {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error("Error: " + response.statusText);
      }
    })
    .then(function (response) {
      if (response !== "success") {
        alert(response);
      } else {
        window.navigate("login");
      }
    });
}

export { register };
