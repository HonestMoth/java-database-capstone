# Smart Clinic Management System v3

## Database configuration
The application connects to MySQL database `cms` and MongoDB database `prescriptions`.

Set the MySQL root password before starting Spring Boot. In PowerShell:

```powershell
$env:MYSQL_PASSWORD = "YOUR_ACTUAL_MYSQL_ROOT_PASSWORD"
mvn spring-boot:run
```

Or replace the `YOUR_MYSQL_PASSWORD` fallback in `src/main/resources/application.properties` with the actual password.

The seeded admin account is:
- Username: `admin`
- Password: `admin@1234`

If Admin Login reports `Database unavailable`, the admin credentials are not the problem; verify that MySQL is running, database `cms` exists, and the configured MySQL password is correct.

## Run
```powershell
mvn clean test
mvn spring-boot:run
```

Open `http://localhost:8080`.
