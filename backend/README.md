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

## Environment variables

Worker vars:

- `SHEET_ID`
- `GOOGLE_CLIENT_EMAIL`
- `GOOGLE_PRIVATE_KEY`

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
  "message": "Nice post",
  "lang": "tr",
  "tatSession": "session-id",
  "tatUser": "user-id"
}
```
