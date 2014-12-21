package main

import (
	"encoding/json"
	"log"
	"net/http"

	//gcw "github.com/gocraft/web"
	mgo "gopkg.in/mgo.v2"
)

type DBHandler struct {
	DB    *mgo.Database
	Kitas *mgo.Collection
}

func NewDBHandler(DBCon string, DBName string, CollName string) (*DBHandler, error) {
	ses, err := mgo.Dial(DBCon)
	if err != nil {
		return nil, err
	}

	db := ses.DB(DBName)
	col := db.C(CollName)

	return &DBHandler{
		DB:    db,
		Kitas: col,
	}, nil
}

func (h *DBHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	log.Println("Request", r)
	dec := json.NewDecoder(r.Body)
	defer r.Body.Close()

	var data ReqData
	err := dec.Decode(&data)
	log.Println("body:", data)
	RespErr(w, err, 500)
	ExitErr("decoding request body", err, 500)

	var found []interface{}
	q := data.buildDBQuery()
	log.Println("q:", q)
	err = h.Kitas.Find(q).All(&found)
	RespErr(w, err, 500)
	ExitErr("querying db", err, 500)

	log.Println("found:", len(found))
	if len(found) > 0 {
		log.Println("one:", found[0])
	}
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	enc := json.NewEncoder(w)
	err = enc.Encode(found)
	ExitErr("Marshaling body", err, 500)
}
