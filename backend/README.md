# post-ops worker

Cloudflare Worker that stores like/dislike/comment events in Google Sheets and
serves aggregate counts per post.

## Endpoints

- `POST /{postId}/like`
- `POST /{postId}/dislike`
- `POST /{postId}/comment`
- `POST /{postId}/comment/{commentId}/like`
- `POST /{postId}/comment/{commentId}/dislike`
- `GET /{postId}`
- `GET /{postId}/comment`
- `POST /view`
- `POST /event`
- `POST /contact`

`POST /view` is a shortcut for an event with `type: "view"` and `name: "pageview"`.

Currently tracked event types:

- `view` (`pageview`)
- `leave` (`page_leave`, duration not sent)
- `scroll` (`scroll_depth`, 20/40/60/80/100)
- `vital` (`lcp`, `fcp`, `cls`, `ttfb`)

`GET /{postId}` returns:

```json
{ "like": 3, "dislike": 0, "comment": 10 }
```

`GET /{postId}/comment` returns:

```json
{ "comments": [ { "id": "...", "name": "...", "message": "...", "lang": "tr", "commentType": "comment" } ] }
```

## Sheet schema (tab name: `records`)

Columns A–R:

1) id  
2) postId  
3) action  
4) value  
5) commentType  
6) relatedCommentId (comment likes/dislikes icin related comment id)  
7) status  
8) createdOn  
9) updatedOn  
10) ip  
11) country  
12) region  
13) city  
14) userAgent  
15) tatSession  
16) tatUser  
17) name  
18) lang  

## Sheet schema (tab name: `views`)

Columns A–V:

1) id  
2) createdOn  
3) eventType  
4) eventName  
5) eventValue  
6) url  
7) referrer  
8) utmSource  
9) utmMedium  
10) utmCampaign  
11) utmContent  
12) utmTerm  
13) ip  
14) country  
15) region  
16) city  
17) userAgent  
18) tatSession  
19) tatUser  
20) lang  
21) theme  
22) eventData  

## Sheet schema (tab name: `contact_form`)

Columns A–N:

1) id  
2) createdOn  
3) ip  
4) country  
5) region  
6) city  
7) userAgent  
8) tatSession  
9) tatUser  
10) lang  
11) name  
12) email  
13) type  
14) message  

## Environment variables

Worker vars:

- `SHEET_ID`
- `GOOGLE_CLIENT_EMAIL`
- `GOOGLE_PRIVATE_KEY`
- `TURNSTILE_SECRET` (optional, enables Turnstile validation for comments)

KV:

- `RATE` (used for rate limiting)

## Setup

1) Create a Google Cloud service account and enable the Sheets API.  
2) Share the target sheet with the service account email.  
3) Create a KV namespace for rate limiting.  
4) Fill `wrangler.toml` values and deploy.

## Deploy

```bash
cd backend
npx wrangler kv namespace create RATE
# copy the id into wrangler.toml
npx wrangler deploy
```

## Request body (POST)

For comments:

```json
{
  "name": "Fatih",
  "email": "fatih@tatoglu.net",
  "message": "Nice post",
  "lang": "tr",
  "turnstileToken": "token-from-turnstile",
  "tatSession": "session-id",
  "tatUser": "user-id"
}
```

For views:

```json
{
  "url": "https://tatoglu.net/posts/...",
  "referrer": "https://example.com/",
  "tatSession": "session-id",
  "tatUser": "user-id",
  "lang": "tr",
  "theme": "dark",
  "utm_source": "newsletter",
  "utm_medium": "email",
  "utm_campaign": "launch",
  "utm_content": "hero",
  "utm_term": "ai"
}
```

For events:

```json
{
  "type": "vital",
  "name": "lcp",
  "value": 2450,
  "data": { "rating": "good", "id": "v1-123" },
  "url": "https://tatoglu.net/posts/...",
  "referrer": "https://example.com/",
  "tatSession": "session-id",
  "tatUser": "user-id",
  "lang": "tr",
  "theme": "dark",
  "utm_source": "newsletter",
  "utm_medium": "email",
  "utm_campaign": "launch",
  "utm_content": "hero",
  "utm_term": "ai"
}
```

For contact:

```json
{
  "name": "Fatih",
  "email": "fatih@tatoglu.net",
  "type": "feedback",
  "message": "Merhaba!",
  "lang": "tr",
  "tatSession": "session-id",
  "tatUser": "user-id",
  "turnstileToken": "token-from-turnstile"
}
```

Optional headers for views:

- `tat-lang`
- `tat-theme`
