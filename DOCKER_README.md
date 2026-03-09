# Docker Development Guide: Montgomery Safety Lens

This guide explains how to run the Montgomery Safety Lens dashboard using Docker for a seamless development experience with hot-reloading.

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.
- A `.env.local` file in the root directory with your API keys (see `.env.example`).

## Quick Start

1. **Build and start the container:**
   ```bash
   docker compose up --build -d
   ```

2. **Access the application:**
   The app is mapped to host port **8080**. Open your browser to:
   **[http://localhost:8080](http://localhost:8080)**

3. **View logs:**
   ```bash
   docker compose logs -f
   ```

4. **Stop the container:**
   ```bash
   docker compose down
   ```

## Continuous Development (Hot Reloading)

The setup is configured for **Live Development**. You do not need to rebuild the container when you change your code.

- **Frontend:** Vite handles Hot Module Replacement (HMR) for UI changes.
- **Backend:** The container runs `tsx watch server.ts`, which automatically restarts the Express server when backend files are modified.

## The "Node Modules Trick"

In the `docker-compose.yml` file, you will notice two volume mappings:

```yaml
volumes:
  - .:/app
  - /app/node_modules
```

### Why is this necessary?

1. **`.:/app`**: This maps your entire local project directory into the container. This is what allows you to edit code on your host machine and see the changes instantly inside the container.
2. **`/app/node_modules` (The Anonymous Volume)**: This is a critical "trick" for Node.js development in Docker.
   - **The Problem:** When you map `.:/app`, Docker tries to make the container's `/app` folder identical to your local folder. If you have a `node_modules` folder on your Windows host, it will overwrite the one inside the container. This is bad because the `node_modules` compiled for Windows won't work inside the Linux-based Docker container (especially for native modules like `better-sqlite3`).
   - **The Solution:** By adding the second, more specific path `/app/node_modules` as a volume without a host mapping, Docker creates a dedicated space for the container's own `node_modules`. Because it is more specific than `/app`, it "hides" your local `node_modules` from the container, ensuring the app uses the correct Linux-compatible dependencies installed during the Docker build process.

## Troubleshooting

### Windows/WSL File Watching
If changes aren't reflecting, ensure `CHOKIDAR_USEPOLLING=true` is set in the `environment` section of `docker-compose.yml`. This forces the file watcher to check for changes manually, which is more reliable across Windows file system boundaries.

### Permission Errors
If you encounter socket binding errors (e.g., "access forbidden"), it usually means the port (8080, 3000, etc.) is being used by another process or restricted by your system. You can change the host port in `docker-compose.yml`:

```yaml
ports:
  - "NEW_PORT:3000"
```
