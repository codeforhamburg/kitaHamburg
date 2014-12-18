package main

import (
	"encoding/json"
	"log"
	"net/http"

	//gcw "github.com/gocraft/web"
	mgo "gopkg.in/mgo.v2"
	bson "gopkg.in/mgo.v2/bson"
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

	var data services
	err := dec.Decode(&data)
	log.Println(data)
	RespErr(w, err, 500)
	ExitErr("decoding request body", err, 500)

	var found []interface{}
	q := buildQuery(data)
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

func buildQuery(data services) bson.M {
	parts := make([]bson.M, 0, len(data))
	for service, times := range data {
		parts = append(parts, bson.M{"$and": []bson.M{
			bson.M{"properties.services." + service: bson.M{"$exists": true}},
			bson.M{"properties.services." + service + ".Min": bson.M{"$lte": times.Min}},
			bson.M{"properties.services." + service + ".Max": bson.M{"$gte": times.Max}},
		}})
	}
	if len(parts) == 1 {
		return parts[0]
	}
	return bson.M{"$and": parts}
}
