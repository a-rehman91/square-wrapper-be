# Square Wrapper Backend

TypeScript + Express API proxy for Square Locations and Catalog endpoints.

## Requirements

- Node.js 20+
- npm
- A valid Square access token

## Environment

Use `.env` and set values:

- `SQUARE_ACCESS_TOKEN`
- `SQUARE_ENVIRONMENT` (`sandbox` or `production`)
- `PORT` (default `4000`)
- `CACHE_TTL_SECONDS` (default `120`)

## Run

```bash
npm install
npm run dev
```

## Build and Start

```bash
npm run build
npm run start
```

## Docker

Build and run backend container:

```bash
docker build -t square-wrapper-be .
docker run --rm --env-file .env -p 4000:4000 square-wrapper-be
```

## API Endpoints

- `GET /api/locations`
- `GET /api/catalog?location_id=<LOCATION_ID>`
- `GET /api/catalog/categories?location_id=<LOCATION_ID>`

## Testing

- Unit tests: error mapping
- Integration tests: API routes with mocked service layer

```bash
npm test
```
