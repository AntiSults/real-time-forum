package login

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"real-time-forum/backend/db"

	"golang.org/x/crypto/bcrypt"
)

type loginResponse struct {
  LoginSuccessful bool   `json:"loginSuccessful"`
  ErrorMessage    string `json:"errorMessage"`
  CurrentUser string `json:"currentUser"`
}

func LogHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method == "POST" {
		decoder := json.NewDecoder(r.Body)
    	var data map[string]string
    	err := decoder.Decode(&data)
		if err != nil {
    		http.Error(w, err.Error(), http.StatusBadRequest)
      		return
    	}
		success, errs := loginSuccessful(data)
		if errs != "" {
			json.NewEncoder(w).Encode(loginResponse{LoginSuccessful: false, ErrorMessage: errs})
		} else if success {
  			json.NewEncoder(w).Encode(loginResponse{LoginSuccessful: true, CurrentUser: data["email"]})
		} else {
  			json.NewEncoder(w).Encode(loginResponse{LoginSuccessful: false, ErrorMessage: "Invalid email or password"})
		}
	} else {
		fmt.Println("homepage")
	}
}

func loginSuccessful(data map[string]string) (bool, string) {
	db := db.OpenDatabase()
	defer db.Close()

	var hashedPassword string
		err := db.QueryRow("SELECT password FROM users WHERE email = ?", data["email"]).Scan(&hashedPassword)
		if err != nil{
			if err == sql.ErrNoRows {
					// Email not found
				return false, "Email not found"
			} else {
				return false, "Internal server error"
			}
		}
		err = bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(data["password"]))
		if err != nil {
			return false, "Passwords don't match"
		}
		return true, ""
}