# SCIP
Salmon Climate Impacts Portal

This web portal provides people managing salmon habitat with information on how climate change will affect the habitat areas.

It relies on four backend data services. 
* The PCEX API is used to provide aggregated climatological or hydrological data about a selected area. 
* The SCIP API isused to provide information on the location and status of salmon populations, and other areas users might be interested in (watersheds)
* Tilesever provides map backgrounds (city names, roads, rivers etc) for the map
* ncWMS provides colour-coded data overlays for the maps

## How to run SCIP for development using pre-existing PCIC docker instances

Clone the repository and install dependencies with `npm install`. Edit
`public/config.js` to point at the data services you want to use. This is the
same configuration file Docker Compose mounts; service URLs are not read from
shell variables or `.env` files.

Start the frontend with:

```bash
npm start
```

Open http://localhost:3000/. After editing `public/config.js`, refresh the browser
to load the updated settings. Some PCIC services require access to the PCIC VPN.

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

Install dependencies with `npm install`, then edit `public/config.js`. Set
`REACT_APP_SCIP_API_URL` to `http://127.0.0.1:8000/api` for your local SCIP API
and configure the other service URLs in that same file.

Start the frontend with `npm start` and open http://localhost:3000/.

## How to run SCIP in production-style dockers on your workstation

### Setting up the frontend

The Dockerfile uses two stages. The `build` stage installs dependencies and
compiles the React app. The `runtime` stage uses unprivileged Nginx on Alpine
to serve the compiled files on port 3000 with SPA routing. Node and npm are
only needed in the build stage. Containers start without compiling the app.

Build the image from the repository root:

```bash
docker build -t scip -f docker/Dockerfile .
```

Set deployment URLs in `public/config.js`. Compose bind-mounts that file
read-only at `/usr/share/nginx/html/config.js`; Nginx serves it at `/config.js`
with `Cache-Control: no-store`. The browser loads it before the React bundle.
Configuration is supplied when the container is created, so the same image can
run in different environments without recompiling or generating files at startup.

**Public settings only:** Anyone who can access the app can download the entire
`config.js` file, including settings the app does not use. Never put passwords,
private API keys, tokens, or URLs containing credentials in it. A read-only mount
prevents writes; it does not hide the contents. Keep secrets in backend services.

For standalone containers, run from the repository root:

```bash
docker run --rm -p 3000:3000 \
  --mount type=bind,src="$(pwd)/public/config.js",dst=/usr/share/nginx/html/config.js,readonly \
  scip
```

Supported settings in `window.__SCIP_CONFIG__` are `REACT_APP_PCEX_API_URL`,
`REACT_APP_SCIP_API_URL`, `REACT_APP_NCWMS_URL`,
`REACT_APP_BC_BASE_MAP_TILES_URL`, `REACT_APP_EEZ_GEOJSON_URL`,
`REACT_APP_BASE_MAP`, `PUBLIC_URL`, and `REACT_APP_VERSION`.
`PUBLIC_URL` controls public data/help links; bundle and HTML asset paths stay
relative, as specified by `homepage` in `package.json`.

To select a different config file at Compose startup, set `SCIP_CONFIG_FILE`:

```bash
SCIP_CONFIG_FILE=/absolute/path/to/config.js \
  docker compose -f docker/docker-compose.yaml up -d
```

The file must already exist. After editing or replacing it, recreate the
frontend container and refresh the browser:

```bash
docker compose -f docker/docker-compose.yaml up -d --force-recreate frontend
```

Local `npm start` and Docker Compose both use `public/config.js`. The app reads
service URLs from `window.__SCIP_CONFIG__`, without environment-variable
fallbacks. For Docker deployments, `SCIP_CONFIG_FILE` can select another file.
Version metadata can still be baked in with `--build-arg REACT_APP_VERSION=...`;
`REACT_APP_VERSION` in the config file takes precedence over that metadata.

### Starting the frontend

After building the `scip` docker image, you should be able to run the
`docker-compose.yaml` setup included in the repository, which starts the SCIP
frontend. Its Nginx server serves the app directly on port 3000.

```bash
docker compose -f docker/docker-compose.yaml up -d
```

Once the container starts, access the frontend at:

http://localhost:3000/
