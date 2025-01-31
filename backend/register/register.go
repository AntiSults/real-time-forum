package register

import (
	"encoding/json"
	"fmt"
	"net/http"
	"real-time-forum/backend/db"
	"real-time-forum/backend/structs"
)

func RegHandler(w http.ResponseWriter, r *http.Request){
	if r.Method == "POST" {
		var u structs.User
    	err := json.NewDecoder(r.Body).Decode(&u)
    	
    	if err != nil {
			fmt.Print(err)
    		json.NewEncoder(w).Encode("error decoding")
      		return
    	}
		switch{
			case len(u.Nickname) < 3:
				json.NewEncoder(w).Encode("Nickname too short")
			case len(u.Fname) < 3:
				json.NewEncoder(w).Encode("First name too short")
			case len(u.Lname) < 3:
				json.NewEncoder(w).Encode("Last name too short")
		}
		err = db.InsertUser(u)
		if err != nil {
			json.NewEncoder(w).Encode("error inserting to database, this may indicate the nickname or email is already registered")
      		return
		}
		json.NewEncoder(w).Encode("success")
	}	
}