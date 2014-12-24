package main

import (
	"fmt"
	"os"

	"github.com/BurntSushi/toml"
)

type DBCnf struct {
	Host       string
	Port       uint
	Database   string
	Collection string
}

func (c DBCnf) Adr() string {
	return fmt.Sprintf("%s:%d", c.Host, c.Port)
}

type NETCnf struct {
	Host string
	Port uint
}

func (c NETCnf) Adr() string {
	return fmt.Sprintf("%s:%d", c.Host, c.Port)
}

type LOGCnf struct {
	File string
}

type Config struct {
	MongoDB DBCnf
	Net     NETCnf
	Log     LOGCnf
}

func NewConfig() *Config {
	return &Config{
		DBCnf{"localhost", 27017, "kita", "kitas"},
		NETCnf{"localhost", 8888},
		LOGCnf{"kitaAPI.log"},
	}
}

func (c *Config) Read(filename string) error {
	file, err := os.Open(filename)
	if err != nil {
		return err
	}
	defer file.Close()

	if _, err = toml.DecodeReader(file, c); err != nil {
		return err
	}

	return nil
}
