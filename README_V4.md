# Smart Clinic Management System — v4

## Start without editing application.properties
From this project folder in PowerShell:

    .\START-CLINIC.ps1

The script prompts for the MySQL root password and passes it as `MYSQL_PASSWORD` to Spring Boot. It does not save the password in the project.

Admin portal:
- Username: `admin`
- Password: `admin@1234`

MongoDB must be running on `localhost:27017` and the MySQL database `cms` must exist with the seeded tables/data.

If the browser still shows an older neon page, close the old Spring Boot process and start this project, then use Ctrl+Shift+R.


## Important: MySQL password
Use START-CLINIC.bat or START-CLINIC.ps1 so Spring Boot receives the MySQL root password. Do not use the clinic admin password unless it is also your MySQL root password.

## Frontend authentication
The homepage explicitly loads js/services/index.js so the Admin and Doctor login handlers are initialized before the modal forms are submitted. Successful login redirects directly to the authenticated dashboard URL.
