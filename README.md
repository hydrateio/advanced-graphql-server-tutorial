# Advanced GraphQL Server Tutorial

## Overview
In today's world of multiple legacy data sources and APIs living within a single organization, migrating away from those legacy systems can be a challenge.
Adding a GraphQL server to your company technology stack is an excellent way to provide a migration path forward by replacing multiple API endpoints with
a single endpoint that efficiently proxies data requests to legacy endpoints while allowing your organizational data APIs to grow and change with your
organization.

This project demonstrates how to implement advanced data resolution techniques from multiple data sources when writing a GraphQL server.

This project will implement a new GraphQL API for a hypothetical library system. The data sources will include a transactional check-in/check-out database
running in MySQL along with a NoSQL data source containing various entity details running in MongoDB.

## Prerequisites

This project is a [Node.js](https://nodejs.org/en/) project, so you will also need to have node installed. I recommend using
[nvm](https://github.com/creationix/nvm) or [nvm-windows](https://github.com/coreybutler/nvm-windows) to install and manage your Node.js installation.
This project is supported on Node.js version 10 and later.

Data sources are provided in this project via Docker containers. You will need to install [Docker](https://www.docker.com)
from [https://www.docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop).

There are three npm scripts to help with management of the data sources.

```
// Start the MySQL and MongoDB docker containers and initialize data if starting for the first time
npm run data-start

// Stop the MySQL and MongoDB docker containers
npm run data-stop

// Stop the MySQL and MongoDB docker containers and remove all data (data will be re-initialized on next start)
npm run data-reset
```

Database data is stored locally and will persist through docker compose restarts.

### Helpful tools
For one of the exercises, we will be running queries directly against the MongoDB database. This can be done via the `mongo` command line if connected to the
MongoDB container, but you may find a graphical tool to be easier to use. 

For MongoDB GUI, I use [Robo 3T](https://robomongo.org/) available from [https://robomongo.org/](https://robomongo.org/)

## Starting the server

This project includes three NPM scripts to work with your server.
```
npm run build
```
- Uses babel to transpile the source to Node 10 compatible code


```
npm run start
```
- Starts the built server from the dist directory as a single node process
- This requires that the server had been previously built


```
npm run watch
```
- Starts the server from source with nodemon and automatically restarts the server when any src file changes


### Debugging
At some points in the lessons, it will be useful to inspect various arguments and variables in the project. A debug NPM script has been created to start a
remote inspector allowing breakpoints to be added to the code. You can start the remote inspector by running the following script

```
npm run debug
```

If you are using [Visual Studio Code](https://code.visualstudio.com/) for development, the project also includes an `Attach to debugger` launch script that 
will allow you to add breakpoints directly in your code editor.

To use, run the `npm run debug` script and then launch "Attach to debugger" via Visual Studio Code debug feature.

## Project structure

This project uses [babel](https://babeljs.io/) to allow for ES6 module syntax usage.

This project uses [apollo-server-express](https://www.npmjs.com/package/apollo-server-express) to provide convenient implementation of the GraphQL server spec
and to easily add a [GraphQL Playground](https://github.com/prisma/graphql-playground) client for development purposes.
