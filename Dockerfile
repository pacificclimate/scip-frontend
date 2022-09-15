
# This Dockerfile adapted from https://mherman.org/blog/dockerizing-a-react-app/
# and Climate Explorer Dockerfile.

# This Dockerfile can (and should) be used to pass through automatically generated
# version information to the build which is triggered when the image is run.
# To do this, issue the following build command:
#
# docker build --build-arg REACT_APP_VERSION="$(./generate-commitish.sh)" -t <tag> .

# At this moment, Node.js 10.16 LTS is recommended for most users.
#
# In future, as we scale up, we may want to use an Alpine base image, which would reduce
# the size of the image by about an order of magnitude and reduce the attack surface of
# the image as well.

FROM node:16

ADD . /app
WORKDIR /app
RUN chown node /app

ENV PATH /app/node_modules/.bin:$PATH
COPY --chown=node:node  package.json /app/package.json

RUN npm install
RUN npm install -g serve
COPY --chown=node:node . /app

EXPOSE 3000

# Move the build arg REACT_APP_VERSION into an
# environment variable of the same name, for consumption
# by the npm build process in ./entrypoint.sh
ARG REACT_APP_VERSION
ENV REACT_APP_VERSION $REACT_APP_VERSION

USER node
ENTRYPOINT docker/entrypoint.sh