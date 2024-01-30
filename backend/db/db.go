package db

import (
	"database/sql"
	"fmt"
	"log"
	"real-time-forum/backend/structs"
	"strings"

	_ "github.com/mattn/go-sqlite3"
	"golang.org/x/crypto/bcrypt"
)

func CreateTables(){
	fmt.Println("Starting database")
	db := OpenDatabase()
	defer db.Close()
	statement, err := db.Prepare("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, nick TEXT, age INTEGER, gender TEXT, email TEXT, fname TEXT, lname TEXT, password TEXT)")
	if err != nil {
		log.Println("Error in creating table")
	}
	statement.Exec()
	posts, err := db.Prepare("CREATE TABLE IF NOT EXISTS posts (id INTEGER PRIMARY KEY, poster TEXT, title TEXT, categories TEXT, content TEXT, FOREIGN KEY (poster) REFERENCES users(nickname))")
	if err != nil {
		log.Println("Error in creating table")
	}
	posts.Exec()
	comments, err := db.Prepare("CREATE TABLE IF NOT EXISTS comments (id INTEGER PRIMARY KEY, commenter TEXT, comment TEXT, postID TEXT)")
	if err != nil {
		log.Println("Error in creating table")
	}
	comments.Exec()
	messages, err := db.Prepare("CREATE TABLE IF NOT EXISTS messages (id INTEGER PRIMARY KEY, user TEXT, recipient TEXT, message TEXT, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)")
	if err != nil {
		log.Println("Error in creating table")
	}
	messages.Exec()
	
}

func InsertUser(u structs.User) error{
	db := OpenDatabase()
	defer db.Close()

	row := db.QueryRow(`SELECT COUNT(*) FROM users WHERE nick = ? OR email = ?`, u.Nickname, u.Email)
	count := 0
	err := row.Scan(&count)
	if err != nil {
		log.Fatal(err)
	}
	if count != 0 {
		return fmt.Errorf("user already exists")
	} else {
		hashedPW, err := bcrypt.GenerateFromPassword([]byte(u.Password), bcrypt.DefaultCost)
		if err != nil {
			log.Fatal(err)
		}
		_, err = db.Exec("INSERT INTO users (nick, age, gender, email, fname, lname, password) VALUES (?, ?, ?, ?, ?, ?, ?)", u.Nickname, u.Age, u.Gender, u.Email, u.Fname, u.Lname, string(hashedPW))
		if err != nil {
			log.Fatal(err)
		}
		return nil
	}
}

func OpenDatabase() *sql.DB{
	db, err := sql.Open("sqlite3", "./backend/db/forum.db")
	if err != nil {
		log.Println(err)
	}
	return db
}

func InsertPost(p structs.Post) string {
	fmt.Println(p)
	db := OpenDatabase()
	defer db.Close()
	categories := strings.Join(p.Categories, "|")
	_, err := db.Exec("INSERT INTO posts (poster, title, categories, content) VALUES (?,?,?,?)", p.Poster, p.Title, categories, p.Content)
	if err != nil {
		return err.Error()
	}
	return ""
}