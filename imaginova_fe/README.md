# Imaginova Frontend

## Description

This application manages the frontend of Imaginova using Angular. It allows users to interact with the backend, view creative challenges, and submit their own creations.

## Requirements

- **Node.js** v16.x or above
- **Angular** v18.x or above
- **Docker** (optional, if you want to use the app running on a container)

## Setup and Run

Assure you have all packages installed:
```bash
npm install
```
### Environment depending on local or container usage
If you are using the application on your local system or on a container make sure to set the config (imaginova_fe\src\app\config\config.ts) as it follows
```bash 
export const config = {
    apiUrl: '/api', // 'http://localhost:3000' for local o '/api' for docker
  };
  
```
## Local running
In order to run the application locally, execute the following command:
```bash 
npm start
```
The application will be accessible on http://localhost:4200.

## Docker running
Make sure you are on the main folder Imaginova and execute the following command:
```bash 
docker-compose up --build
```
The application will be accessible on http://localhost:4200.
### Author
#### Name: Emilia Napolano
#### Email: emilia.napolano@outlook.it
#### GitHub: [My Profile](https://github.com/Cahuaee01)