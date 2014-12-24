package main

import (
	"net/http"
)

type DBHandler struct {
	*AjaxHandler

	data       ReqData
	foundKitas []interface{}
}

func (h *DBHandler) RespErr() {
	h.status = 500
	h.respBuff.WriteString("You talk funny :-)")
}

func (h *DBHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	logger.Println("req:", r)
	defer r.Body.Close()
	h.Before(w, r)

	err := h.req.Decode(&(h.data))
	if err != nil {
		h.RespErr()
		return
	}
	logger.Println("data:", h.data)

	q := h.data.buildDBQuery()
	logger.Println("query:", q)

	if err = Kitas.Find(q).All(&h.foundKitas); err != nil {
		h.RespErr()
		return
	}

	if err = h.resp.Encode(&h.foundKitas); err != nil {
		h.RespErr()
		return
	}

	h.After(w, r)
}
