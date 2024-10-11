# Contact Api Spec

## Create Contact

Endpoint: POST /api/contacts

Headers:

- Authorization

Request Body:

```json
{
  "first_name": "Gagas",
  "last_name": "WIN",
  "email": "gagaswahyuin@gmail.com",
  "phone": "099999999999"
}
```

Response Body:

```json
{
  "data": {
    "id": 1,
    "first_name": "Gagas",
    "last_name": "WIN",
    "email": "gagaswahyuin@gmail.com",
    "phone": "099999999999"
  }
}
```

## Get Contact

Endpoint: GET /api/contacts/:contactId

Headers:

- Authorization

Response Body:

```json
{
  "data": {
    "id": 1,
    "first_name": "Gagas",
    "last_name": "WIN",
    "email": "gagaswahyuin@gmail.com",
    "phone": "099999999999"
  }
}
```

## Update Contact

Endpoint: PUT /api/contacts/:contactid

Headers:

- Authorization

Request Body:

```json
{
  "first_name": "Gagas",
  "last_name": "WIN",
  "email": "gagaswahyuin@gmail.com",
  "phone": "099999999999"
}
```

Response Body:

```json
{
  "data": {
    "id": 1,
    "first_name": "Gagas",
    "last_name": "WIN",
    "email": "gagaswahyuin@gmail.com",
    "phone": "099999999999"
  }
}
```

## Remove Contact

Endpoint: DELETE /api/contacts

Headers:

- Authorization

Response Body:

```json
{
  "data": true
}
```

## Search Contact

Endpoint: GET /api/contacts

Headers:

- Authorization

Query Params:

- name: string -> contact first_name or last_name <-> optional
- phone: string -> contact phone <-> optional
- email: string -> contact email -> optional
- page: number <-> default 1
- size: number <-> default 10

| Paramater |           Description           |    Notes    |
| --------- | :-----------------------------: | :---------: |
| name      | contact first_name or last_name |  Optional   |
| phone     |          contact phone          |  Optional   |
| email     |          contact email          |  Optional   |
| page      |                                 | default: 1  |
| size      |                                 | default: 10 |

Response Body:

```json
{
  "data": [
    {
      "id": 1,
      "first_name": "Gagas",
      "last_name": "WIN",
      "email": "gagaswahyuin@gmail.com",
      "phone": "099999999999"
    },
    {
      "id": 2,
      "first_name": "Gagas",
      "last_name": "WIN",
      "email": "gagaswahyuin@gmail.com",
      "phone": "099999999999"
    }
  ],
  "paging": {
    "current_page": 1,
    "total_page": 10,
    "size": 10
  }
}
```
