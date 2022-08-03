# Vehicle Registration API



![carSHAiR Logo](https://www.carshair.com/_next/image?url=%2F_next%2Fstatic%2Fmedia%2FCarSHAiR-Logo.bfa0a90d.png&w=3840&q=75)


## Description

  A Node Typescript project using Mongo and Express.  This project provides a thin node app to execute CRUD operations on a car (vehicle) model.

### Background

This project was an assessment for carSHAiR.  The product requirements were provided in the parent repository (the repository this one is forked from), and are summarized in the following UI sketch.  The task was to create a backend for a frontend that might look like this:

[List a car UI sketch](https://xd.adobe.com/view/fed5ede8-2626-46ec-a3f9-ec0cba0df6f4-ab86/)

Creating a user account model and associated logic was out of the scope for this assessment.

### Database Design Remarks

While carSHAiR utilizes a relational database, I have used MongoDB, as this is the database I am more comfortable with to churn out a project quickly.  One of the aspects of a document noSQL database such as Mongo is that records are often highly de-normalized.  It is very common to group related data together under a single model.

If we had user accounts, in my opinion this would certainly warrant a new model, but the extent of normalization is not nearly as extensive as is best practice in RDBMS's (SQL databases).

### Task Tracking Remarks

I used Github issues to track tasks related to this project and pull requests to merge feature branches to the master branch.

### Getting Started

  This project requires **docker** and **nvm**.
  **nvm** is Node Version Manager, a light-weight version manager for handling different node and npm versions across projects.  nvm can be installed by following [these instructions](https://github.com/nvm-sh/nvm#installing-and-updating).

#### Running Locally

```
# To set the node and npm version
nvm install v16.16
nvm use

# To launch the database in detached mode
docker compose up -d
# Depending on your version of docker, you may need to use the syntax `docker-compose up -d` with a `-` character

# To install the node modules
npm ci

# To run the development server locally
npm run dev

# To run the test suite
npm run test

# To take down the database once finished with the project, assuming the root folder is named `vehicle-registration-api`
docker stop vehicle-registration-api-mongo-1
docker rm vehicle-registration-api-mongo-1
```

### Further Steps Given More Time

Given more time I would:
- Proceed to setup Github Actions or a CircleCI script to run the test suite before allowing merging a PR.
- Setup a Keycloak docker container with the docker-compose.yml script to mimic a production Keycloak server, and add role based auth[n/z] to the project.
- Add unit tests
- Add further integration tests
- Finish the creation of a Swagger Spec (Open API) served at a local URL to inspect the API usage requirements.

Thank you for your time