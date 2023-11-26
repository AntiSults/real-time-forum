package main

import (
	"fmt"
	"log"
	"net/http"
	"path/filepath"
	"real-time-forum/backend/db"
	"real-time-forum/backend/login"
	"real-time-forum/backend/posts"
	"real-time-forum/backend/register"
	"real-time-forum/backend/ws"
	"text/template"
)

func main() {
	setup()
}

func setup() {
	db.CreateTables()
	http.HandleFunc("/js/", func(w http.ResponseWriter, r *http.Request) {
		jsFilePath := filepath.Join("js", filepath.Base(r.URL.Path))
		http.ServeFile(w, r, jsFilePath)
	})
	http.HandleFunc("/assets/", func(w http.ResponseWriter, r *http.Request) {
		jsFilePath := filepath.Join("assets", filepath.Base(r.URL.Path))
		http.ServeFile(w, r, jsFilePath)
	})
	http.HandleFunc("/", handler)
	http.HandleFunc("/register", register.RegHandler)
	http.HandleFunc("/login", login.LogHandler)
	http.HandleFunc("/createPost", posts.PostHandler)
	http.HandleFunc("/showPosts", posts.ShowPosts)
	http.HandleFunc("/post/", posts.PostPage)
	http.HandleFunc("/comment", posts.SubmitComment)
	http.HandleFunc("/showComments/", posts.ShowComments)
	http.HandleFunc("/ws", ws.WsHandler)
	http.HandleFunc("/getUsers", ws.GetUsersHandler)
	http.HandleFunc("/loadChat", ws.LoadChat)
	fmt.Println("Listening on http://localhost:5000")
	http.ListenAndServe(":5000", nil)
}

func handler(w http.ResponseWriter, r *http.Request) {
	tmpl, err := template.ParseFiles("./forum.html")
	if err != nil  {
		fmt.Println(err)
		log.Fatal()
	}
	tmpl.Execute(w, nil)
}