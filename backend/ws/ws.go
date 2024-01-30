package ws

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"real-time-forum/backend/db"
	"real-time-forum/backend/structs"
	"strconv"
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
		Type:   "user_status_update",
		User:   username,
		Status: "online",
	}
	broadcastToAllClients(clients, messageToSend)
	defer func() {
		messageToSend := structs.MessageStatus{
			Type:   "user_status_update",
			User:   username,
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
				Type:    "private_message",
				Message: message,
				Sender:  username,
				To:      recipientUsername,
				Time:    time.Now().Format("02-01 15.04"),
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

func GetUsersHandler(w http.ResponseWriter, r *http.Request) {
	var users UserTemp
	err := json.NewDecoder(r.Body).Decode(&users)
	if err != nil {
		json.NewEncoder(w).Encode(err)
	}
	db := db.OpenDatabase()
	defer db.Close()

	query := "SELECT COUNT(*) FROM messages WHERE user = ? OR recipient = ?"
	var count int
	err = db.QueryRow(query, users.CurrentUser, users.CurrentUser).Scan(&count)
	if err != nil {
		json.NewEncoder(w).Encode(err)
		fmt.Println(err)
	}
	var rows *sql.Rows
	if count > 0 {
		//Order by messages
		rows, err = db.Query(`
		SELECT u.nick, u.age, u.gender, u.email, u.fname, u.lname, MAX(m.timestamp) AS latest_message_time
		FROM users u
		LEFT JOIN messages m ON u.nick = m.user OR u.nick = m.recipient
		GROUP BY u.nick
		ORDER BY latest_message_time DESC
	`)
	} else {
		//Order alphabetically
		rows, err = db.Query("SELECT nick, age, gender, email, fname, lname FROM users ORDER BY nick COLLATE NOCASE")
	}
	//rows, err := db.Query("SELECT nick, age, gender, email, fname, lname FROM users ORDER BY nick COLLATE NOCASE")
	if err != nil {
		json.NewEncoder(w).Encode(err)
		fmt.Println(err)
	}
	usersArr := make([]structs.PublicUser, 0)
	for rows.Next() {
		var user structs.PublicUser
		var err error
		var latestMessageTime sql.NullString

		if count > 0 {
			err := rows.Scan(&user.Nickname, &user.Age, &user.Gender, &user.Email, &user.Fname, &user.Lname, &latestMessageTime)
			if err != nil {
				json.NewEncoder(w).Encode(err)
				fmt.Println("error scanning", err)
			}
		} else {
			err = rows.Scan(&user.Nickname, &user.Age, &user.Gender, &user.Email, &user.Fname, &user.Lname)
		}
		if err != nil {
			json.NewEncoder(w).Encode(err)
			fmt.Println("error scanning", err)
		}
		if clients[user.Nickname] != nil {
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

	db := db.OpenDatabase()
	defer db.Close()

	messages := make([]structs.Message, 0)
	
	offset := r.URL.Query().Get("offset")
	offsetInt, err := strconv.Atoi(offset)
    if err != nil {
        http.Error(w, "Invalid offset parameter", http.StatusBadRequest)
        return
    }
	
  	rows, err := db.Query(`
    	SELECT user, recipient, message, strftime('%d-%m %H.%M', timestamp, 'localtime') AS formatted_timestamp
    	FROM messages
    	WHERE (user = ? AND recipient = ?) OR (user = ? AND recipient = ?)
    	ORDER BY timestamp DESC LIMIT 10 OFFSET ?
  	`, username, recipient, recipient, username, offsetInt)
	if err != nil {
		json.NewEncoder(w).Encode(err)
	}
	for rows.Next() {
		var message structs.Message
		err := rows.Scan(&message.User, &message.Recipient, &message.Message, &message.FormattedTimestamp)
		if err != nil {
			json.NewEncoder(w).Encode(err)
		}
		messages = append(messages, message)
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(messages)
}
