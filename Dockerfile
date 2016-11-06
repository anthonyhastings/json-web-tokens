FROM mhart/alpine-node:4.5.0
MAINTAINER Anthony Hastings <ar.hastings@gmail.com>

# Installing bash.
RUN apk add --no-cache bash bash-doc bash-completion

# Create a directory (to house our source files) and navigate to it.
WORKDIR /src

# Copy over the package.json file to the containers working directory.
COPY ./src/package.json /src/package.json

# Install our desired node packages.
RUN npm install

# Copy everything in the host folder into the working folder of the container.
COPY ./src/ /src/

# Expose the specified port back to the host machine.
EXPOSE 8080

# Run the API server.
CMD ["npm", "start"]
