# Docker Setup Instructions

## Prerequisites

1. Docker and Docker Compose installed
2. Firebase service account key

## Firebase Configuration

The backend requires Firebase credentials. You have two options:

### Option 1: Environment Variable (Recommended for Docker)

1. Get your Firebase service account key JSON file
2. Encode it to base64:
   ```bash
   cat backend/serviceAccountKey.json | base64 -w 0
   ```
3. Create a `.env` file in the project root:
   ```env
   FIREBASE_KEY_BASE64=<your_base64_encoded_key>
   ```
4. Update `docker-compose.yml` to uncomment the `FIREBASE_KEY_BASE64` line in the backend environment section
5. Comment out or remove the volume mount for `serviceAccountKey.json`

### Option 2: File Mount

1. Ensure `backend/serviceAccountKey.json` exists and contains valid JSON
2. The docker-compose.yml will automatically mount it

**Note:** If the file is empty or invalid, the container will fail to start.

## Building and Running

```bash
# Build and start containers
docker-compose up -d

# View logs
docker-compose logs -f backend

# Stop containers
docker-compose down

# Rebuild after changes
docker-compose up -d --build
```

## Troubleshooting

### Backend container fails with "Unexpected end of JSON input"

- The `serviceAccountKey.json` file is empty or invalid
- Solution: Either add a valid JSON file OR use the `FIREBASE_KEY_BASE64` environment variable

### Backend container fails with "serviceAccountKey.json file not found"

- The file doesn't exist
- Solution: Add the file or use the environment variable method

