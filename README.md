# AI Psychological Demo

This is an AI-based psychological counseling application designed to provide mental health support for children and parents. The project is divided into three main parts: frontend, backend, and database.

## Tech Stack

- **Frontend**: React, TypeScript, Vite
- **Backend**: Node.js, Express, TypeScript, Prisma
- **Database**: PostgreSQL

## Prerequisites

Before you begin, ensure you have the following software installed in your development environment:

- [Node.js](https://nodejs.org/) (v18 or higher is recommended)
- [Docker](https://www.docker.com/products/docker-desktop/) and Docker Compose

## Configuration

Before starting the backend service, you need to create a `.env` file in the `mcp-service` directory. This file will contain the necessary environment variables.

1.  Navigate to the backend directory:
    ```bash
    cd mcp-service
    ```

2.  Create a `.env` file by copying the example:
    ```bash
    # You can create the file directly if you don't have an example file
    # For example, on Linux/macOS:
    touch .env
    ```

3.  Open the `.env` file and add the following content. This URL connects to the PostgreSQL database running in the Docker container.

    ```env
    DATABASE_URL="postgresql://user:pass@localhost:5432/postgres?schema=public"
    GEMINI_API_KEY="xxxxxxx"
    ```

## Getting Started

Follow these steps to set up and run the entire project.

### 1. Start the Database

The project uses a PostgreSQL database, which runs in a Docker container.

Run the following command in the project root directory to start the database service:

```bash
docker-compose up -d
```

This command will start a PostgreSQL container in detached mode. You can find the database configuration in the `docker-compose.yml` file.

### 2. Start the Backend Service (mcp-service)

The backend service is responsible for handling business logic and data interaction.

```bash
# Navigate to the backend project directory
cd mcp-service

# Install dependencies
npm install

# Start the development server
npm run dev
```

Once the service starts, it will listen for requests on `http://localhost:3000` by default.

### 3. Start the Frontend Application (front-end)

The frontend is the user-facing interface.

```bash
# (From the project root) Navigate to the frontend project directory
cd front-end

# Install dependencies
npm install

# Start the development server
npm run dev
```

After the frontend application starts, you can access it in your browser at `http://localhost:5173` (or another port as indicated by Vite).

## Stopping the Services

- **To stop the database container**:
  ```bash
  docker-compose down
  ```

- **To stop the frontend or backend service**:
  Press `Ctrl + C` in the corresponding terminal window.
