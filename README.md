# SCIP
Salmon Climate Impacts Portal

This web portal provides people managing salmon habitat with information on how climate change will affect the habitat areas.

It relies on four backend data services. 
* The PCEX API is used to provide aggregated climatological or hydrological data about a selected area. 
* The SCIP API isused to provide information on the location and status of salmon populations, and other areas users might be interested in (watersheds)
* Tilesever provides map backgrounds (city names, roads, rivers etc) for the map
* ncWMS provides colour-coded data overlays for the maps

## How to run SCIP for development using pre-existing PCIC docker instances

This is the easiest way to develop this frontend - use all the data services someone else has already set up! This requires you to be on the PCIC VPN so you can access data services running on docker-dev02.

Clone the repository and install it with `npm install`. Set the following environmental variables to point to development servers:

```bash
# PCEX API - use an intance that is not in production
export REACT_APP_PCEX_API_URL=https://services.pacificclimate.org/dev/pcex/api

# SCIP API - use an instance that is not in production
export REACT_APP_SCIP_API_URL=https://services.pacificclimate.org/dev/scip/api/

#tileserver URL
export REACT_APP_BC_BASE_MAP_TILES_URL=https://services.pacificclimate.org/tiles/bc-albers-lite/{z}/{x}/{y}.png

#map configs - you will not need to modify these
export REACT_APP_BASE_MAP=BC
```

At which point all you should need to do is start the frontend with with:
```
npm start
```

## How to set up the SCIP frontend and API on bare metal on your workstation

If you need a more self-contained or customizable development environment, perhaps with custom data, you can set up the backend SCIP API on your workstation.

### Setting up the SCIP API
You can clone this [data server](https://github.com/pacificclimate/scip-backend) from github, install it, and and run it on your workstation.

```
$ git clone http://github.com/pacificclimate/scip-backend
$ cd scip-backend
$ poetry install
$ export FLASK_APP=scip.wsgi:app
$ export DB="postgresql://user:password@server:port/database" #fill in your database's connection string
$ poetry run flask run -p 8000
```

### Setting up the frontend

Clone the repository and then install it with `npm install`. Before you run it you need to set environment variables to tell it where all the data sources are:

```bash
# PCEX API - use an intance that is not in production
export REACT_APP_PCEX_API_URL=https://services.pacificclimate.org/dev/pcex/api

# local SCIP API
export REACT_APP_PCEX_API_URL=https://127.0.0.1:8000/api

#tileserver URL
export REACT_APP_BC_BASE_MAP_TILES_URL=https://services.pacificclimate.org/tiles/bc-albers-lite/{z}/{x}/{y}.png

#data configs - shouldn't need to modify
export REACT_APP_BASE_MAP=BC
```

You should then be able to run the portal with 

```
npm start
```

That command automatically opens a browser window pointing at localhost:3000/frontend.

## How to run SCIP in production-style dockers on your workstation

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

You should be able to build the docker container as follows from the
repository root:

```bash
docker build -t scip -f docker/Dockerfile
```

### Executing all components

After building the `scip` docker image, you should be able to run the
`docker-compose.yaml` setup included in the repository, which creates 3 containers: geoserver,
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


## How to update the SCIP demo instance

This application has not yet had a full release, and has no production instances, but there is a semipermanent demo instance running on docker-dev02. You will not need to worry about CORS or proxies when working with this instance, as a proxy is already set up for it.

1. Clone this repository to anywhere on docker-dev02 and check out whatever branch you want to demo 
2. Build the docker image with `docker build -t scip:your-branch-name -f docker/Dockerfile .`
3. Make a new dated directory in `/storage/data/projects/comp_support/bc-srif/dev/` for your demo and copy files into it from the most recent existing directory (note these are not the same as the docker-compose files files in this repository)
4. Update `docker-compose.yaml` in your new directory with the name of the image you built
5. Update `fe.env` if needed
6. Do `docker-compose down` in the directory of the current demo to bring down the current containers
7. Do `docker-compose up -d` in your new directory to launch your containers
8. Demo will be available at https://services.pacificclimate.org/dev/scip/app/
