package ws

import (
	"encoding/json"
	"fmt"
	"net/http"
	"real-time-forum/backend/db"
	"real-time-forum/backend/structs"
	"strings"
	"time"

	"github.com/gorilla/websocket"
)

type Client struct {
	conn     *websocket.Conn
	username string
	online bool
}

var clients = make(map[string]*Client)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
}

func WsHandler(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		fmt.Println(err)
	}
	username := r.URL.Query().Get("username")
	client := &Client{conn: conn, username: username, online: true}
	clients[username] = client
	defer func() {
		delete(clients, username)
	}()
	db := db.OpenDatabase()
	defer db.Close()
	for {
		messageType, p, err := conn.ReadMessage()
		if err != nil {
			fmt.Println(err)
		}
		messageAndUsername := strings.Split(string(p), "|")
		message := messageAndUsername[0]
		fmt.Println("putsis", p)
		recipientUsername := messageAndUsername[1]

		if _, err := db.Exec("INSERT INTO messages (user, recipient, message) values (?,?,?)", username, recipientUsername, message); err != nil {
			fmt.Println(err)
		}

		recipientClient, ok := clients[recipientUsername]
		if ok {
			message = message + "|" + username + "|" + time.Now().Format("01-02-2006")
			if err := recipientClient.conn.WriteMessage(messageType, []byte(message)); err != nil {
				fmt.Println(err)
			}
		}
	}
}

func GetUsersHandler(w http.ResponseWriter, r *http.Request){
	db := db.OpenDatabase()
	defer db.Close()
	rows, err := db.Query("SELECT nick, age, gender, fname, lname, email FROM users")
	if err != nil {
		json.NewEncoder(w).Encode(err)
	}
	users := make([]structs.PublicUser, 0)
	for rows.Next(){
		var user structs.PublicUser
		err := rows.Scan(&user.Nickname, &user.Age, &user.Gender, &user.Email, &user.Fname, &user.Lname)
		if err != nil {
			json.NewEncoder(w).Encode(err)
		}
		users = append(users, user)
	}
	w.Header().Set("Content-Type", "application/json")
  	json.NewEncoder(w).Encode(users)
}

func LoadChat(w http.ResponseWriter, r *http.Request) {
	username := r.URL.Query().Get("user")
	recipient := r.URL.Query().Get("recipient")

	db:=db.OpenDatabase()
	defer db.Close()
	messages := make([]structs.Message, 0)
	rows, err:= db.Query("SELECT user, recipient, message, timestamp FROM messages WHERE (user = ? AND recipient = ?) OR (user = ? AND recipient = ?)", username, recipient, recipient, username)
	if err != nil {
		json.NewEncoder(w).Encode(err)
	}
	for rows.Next(){
		var message structs.Message
		err := rows.Scan(&message.User, &message.Recipient, &message.Message, &message.Timestamp)
		if err != nil {
			json.NewEncoder(w).Encode(err)
		}
		fmt.Println(message)
		messages = append(messages, message)
	}
	w.Header().Set("Content-Type", "application/json")
  	json.NewEncoder(w).Encode(messages)
}
