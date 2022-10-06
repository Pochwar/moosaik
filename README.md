# 🦌 Moosaik 🦌

Moosaik is a project about creating mosaics with images get from Twitter.

## Requirements

- Git
- ~~NodeJs & NPM~~
- ~~Metapixel~~
- ~~MongoDB~~
- Docker & Docker Compose
- Twitter account

## How it works

### GIFTUH
GIFTUH is a script I made to get images from tweets using a specific keyword. A basic standalone version is available [here](https://github.com/Pochwar/giftuh). I adapt the original code for this program.

### Metapixel

Metapixel is a bash program made by Mark Probst that is used to generate mosaics from an original file using all the images recovered with GIFTUH. More informations [here](https://github.com/schani/metapixel)

⚠ Metapixel does not work well on Ubuntu 18, use preferably Ubuntu 16 ⚠ 

For this reason, I choose to Dockerize the application. I created an `app` service that use Ubuntu 16 and includes Metapixel. This is defined in the Dockerfile.

### Moosaik

Moosaik works by 'projects' you can create and that will be stored in the database. Each project is defined by a name, a summary, an original picture and a keyword.

Using GIFTUH and Metapixel, Moosaik will run and generate a mosaic for the most recent project in DB.

## Installation

- clone repository `git@github.com:Pochwar/moosaik.git`
- install dependencies `npm i`
- create '.env' file from '.env.example' `cp .env.example .env`
- set configuration in '.env' file, at least your Twitter's credentials. But you can also modify default values for App password for creating projects, Mongo credentials, and some other options...

## Usage

- Start up containers with `docker-compose up` (or `docker-compose up -d` for detached mode)
- You can access to Mongo admin at `http://localhost:8081`
- In another shell (unless you use detached mode) use `docker-compose exec app npm run start` to launch the server.
- Go to `http://localhost:2440` to view the default project
- Go to `http://localhost:2440/create` to create a new project

Depending on `RUN_GIFTUH` and `RUN_METAPIXEL` options in `.env` file, Giftuh and Metapixel processes will trigger (or not) to find images from Tweets and assemble them into a wonderful "moosaik" :D

Info : Metapixel won't trigger before there are at least 50 images recovered from twitter.

When you create a new project from admin, it will automatically switch to this one. But if you change Metapixel and Giftuh options from `.env` file, you should stop and restart app by closing "docker-compose exec" instance and relaunch command.

## Heroku Deployment

UPDATE : The app is no longer on Heroku, I deployed it here instead : https://moosaik.pochworld.com/

However, I leave the deployment procedure to those who would be interested:

To deploy on Heroku:

- Add "Apt" buildpack to install Metapixel: `heroku buildpacks:add --index 1 heroku-community/apt -a {your-app-name}`. Then, Metapixel will be automatically installed as it's referenced in the 'Aptfile'

- Metapixel have some issues on Ubuntu 18, so it's preferable to set Heroku stack on Ubuntu 16: `heroku stack:set ubuntu-16 -a {your-app-name}`

Heroku logs are available with this command: `heroku logs --tail -a {your-app-name}`


## TODO
- Use Giftuh from NPM package (blocked by making Giftuh a NPM package ^^')
OR
- Update Twitter package and check potential issues with path when downloading files (use ${__dirname})

- prevent Mtpx to run if already running

- Refacto with TypeScript
- Make a beautiful front with Vue (or Svelte? or Qwik?)

- Decouple server / Metapixel / Giftuh
