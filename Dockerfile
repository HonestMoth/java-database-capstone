# Step 1: Build the Spring Boot application with Maven + JDK 17
FROM maven:3.9.9-eclipse-temurin-17 AS builder

WORKDIR /app

COPY pom.xml .
COPY src ./src

RUN mvn clean package -DskipTests

# Step 2: Run only the compiled application on a lightweight JRE 17 image
FROM eclipse-temurin:17.0.15_6-jre

WORKDIR /app

COPY --from=builder /app/target/back-end-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
