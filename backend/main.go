package main

import (
	"fmt"
	"log"
	"net/http"
	"text/template"
)

func main() {
	setup()
}

func setup() {
	http.HandleFunc("/", handler)
	fmt.Println("Listening on port 5000")
	http.ListenAndServe(":5000", nil)
}

func handler(w http.ResponseWriter, r *http.Request) {
	tmpl, err := template.ParseFiles("../forum.html")
	if err != nil  {
		fmt.Println(err)
		log.Fatal()
	}
	tmpl.Execute(w, nil)
}