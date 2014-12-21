package main

import bson "gopkg.in/mgo.v2/bson"

type MinMax struct {
	Min int
	Max int
}

type Services map[string]MinMax

func (s Services) buildDBQuery() bson.M {
	parts := make([]bson.M, 0, len(s))
	for service, times := range s {
		parts = append(parts,
			bson.M{"properties.services." + service: bson.M{"$exists": true}},
		)

		if times.Min > 0 && times.Max > 0 {
			parts = append(parts,
				bson.M{"properties.services." + service + ".Min": bson.M{"$lte": times.Min}},
				bson.M{"properties.services." + service + ".Max": bson.M{"$gte": times.Max}},
			)
		}
	}
	if len(parts) == 1 {
		return parts[0]
	}
	return bson.M{"$and": parts}
}

type Stadtteile map[string]bool

func (s Stadtteile) buildDBQuery() bson.M {
	parts := make([]bson.M, 0, len(s))
	for stadtteil := range s {
		parts = append(parts,
			bson.M{"properties.stadtteil": stadtteil},
		)
	}

	return bson.M{"$or": parts}
}

type ReqData struct {
	Services   Services   `json: "services"`
	Stadtteile Stadtteile `json: "stadtteile"`
}

func (q ReqData) buildDBQuery() bson.M {
	parts := make([]bson.M, 0, 2)
	if len(q.Services) != 0 {
		parts = append(parts, q.Services.buildDBQuery())
	}
	if len(q.Stadtteile) != 0 {
		parts = append(parts, q.Stadtteile.buildDBQuery())
	}

	if len(parts) == 1 {
		return parts[0]
	}
	return bson.M{"$and": parts}
}
