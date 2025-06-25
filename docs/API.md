# MyRoofGenius API Documentation

## Authentication

All API endpoints (except public health checks) require a Supabase JWT for authentication. Include the user’s access token in the `Authorization` header:

```
Authorization: Bearer <YOUR_SUPABASE_JWT>
```

## Endpoints

### User Registration & Authentication
*(Handled via Supabase Auth - use Supabase client libraries to sign up and log in.)*

### AI Roof Analysis

**POST** `/api/ai/analyze-roof`

Analyzes a roof image using AI (GPT-4 Vision) to estimate dimensions, materials, condition, and more.

- **Request:** `multipart/form-data` with fields:
  - `file` (File, required): A roof image (JPEG/PNG) to analyze.
  - `address` (string, optional): Property address (for context like local climate).
  - `analysis_type` (string, optional): One of `full` (default), `damage`, or `measurement` to focus the analysis.

- **Response:** JSON object with analysis results:
```json
{
  "square_feet": 2000,
  "pitch": "6/12",
  "material": "asphalt shingle",
  "condition": "good",
  "damage_areas": [
    {
      "type": "missing shingles",
      "severity": "moderate",
      "location": "northwest corner",
      "area_sqft": 50
    }
  ],
  "recommendations": [
    "Replace missing shingles in northwest corner",
    "Schedule full roof inspection within 6 months"
  ],
  "estimated_remaining_life": 15,
  "repair_cost_estimate": [5000, 8000],
  "replacement_cost_estimate": [15000, 20000],
  "confidence_scores": {
    "area_measurement": 0.85,
    "material_identification": 0.92,
    "damage_assessment": 0.88
  }
}
```
If analysis fails, responds with `{ "error": "analysis failed" }` (HTTP 500).

### AI Copilot Assistant

**POST** `/api/copilot`

Chat with the AI assistant for roofing-related questions. Supports conversational context.

- **Request Body:**
```json
{
  "message": "How do I determine the pitch of an existing roof?",
  "session_id": "optional-session-uuid",
  "user_role": "field"
}
```

- **Response:** Streamed text content with header `X-Session-Id` set to the conversation ID.

### Digital Product Purchase & Delivery

**POST** `/api/checkout`

Initiates a Stripe Checkout for purchasing a product.

Request body:
```json
{ "price_id": "<stripe_price_id>", "domain": "https://myroofgenius.com" }
```

Returns Stripe session details to redirect the user.

**POST** `/api/webhook`

Stripe webhook endpoint that finalizes an order, generates download links and sends confirmation email.

**GET** `/api/order/{session_id}`

Retrieve download links for a completed order.

**GET** `/api/download/{token}`

Download a purchased file using a secure one-time token.

### Analytics Tracking

**POST** `/api/analytics/track`

Tracks user actions for analytics.

### Error Responses

Errors include a JSON message and HTTP status codes, e.g.:
```json
{ "error": "Invalid request data", "code": "BAD_REQUEST" }
```

### Rate Limiting

- AI endpoints: 10 requests per minute.
- Download endpoints: 100 requests per hour.
- General API: 1000 requests per hour.

Exceeding limits returns HTTP 429.
