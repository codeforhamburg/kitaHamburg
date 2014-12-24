package main

import (
	"bytes"
	"encoding/json"
	"io"
	"net/http"
)

type AjaxHandler struct {
	req *json.Decoder

	status   int
	resp     *json.Encoder
	respBuff *bytes.Buffer
}

func (h *AjaxHandler) Before(w http.ResponseWriter, r *http.Request) {
	h.req = json.NewDecoder(r.Body)

	h.respBuff = bytes.NewBuffer(nil)
	h.resp = json.NewEncoder(h.respBuff)
}

func (h *AjaxHandler) After(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(h.status)

	n, err := io.Copy(w, h.respBuff)
	if err != nil {
		logger.Println("copying response body: %d bytes, %s", n, err)
	}
}
