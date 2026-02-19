# Square Wrapper Backend

TypeScript + Express API proxy for Square Locations and Catalog endpoints.

## Requirements

- Node.js 20+
- npm
- A valid Square access token

## Environment

Copy `.env.example` to `.env` and set values:

- `SQUARE_ACCESS_TOKEN`
- `SQUARE_ENVIRONMENT` (`sandbox` or `production`)
- `PORT` (default `4000`)
- `CACHE_TTL_SECONDS` (default `120`)

## Secrets Handling

- Keep `SQUARE_ACCESS_TOKEN` only in backend `.env` (never in frontend).
- Do not commit `.env`; only commit `.env.example`.
- Backend sends the token to Square via `Authorization: Bearer <token>`.
- If token is missing, API returns a clean `CONFIG_ERROR` response.

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
