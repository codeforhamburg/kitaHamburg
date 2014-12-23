#kitafinder
Die Kitafinder app für Hamburg.

##Features
- kitas nach Betreuungsangebot filtern (done)
- kitas nach Stadtteil filtern (done)
- kitas nach Umkreis filtern (tbd)
- kitas finden, die an einer bestimmten route liegen (tbd)


##Install - Frontend
- node.js installieren
- cmd-line: npm install -g grunt-cli bower
- cmd-line: cd kitaHamburg/client
- cmd-line: npm install *warten*
- cmd-line: bower install

##Install - Backend
- install go (golang.org)
- cmd-line: cd kitaHamburg/backend
- cmd-line: go install
- cmd-line: backend -l

## Install - DB
- install MongoDB
- mongo-import -d kita -c kitas -t json --jsonArray < client/app/kitas.geojson

##dev-server starten
- benötigt vorher install
- cmd-line: mongod -f /path/to/your/mongod.conf
- cmd-line: backend -l
- cmd-line: cd kitaHamburg/client
- cmd-line: grunt serve


## TODO:
### Database:
- clean/consolidate Fieldnames (requires syncronous code changes)

### Backend:
- Configfile for settings
- better logging
- general cleanup
- startup script for deploy
- drop cgi stuff

### Frontend:
- include leaflet/dist/images into build (imagemin!)
- search progress indicator
- 