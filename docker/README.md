License API – Docker Setup
This project is a NestJS-based License API. The application is containerized using Docker and can be easily built and run locally or in a deployment environment.

 Dockerfile Overview
The Dockerfile is located at idms/docker/Dockerfile and does the following:

Uses node:18-alpine as the base image
Installs PostgreSQL client (if needed by your app)
Sets working directory to /app
Installs Node.js dependencies
Copies source code
Builds the app using npm run build
Exposes port 4000
Starts the app using npm run start:prod
 How to Build and Run the App
Step 1: Navigate to the docker/ folder
cd idms/docker
docker build -t license-api .
docker run -p 4000:4000 license-api
The app will be available at:
http://localhost:4000


Command	Description
npm install	Installs dependencies
npm run build	Builds the NestJS project
npm run start:prod	Starts the app in prod mode


Docker Compose Overview (Services & Workflow)
This docker-compose.yml defines a two-service application: a PostgreSQL database and a Node.js API.


 API Application Service (app)
Image: Uses a custom-built image named api:latest.

Build Context:

Builds from Dockerfile located at docker/Dockerfile with root context as ...

Container Name: Named api.

Restart Policy: Always restarts on failure or container stop.

Ports:

Exposes port 4000 on the host.

Dependencies:

Waits for the postgres service to become healthy before starting.

Environment:

Loads environment variables from .env.

 Volumes
pgdata:

Named volume used by the postgres container to persist database data across restarts.
