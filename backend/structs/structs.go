package structs

import "time"

type Post struct {
	Poster     string `json:"poster"`
	Title      string `json:"title"`
	Content    string `json:"content"`
	Categories string `json:"categories"`
}

type User struct {
	Nickname string `json:"nickname"`
	Age      string `json:"age"`
	Gender   string `json:"gender"`
	Fname    string `json:"fname"`
	Lname    string `json:"lname"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

type PublicUser struct {
	Nickname string `json:"nickname"`
	Age      string `json:"age"`
	Gender   string `json:"gender"`
	Fname    string `json:"fname"`
	Lname    string `json:"lname"`
	Email    string `json:"email"`
}

type PostData struct {
	Id         string `json:"id"`
	Title      string `json:"title"`
	Poster     string `json:"poster"`
	Content    string `json:"content"`
	Categories string `json:"categories"`
}

type Comment struct {
	ID      int    `json:"id"`
	PostID  string `json:"postID"`
	User    string `json:"user"`
	Comment string `json:"comment"`
}

type Message struct {
	User      string `json:"user"`
	Recipient string `json:"recipient"`
	Message   string `json:"message"`
	Timestamp time.Time `json:"timestamp"`
}