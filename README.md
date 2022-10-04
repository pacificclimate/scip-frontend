# SCIP
Salmon Climate Impacts Portal

This web portal provides people managing salmon habitat with information on how climate change will affect the habitat areas.

It relies on four backend data services. 
* Geoserver is used to provide boundary information and metadata about areas of interest (watersheds) so that users can pick the watershed they're interested in. 
* The PCEX API is used to provide aggregated climatological or hydrological data about a selected area. 
* Tilesever provides map backgrounds (city names, roads, rivers etc) for the map
* ncWMS provides colour-coded data overlays for the maps

## How to set up SCIP for development

Currently you have to run geoserver on your desktop along with the SCIP front end and an nginx docker to facilitate them talking to eachother. A less cumbersome setup process will hopefully be available soon.

### Setting up geoserver
Geoserver has to be run on your workstation at present. You can download it and set it up according to its documentation. You may also need to install a JDK. By default, geoserver uses port 8080; the rest of these instructions will assume you have not changed the port. Geoserver uses a default admin password; you should change this.

The watershed shapefile data is found at `/storage/data/projects/comp_support/bc-srif/shapefiles/` and is named `watershed-degrees` - you need all four files. Copy the files to a directory on your workstation somewhere, then add them to geosever following geoserver's instructions for how to add data. The rest of these instructions assume you have named the geoserver `workspace` and `store` "watersheds" and leave the data name unchanged (so it will be `watershed-degrees`, same as the filenames). 

### Setting up the nginx docker

Javascript has a safety feature called CORS (Cross Origin Resource Sharing). This feature sometimes prevents a javascript website from loading data from a second website, to cut down on malicious behaviours like mining bitcoins using the user's browser. In our case, SCIP won't be able to access geoserver because overzealous CORS restrictions make it look like one website accessing another in a malicious way. 

The (short term) solution is the web proxy nginx, which we'll use to convince Javascript that geoserver and SCIP are the same server. Geoserver is running on port 8080; SCIP is running on port 3000. We'll run nginx to make both of them accessible on port 5000 so they think they're running in the same place. 

If you have docker installed, you can get the nginx docker image:

```
docker pull nginx
```
make a directory somewhere and add these files:

docker-compose.yaml
```
version: '3.2'
services:
  proxy:
    image: nginx
    container_name: salmon-proxy
    ports:
      - "5000:80"
    volumes:
      - type: bind
        source: ./nginx.conf
        target: /etc/nginx/nginx.conf
        read_only: true
```

nginx.conf
```
worker_processes 1;

events { worker_connections 1024; }

http {

    server {
        listen 80;
        server_name hydro.mapper;

        location /frontend/ {
            proxy_pass http://YOUR.IP.GOES.HERE:3000/frontend/ ;
            proxy_set_header   Host $host;
                proxy_set_header   X-Real-IP $remote_addr;
                proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
                proxy_set_header   X-Forwarded-Host $server_name;
        }

        location /gs/ {
            proxy_pass http://YOUR.IP.GOES.HERE:8080/ ;
            proxy_set_header   Host $host;
                proxy_set_header   X-Real-IP $remote_addr;
                proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
                proxy_set_header   X-Forwarded-Host $server_name;
        }
    }
}
```
This file makes the npm server running on port 3000 and the geoserver running on port 8080 both accessible on nginx's port 5000. 

Update the nginx.conf file with your IP. You will have to update it each time you get a new IP (such as by joining or leaving a VPN).

Start the nginx docker 
```
docker-compose up
```

### Setting up the frontend

Clone the repository and then install it with `npm install`. Before you run it you need to set environment variables to tell it where all the data sources are:

```bash
# PCEX API - use an intance that is not in production
export REACT_APP_PCEX_API_URL=https://services.pacificclimate.org/dev/pcex/api

# shapefile name - change if you changed it in the geoserver setup
export REACT_APP_WATERSHED_TYPENAME=watersheds:watershed-degrees

#nginx URL for geoserver - change if you configured nginx differently
export REACT_APP_REGIONS_SERVICE_URL=http://127.0.0.1:5000/gs/geoserver/watersheds/ows

#tileserver URL
export REACT_APP_BC_BASE_MAP_TILES_URL=https://services.pacificclimate.org/tiles/bc-albers-lite/{z}/{x}/{y}.png

#data configs - shouldn't need to modify
export REACT_APP_BASE_MAP=BC
export REACT_APP_TEST_API_FILE=tasmax_mClimMean_BCCAQv2_PCIC12_historical-rcp85_rXi1p1_19610101-19901231_Canada
```

You should then be able to run the portal with 

```
npm start
```

That command automatically opens a browser window pointing at localhost:3000/frontend , but that URL won't work - it will get CORS errors when trying to access geoserver. You need to open your own window to nginx's version of the frontend at http://127.0.0.1:5000/frontend/ instead.

## How to set up SCIP for production

### Setting up the frontend

Running a nodejs frontend in development vs. production varies
slightly. In development, one wants full access to the source code,
whereas in production, one wants the js files to be bundled and
compressed to minimize network transfer and client RAM usage.

Do use Node's static server, we do something like this (found in the
entrypoint.sh script)

```
# Install Node's static server
npm install -g serve
# Build the bundle
npm run build
# Serve the files from the build directory on port 3000
# routing unfound files to index.html (-s)
serve -l 3000 -s build
```

Depending on to where you are deploying, you will *probably* need to
change the `homepage` in the `package.json` file, setting it to the
app's [root
url](https://create-react-app.dev/docs/deployment#building-for-relative-paths). Otherwise,
your app is liable to generate 404's.

After editing the `package.json` file, you should be able to build the
docker container as follows from the repository root:

```bash
docker build -t scip -f docker/Dockerfile
```

### Executing all components

After building the `scip` docker image, you should be able to run the
`docker-compose.yaml` setup, which creates 3 containers: geoserver,
scip, and nginx to be the main frontend.

```bash
cd docker
docker-compose up -d
```

After a few minutes of create-react-app building, one should be able
to access the frontend at:

http://localhost/frontend

and geoserver at:

http://localhost/geoserver
