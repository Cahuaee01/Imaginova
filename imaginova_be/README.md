# Imaginova Backend

## Description

This application manages the backend of Imaginova. It allows Chat GPT 4o mini to generate creative challanges for users, collect user creations and display them for the community.

## Requirements

- **Node.js** v16.x or above
- **Docker** (optional, if you want to use the app running on a container)

## Setup and Run

Assure you have all packages installed:
```bash
npm install
```
### Environment depending on local or container usage
If you are using the application on your local system make sure to set
```bash 
CHALLENGE_UPLOAD_TIME: 13
PORT: 3000
```
Otherwise if you are using Docker make sure to set
```bash 
CHALLENGE_UPLOAD_TIME: 11
PORT: 5000
```
## Local running
In order to run the application locally, execute the following command:
```bash 
npm start
```
The application will be accessible on http://localhost:3000.

## Docker running
Make sure you are on the main folder Imaginova and execute the following commands:
```bash 
docker-compose up --build
```
The application will be accessible on http://localhost:5000.
### Author
#### Name: Emilia Napolano
#### Email: emilia.napolano@outlook.it
#### GitHub: [My Profile](https://github.com/Cahuaee01)