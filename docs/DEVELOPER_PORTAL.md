# Developer Portal

The developer portal allows partners to generate API keys and integrate with
MyRoofGenius programmatically. Each key is tied to a user account and can be
managed via the `/api/developer/apikeys` endpoints.

## Endpoints

- `POST /api/developer/apikeys` – create a new API key (requires `x-user-id`
  header).
- `GET /api/developer/apikeys?user_id=...` – list existing keys for a user.

## Usage

```
curl -X POST /api/developer/apikeys -H "x-user-id: USER123"
```

The response will contain the newly generated key. Store it securely as it will
be required for authenticated partner API requests.

