package posts

import (
	"encoding/json"
	"fmt"
	"net/http"
	"real-time-forum/backend/db"
	"real-time-forum/backend/structs"
)



func PostHandler(w http.ResponseWriter, r *http.Request){
	if r.Method == "POST" {
		var p structs.Post
    	err := json.NewDecoder(r.Body).Decode(&p)
		fmt.Println(p)
		if err != nil {
    		json.NewEncoder(w).Encode("error decoding")
      		return
    	}
		errs := db.InsertPost(p)
		if (errs != ""){
			json.NewEncoder(w).Encode(`error inserting to database`)
			return
		}
		json.NewEncoder(w).Encode(`Successfully inserted post to database`)
	}
}