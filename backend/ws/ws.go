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
	client := &Client{conn: conn, username: username}
	clients[username] = client

	messageToSend := structs.MessageStatus{
		Type: "user_status_update",
		User: username,
		Status: "online",
	}
	broadcastToAllClients(clients, messageToSend)
	defer func() {
		messageToSend := structs.MessageStatus{
		Type: "user_status_update",
		User: username,
		Status: "offline",
	}
	broadcastToAllClients(clients, messageToSend)
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
		recipientUsername := messageAndUsername[1]

		if _, err := db.Exec("INSERT INTO messages (user, recipient, message) values (?,?,?)", username, recipientUsername, message); err != nil {
			fmt.Println(err)
		}

		recipientClient, ok := clients[recipientUsername]
		if ok {
			messageToSend := structs.MessageToJS{
				Type: "private_message",
				Message: message,
				Sender: username,
				Time: time.Now().Format("01-02-2006"),
			}
			jsonMessage, err := json.Marshal(messageToSend)
			if err != nil {
				fmt.Println(err)
			}
			if err := recipientClient.conn.WriteMessage(messageType, jsonMessage); err != nil {
				fmt.Println(err)
			}
		}
	}
}

func broadcastToAllClients(clients map[string]*Client, message structs.MessageStatus) {
	jsonMessage, err := json.Marshal(message)
	if err != nil {
		fmt.Println(err)
	}

	for _, client := range clients {
		if err := client.conn.WriteMessage(websocket.TextMessage, jsonMessage); err != nil {
			fmt.Println(err)
		}
	}
}

type UserTemp struct {
	CurrentUser string `json:"currentUser"`
}

func GetUsersHandler(w http.ResponseWriter, r *http.Request){
	var users UserTemp
	err := json.NewDecoder(r.Body).Decode(&users)
	if err != nil {
		json.NewEncoder(w).Encode(err)
	}
	fmt.Println(users)
	db := db.OpenDatabase()
	defer db.Close()
	rows, err := db.Query(`
	SELECT users.nick, users.age, users.gender, users.fname, users.lname, users.email,
	CASE
		WHEN MAX(sent_messages.timestamp) IS NULL AND MAX(received_messages.timestamp) IS NULL THEN ''
		WHEN MAX(sent_messages.timestamp) IS NULL THEN STRFTIME('%Y-%m-%d %H:%M:%f', MAX(received_messages.timestamp))
		WHEN MAX(received_messages.timestamp) IS NULL THEN STRFTIME('%Y-%m-%d %H:%M:%f', MAX(sent_messages.timestamp))
		ELSE STRFTIME('%Y-%m-%d %H:%M:%f', CASE WHEN MAX(sent_messages.timestamp) > MAX(received_messages.timestamp) THEN MAX(sent_messages.timestamp) ELSE MAX(received_messages.timestamp) END)
	END as latest_message_time
	FROM users
	LEFT JOIN messages AS sent_messages ON users.nick = sent_messages.user
	LEFT JOIN messages AS received_messages ON users.nick = received_messages.recipient
	GROUP BY users.nick, users.age, users.gender, users.fname, users.lname, users.email
	ORDER BY latest_message_time DESC
`)


	if err != nil {
		json.NewEncoder(w).Encode(err)
		fmt.Println("perse majas", err)
	}
	usersArr := make([]structs.PublicUser, 0)
	for rows.Next(){
		var user structs.PublicUser
		var latestMessageTime string
		err := rows.Scan(&user.Nickname, &user.Age, &user.Gender, &user.Email, &user.Fname, &user.Lname, &latestMessageTime)
		if err != nil {
			json.NewEncoder(w).Encode(err)
			fmt.Println("error scanning", err)
		}
		if(clients[user.Nickname] != nil) {
			user.Status = "online"
		} else {
			user.Status = "offline"
		}
		if user.Nickname != users.CurrentUser {
			usersArr = append(usersArr, user)
		}
	}
	w.Header().Set("Content-Type", "application/json")
  	json.NewEncoder(w).Encode(usersArr)
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
