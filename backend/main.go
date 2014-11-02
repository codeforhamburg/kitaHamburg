package main

import (
	"flag"
	"fmt"
	"log"
	"net/http"
	"net/http/cgi"
	"os"
)

var local bool

func init() {
	flag.BoolVar(&local, "l", false, "serve local")
	log.SetFlags(log.Ldate | log.Ltime | log.Lshortfile)
	file, err := os.OpenFile(LogFileName, os.O_CREATE|os.O_CREATE|os.O_TRUNC, 0644)
	if err != nil {
		panic(fmt.Sprintf("logfile %s: %s", LogFileName, err))
	}
	log.SetOutput(file)
}

func ExitErr(err error, status int) {
	if err != nil {
		resp := &http.Response{
			StatusCode: status,
			ProtoMajor: 1,
			ProtoMinor: 0,
		}
		log.Println("err:", err, resp)
		resp.Write(os.Stdout)
	}
}

func main() {
	flag.Parse()
	mux := http.NewServeMux()

	log.Println("DB:", DBHost, DBName, DBCol)
	handler, err := NewDBHandler(DBHost, DBName, DBCol)
	ExitErr(err, 500)
	log.Println("DB connected:", handler.DB, handler.Kitas)

	mux.Handle("/", handler)

	if local {
		log.Println("Serving standalone:", HTTPHost)
		log.Fatal(http.ListenAndServe(HTTPHost, mux))
	} else {
		log.Println("Serving fcgi")
		log.Fatal(cgi.Serve(mux))
	}
}
