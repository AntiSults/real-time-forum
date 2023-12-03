package posts

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"real-time-forum/backend/db"
	"real-time-forum/backend/structs"
	"strings"
)



func PostHandler(w http.ResponseWriter, r *http.Request){
	if r.Method == "POST" {
		var p structs.Post
    	err := json.NewDecoder(r.Body).Decode(&p)
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

func ShowPosts(w http.ResponseWriter, r *http.Request){
	if r.Method == "GET"{
		db := db.OpenDatabase()
		defer db.Close()
		rows, err := db.Query("SELECT * FROM posts")
		if err != nil {
			json.NewEncoder(w).Encode(`error while trying to query`)
		}
		defer rows.Close()

		posts := make([]structs.PostData, 0)
		for rows.Next() {
			var post structs.PostData
			err := rows.Scan(&post.Id, &post.Poster, &post.Title, &post.Categories, &post.Content  )
			if err != nil {
				json.NewEncoder(w).Encode(`error while trying to scan`)
			}
			posts = append(posts, post)
		}
		w.Header().Set("Content-Type", "application/json")
  		json.NewEncoder(w).Encode(posts)
	}
}

func PostPage(w http.ResponseWriter, r *http.Request){
	if r.Method == "GET" {
		d := strings.Split(r.URL.String(), "/")
		postID := d[2]
		db := db.OpenDatabase()
		defer db.Close()
		var p structs.PostData
		err := db.QueryRow("SELECT * FROM posts WHERE id = ?", postID).Scan(&p.Id, &p.Poster, &p.Title, &p.Categories, &p.Content)
		if err != nil {
			json.NewEncoder(w).Encode(`error getting query`)
		}
		fmt.Println(p.Content)
		w.Header().Set("Content-Type", "application/json")
		err = json.NewEncoder(w).Encode(p)
		if err != nil {
			log.Println(err)
		}
	}
}

func SubmitComment(w http.ResponseWriter, r *http.Request){
	if r.Method == "POST" {
		db := db.OpenDatabase()
		defer db.Close()
		var comment structs.Comment
		json.NewDecoder(r.Body).Decode(&comment)
		
		_, err := db.Exec("INSERT INTO comments (commenter, comment, postID) values (?,?,?)", comment.User, comment.Comment, comment.PostID)
		fmt.Println(comment)
		if err != nil {
			fmt.Println(err)
			json.NewEncoder(w).Encode("error inserting")
		}
		json.NewEncoder(w).Encode("success")
	}
}

func ShowComments(w http.ResponseWriter, r *http.Request){
	if r.Method == "GET" {
		postID := r.URL.Query().Get("postid")
		comments := make([]structs.Comment, 0)
		db := db.OpenDatabase()
		defer db.Close()
		rows, err := db.Query("SELECT * FROM comments WHERE postID = ?", postID)
		if err != nil {
			json.NewEncoder(w).Encode("error getting the query")
		}
		for rows.Next() {
			var comment structs.Comment
			err := rows.Scan(&comment.ID, &comment.User, &comment.Comment, &comment.PostID)
			fmt.Println("comments:", comments)
			if err != nil {
				json.NewEncoder(w).Encode(err)
			}
			comments = append(comments, comment)
		}
		w.Header().Set("Content-Type", "application/json")
  		json.NewEncoder(w).Encode(comments)
	}
}