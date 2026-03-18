# Étape 1 : build avec Maven
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Étape 2 : image légère pour l'exécution
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/target/backend-1.0.0.jar app.jar

# /home est persistant sur Azure App Service Linux
VOLUME /home

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
