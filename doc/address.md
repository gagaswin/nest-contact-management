# Address API Spec

## Create Address

Endpoint: POST /api/contacts/:contactId/addresses

Headers:

- Authorization: token

Request Body:

```json
{
  "street": "jalan contoh", // optional
  "city": "Atlantis", // optinal
  "province": "Prov", // optional
  "postal_code": "123",
  "country": "Fire Nation"
}
```

Response Body:

```json
{
  "data": {
    "id": 1,
    "street": "jalan contoh", // optional
    "city": "Atlantis", // optinal
    "province": "Prov", // optional
    "postal_code": "123",
    "country": "Fire Nation"
  }
}
```

## Get Address

Endpoint: PUT /api/contacts/:contactId/addresses/:addressId

Headers:

- Authorization: token

Response Body:

```json
{
  "data": {
    "id": 1,
    "street": "jalan contoh", // optional
    "city": "Atlantis", // optinal
    "province": "Prov", // optional
    "postal_code": "123",
    "country": "Fire Nation"
  }
}
```

## Update Address

Endpoint: POST /api/contacts/:contactId/addresses/:addressId

Headers:

- Authorization: token

Request Body:

```json
{
  "street": "jalan contoh", // optional
  "city": "Atlantis", // optinal
  "province": "Prov", // optional
  "postal_code": "123",
  "country": "Fire Nation"
}
```

Response Body:

```json
{
  "data": {
    "id": 1,
    "street": "jalan contoh", // optional
    "city": "Atlantis", // optinal
    "province": "Prov", // optional
    "postal_code": "123",
    "country": "Fire Nation"
  }
}
```

## Remove Address

Endpoint: Delete /api/contacts/:contactId/addresses/:addressId

Headers:

- Authorization: token

Response Body:

```json
{
  "data": true
}
```

## List Addresses

Endpoint: GET /api/contacts/:contactId/addresses

Headers:

- Authorization: token

Response Body:

```json
{
  "data": [
    {
      "id": 1,
      "street": "jalan contoh", // optional
      "city": "Atlantis", // optinal
      "province": "Prov", // optional
      "postal_code": "123",
      "country": "Fire Nation"
    },
    {
      "id": 2,
      "street": "jalan contoh", // optional
      "city": "Atlantis", // optinal
      "province": "Prov", // optional
      "postal_code": "123",
      "country": "Fire Nation"
    }
  ]
}
```
