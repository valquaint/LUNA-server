# Server Setup

## installation
Please be sure to install the server with `npm i`

## Setup

LUNA requires a postgresql server running to store data. It will automatically create it's required tables for you when it runs, or when it detects the tables are not the expected versions.
After first setup, it will self-correct each load.

The following environment variables are required, set through a `.env` file:

```
DB_USER - string
DB_PASSWORD - string
DB_HOST - string
DB_PORT - number
DB_DATABASE - string
DB_VERSION - version string
APP_VERSION - version string
PWD_HASH_COUNT= number
JWT_KEY - string
```


## Technologies

## Database Models

## Public Endpoints