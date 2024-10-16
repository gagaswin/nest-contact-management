# User API Spec

## Register User

Endpoint: POST /api/users

Request Body:

```json
{
  "username": "gagaswin",
  "password": "rahasia123",
  "name": "Gagas WIN"
}
```

Response Body (Success):

```json
{
  "data": {
    "username": "gagaswin",
    "name": "Gagas WIN"
  }
}
```

Response Body (Error):

```json
{
  "error": "username already exist"
}


{
  "error": "username at least 6 character"
}
```

## Login User

Endpoint: POST /api/users/login

Request Body:

```json
{
  "username": "gagaswin",
  "password": "rahasia123"
}
```

Response Body (Success):

```json
{
  "data": {
    "username": "gagaswin",
    "name": "Gagas WIN",
    "token": "session_id_generated"
  }
}
```

Response Body (Error):

```json
{
  "error": "username or password is wrong"
}
```

## Get User

Endpoint: GET /api/users/current

Headers:

- Authorization: token

Response Body (Success):

```json
{
  "data": {
    "username": "gagaswin",
    "name": "Gagas WIN"
  }
}
```

Response Body (Error):

```json
{
  "error": "Unauthorized"
}
```

## Update User

Endpoint: Patch /api/users/current

Headers:

- Authorization: token

Request Body:

```json
{
  "password": "rahasia123", // optional
  "name": "Gagas WIN" // optional
}
```

Response Body (Success):

```json
{
  "data": {
    "username": "gagaswin",
    "name": "Gagas WIN"
  }
}
```

## Logout User

Endpoint: DELETE /api/users/current

Headers:

- Authorization: token

Response Body (Success):

```json
{
  "data": {
    "username": "gagaswin",
    "isLogout": true
  }
}
```
