
# This Dockerfile adapted from https://mherman.org/blog/dockerizing-a-react-app/
# and Climate Explorer Dockerfile.

# This Dockerfile can (and should) be used to pass through automatically generated
# version information to the build which is triggered when the image is run.
# To do this, issue the following build command:
#
# docker build --build-arg REACT_APP_VERSION="$(./generate-commitish.sh)" -t <tag> .

# Node.js 24 and npm 12 are required by this project.
#
# In future, as we scale up, we may want to use an Alpine base image, which would reduce
# the size of the image by about an order of magnitude and reduce the attack surface of
# the image as well.

FROM node:24-bookworm-slim

ADD . /app
WORKDIR /app
RUN chown node /app

ENV PATH /app/node_modules/.bin:$PATH
COPY --chown=node:node  package.json /app/package.json

RUN npm install --global npm@12 && \
    test "$(node --version | cut -d. -f1 | tr -d v)" = "24" && \
    test "$(npm --version | cut -d. -f1)" = "12" && \
    npm install --global serve
COPY --chown=node:node . /app

EXPOSE 3000

# Move the build arg REACT_APP_VERSION into an
# environment variable of the same name, for consumption
# by the npm build process in ./entrypoint.sh
ARG REACT_APP_VERSION
ENV REACT_APP_VERSION $REACT_APP_VERSION

USER node
RUN npm ci
ENTRYPOINT docker/entrypoint.sh
