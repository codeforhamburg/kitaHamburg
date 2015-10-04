#kitafinder
Die Kitafinder app für Hamburg.
Live: [http://hamburg.codefor.de/kitas]


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
- cmd-line: backend -f ../example.conf

## Install - DB
- install MongoDB
- mongoimport -d kita -c kitas -t json --jsonArray < data/kitaArray.json

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
- startup script for deploy

### Frontend:
- include leaflet/dist/images into build (imagemin!)
- search progress indicator

## LICENSE
see LICENSE file