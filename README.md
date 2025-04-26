# Express.js Backend Boilerplate with HTTPS

This is a boilerplate for a Node.js Express backend with HTTPS support using Docker, Nginx, and Certbot.

## Features

- Express.js REST API
- HTTPS support with automatic certificate renewal
- Docker containerization
- Nginx as reverse proxy
- Middleware for authentication and error handling
- Environment-based configuration

## Prerequisites

- Docker and Docker Compose
- Node.js (for local development)
- A domain name pointing to your server

## Setup

### Local Development

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file from the template:
   ```
   cp .env.example .env
   ```
4. Start the development server:
   ```
   npm run dev
   ```

### Production Deployment

1. Update the Nginx configuration in `nginx/conf/app.conf` to include your domain name (replace `example.com` with your domain).

2. Create required directories for SSL certificates:
   ```
   mkdir -p nginx/certbot/conf nginx/certbot/www
   ```

3. Setup initial certificates (replace `your@email.com` and `example.com`):
   ```
   docker-compose run --rm certbot certonly --webroot -w /var/www/certbot -d example.com -d www.example.com --email your@email.com --agree-tos --no-eff-email --staging
   ```

4. After verifying it works with the staging environment, get a real certificate:
   ```
   docker-compose run --rm certbot certonly --webroot -w /var/www/certbot -d example.com -d www.example.com --email your@email.com --agree-tos --no-eff-email --force-renewal
   ```

5. Start the application:
   ```
   docker-compose up -d
   ```

## API Documentation

The API is available at `/api`. The following endpoints are available:

- `GET /api`: Get API information
- `GET /api/example`: Get all examples
- `GET /api/example/:id`: Get example by ID
- `POST /api/example`: Create new example
- `PUT /api/example/:id`: Update example
- `DELETE /api/example/:id`: Delete example

## HTTPS Configuration

The application uses Nginx as a reverse proxy to handle HTTPS traffic. SSL certificates are automatically generated and renewed using Certbot.

## License

MIT