# Docker setup — Smart Clinic Management System

## 1. Build the backend image

Run these commands from the project root (the folder containing `pom.xml` and `Dockerfile`):

```powershell
docker build -t smart-clinic-backend .
```

## 2. Run the container

### Lab environment

If the lab provides MySQL and MongoDB in a network reachable by the container, use the lab's supplied database hostnames/connection values. The basic lab command is:

```powershell
docker run -d -p 8080:8080 --name smart-clinic smart-clinic-backend
```

### Windows + Docker Desktop with databases running on the host

The application cannot use `localhost` from inside a container to reach Windows MySQL/MongoDB. Use `host.docker.internal` instead:

```powershell
docker run -d -p 8080:8080 --name smart-clinic `
  -e SPRING_DATASOURCE_URL="jdbc:mysql://host.docker.internal:3306/cms?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true" `
  -e SPRING_DATASOURCE_USERNAME="root" `
  -e SPRING_DATASOURCE_PASSWORD="YOUR_MYSQL_ROOT_PASSWORD" `
  -e SPRING_DATA_MONGODB_URI="mongodb://host.docker.internal:27017/prescriptions" `
  smart-clinic-backend
```

Do not put your real database password into source control or this documentation.

## 3. Open the application

Open:

`http://localhost:8080`

## 4. Check the container

```powershell
docker ps
docker logs smart-clinic
```

The logs should eventually show Spring Boot started on port 8080.

## 5. Stop and remove

```powershell
docker stop smart-clinic
docker rm smart-clinic
```

To remove the image:

```powershell
docker rmi smart-clinic-backend
```

## 6. Compose (recommended for local host databases)

Set the MySQL password for the current PowerShell session:

```powershell
$env:MYSQL_PASSWORD="YOUR_MYSQL_ROOT_PASSWORD"
```

Then:

```powershell
docker compose up --build -d
docker compose logs -f app
```

Stop it with:

```powershell
docker compose down
```

This compose file intentionally uses your existing host MySQL/MongoDB so it does not create a second empty `cms` database and lose the clinic seed data.

## 7. Docker Hub (optional)

```powershell
docker tag smart-clinic-backend YOUR_DOCKER_USERNAME/smart-clinic-backend:latest
docker login
docker push YOUR_DOCKER_USERNAME/smart-clinic-backend:latest
```
