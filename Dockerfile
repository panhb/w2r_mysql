# Dockerfile to create a docker image
# Base image
FROM node

# Add files to the image
RUN mkdir -p /opt/nodejs
ADD . /opt/nodejs
WORKDIR /opt/nodejs

# Install the dependencies modules
RUN npm install

# Expose environment variables
# MYSQL
ENV MYSQL_HOST **ChangeMe**
ENV MYSQL_PORT **ChangeMe**
ENV MYSQL_DATABASE **ChangeMe**
ENV MYSQL_USER **ChangeMe**
ENV MYSQL_PASSWORD **ChangeMe**
ENV MYSQL_CONNECTIONLIMIT **ChangeMe** 
# REDIS
ENV REDIS_HOST **ChangeMe**
ENV REDIS_PORT **ChangeMe**
ENV REDIS_PASSWORD **ChangeMe**
 
# Expose the container port
EXPOSE 3000

ENTRYPOINT ["node", "app.js"]