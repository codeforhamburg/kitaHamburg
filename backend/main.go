package main

import (
	"flag"
	"log"
	"net/http"
	"os"

	mgo "gopkg.in/mgo.v2"
)

var (
	configFile string
	cnf        *Config
	logger     *log.Logger
)
var (
	DBSes *mgo.Session
	DB    *mgo.Database
	Kitas *mgo.Collection
)

func init() {
	flag.StringVar(&configFile, "f", "kitaHamburg.conf", "configFile to read settings from")
	logger = log.New(os.Stderr, "", log.Lshortfile|log.Ldate|log.Ltime|log.Lmicroseconds)
}

func initCnf() error {
	flag.Parse()
	cnf = NewConfig()

	err := cnf.Read(configFile)
	if err != nil {
		logger.Fatalf("Error reading config file %s: %s", configFile, err)
		return err
	}

	file, err := os.OpenFile(cnf.Log.File, os.O_RDWR|os.O_CREATE|os.O_TRUNC, 0644)
	if err != nil {
		logger.Fatalf("Error opening log file %s: %s", cnf.Log.File, err)
		return err
	}
	logger = log.New(file, "", log.Lshortfile|log.Ldate|log.Ltime|log.Lmicroseconds)

	DBSes, err := mgo.Dial(cnf.MongoDB.Adr())
	if err != nil {
		logger.Fatalf("Error dialing DB %v: %s", cnf.MongoDB, err)
		return err
	}

	DB := DBSes.DB(cnf.MongoDB.Database)
	Kitas = DB.C(cnf.MongoDB.Collection)

	logger.Printf("Initialisation finished.")
	logger.Printf("Config: %#v", cnf)

	return nil
}

func main() {
	err := initCnf()
	if err != nil {
		os.Exit(1)
	}

	mux := http.NewServeMux()

	mux.Handle("/", &DBHandler{AjaxHandler: &AjaxHandler{}})

	logger.Println("Listening", cnf.Net.Adr())
	logger.Fatalln("Serving:",
		http.ListenAndServe(
			cnf.Net.Adr(),
			mux))

}
