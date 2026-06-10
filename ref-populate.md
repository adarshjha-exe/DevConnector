# ref & populate

## The Problem First

You have two collections — `Users` and `ConnectionRequests`.

When you save a connection request, you store `fromUserId`. That's just an ID — a number like `64ab12...`.

Now when you fetch that request and want to **show the user's name, photo, age** — you only have the ID. How do you get the full details?

**Without ref/populate — you'd do this manually:**

```javascript
const request = await ConnectionRequest.findOne({ ... });
const user = await User.findOne({ _id: request.fromUserId }); // extra query
```

Two separate queries. Every time. Gets messy fast.

**ref + populate does this automatically for you.**

---

## ref — "This ID belongs to this collection"

You tell Mongoose — _"hey, this field is not just a random ID, it points to a User document"_

```javascript
fromUserId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'User',   // ← "this ID lives in the User collection"
  required: true,
},
toUserId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'User',   // ← same
  required: true,
},
```

`ref: 'User'` — the string must exactly match what you named your model:

```javascript
mongoose.model('User', userSchema);
//               ↑ this must match ref string
```

`ref` alone does nothing by itself. It's just a label. `populate` uses that label.

---

## populate — "Now go fetch the actual data"

```javascript
const request = await ConnectionRequest.findOne({
  toUserId: req.user._id,
}).populate('fromUserId'); // ← go fetch the full User for this ID
```

What comes back:

```javascript
// Without populate:
{
  fromUserId: '64ab12ef...',   // just an ID
  toUserId: '64ab99xx...',
  status: 'interested'
}

// With populate('fromUserId'):
{
  fromUserId: {                // full user object now
    _id: '64ab12ef...',
    name: 'Rahul',
    age: 25,
    photoUrl: '...',
    email: '...'
  },
  toUserId: '64ab99xx...',    // still just ID, we didn't populate this
  status: 'interested'
}
```

---

## Populate Both Fields

```javascript
const request = await ConnectionRequest.findOne({ toUserId: req.user._id })
  .populate('fromUserId')
  .populate('toUserId');
```

---

## Populate Only Specific Fields

You usually don't want to send `password` and other sensitive fields:

```javascript
.populate('fromUserId', 'name age photoUrl')  // only fetch these 3 fields
```

---

## Full Real Example in Your Code

```javascript
// "Show me all requests I received, with sender's details"
const requests = await ConnectionRequest.find({
  toUserId: req.user._id,
  status: 'interested',
}).populate('fromUserId', 'name age photoUrl skills'); // only what frontend needs
```

Response looks like:

```javascript
[
  {
    status: 'interested',
    fromUserId: {
      name: 'Rahul',
      age: 25,
      photoUrl: 'https://...',
      skills: ['React', 'Node'],
    },
  },
];
```

---

## The Simple Mental Model

```
ref      → "this ID points to this collection"   (defined once, on schema)
populate → "now go get me the actual document"    (used when querying)
```

Think of `ref` as writing a **page number** in a book.
`populate` is actually **turning to that page** and reading it.

---

---

---

## Example :

**CASE 0 : Without populate**

```js
const data = await ConnectionRequest.find({
  toUserId: req.user._id,
  status: 'interested',
});
```

**output :**

```json
{
  "success": true,
  "data": [
    {
      "_id": "6a29939dd991eea0fc8e4573",
      "fromUserId": "6a255938208a2e713ef64dc2",
      "toUserId": "6a255914208a2e713ef64dc0", // NOTICE THIS NOTHING HERE
      "status": "interested",
      "createdAt": "2026-06-10T16:41:01.268Z",
      "updatedAt": "2026-06-10T16:41:01.268Z",
      "__v": 0
    },
    {
      "_id": "6a2993bed991eea0fc8e4574",
      "fromUserId": "6a255924208a2e713ef64dc1",
      "toUserId": "6a255914208a2e713ef64dc0",
      "status": "interested",
      "createdAt": "2026-06-10T16:41:34.791Z",
      "updatedAt": "2026-06-10T16:41:34.791Z",
      "__v": 0
    }
  ]
}
```

**CASE 1 : WITH populate('toUserId')**

**output:**

```js
const data = await ConnectionRequest.find({
  toUserId: req.user._id,
  status: 'interested',
}).populate('toUserId');
```

output :

```json
{
  "success": true,
  "data": [
    {
      "_id": "6a29939dd991eea0fc8e4573",
      "fromUserId": "6a255938208a2e713ef64dc2",
      "toUserId": {
        // NOTICE HERE <------
        "_id": "6a255914208a2e713ef64dc0",
        "firstName": "Virat",
        "lastName": "kohli",
        "email": "virat@gmail.com",
        "password": "$2b$10$4VZ4yd3oN59lhNIIGcoiu.ZSnHdfWBXSvbyrNIcqM2J4zuAwvhO3i",
        "photoUrl": "https://www.mjunction.in/wp-content/uploads/2020/09/Dummy.jpg",
        "about": "This is default about",
        "skills": [],
        "createdAt": "2026-06-07T11:42:12.539Z",
        "updatedAt": "2026-06-07T11:42:12.539Z",
        "__v": 0
      },
      "status": "interested",
      "createdAt": "2026-06-10T16:41:01.268Z",
      "updatedAt": "2026-06-10T16:41:01.268Z",
      "__v": 0
    },
    {
      "_id": "6a2993bed991eea0fc8e4574",
      "fromUserId": "6a255924208a2e713ef64dc1",
      "toUserId": {
        "_id": "6a255914208a2e713ef64dc0",
        "firstName": "Virat",
        "lastName": "kohli",
        "email": "virat@gmail.com",
        "password": "$2b$10$4VZ4yd3oN59lhNIIGcoiu.ZSnHdfWBXSvbyrNIcqM2J4zuAwvhO3i",
        "photoUrl": "https://www.mjunction.in/wp-content/uploads/2020/09/Dummy.jpg",
        "about": "This is default about",
        "skills": [],
        "createdAt": "2026-06-07T11:42:12.539Z",
        "updatedAt": "2026-06-07T11:42:12.539Z",
        "__v": 0
      },
      "status": "interested",
      "createdAt": "2026-06-10T16:41:34.791Z",
      "updatedAt": "2026-06-10T16:41:34.791Z",
      "__v": 0
    }
  ]
}
```

**CASE 2 : WITH populate('fromUserId');**

```js
const data = await ConnectionRequest.find({
  toUserId: req.user._id,
  status: 'interested',
}).populate('fromUserId');
```

**output :**

```json
{
  "success": true,
  "data": [
    {
      "_id": "6a29939dd991eea0fc8e4573",
      "fromUserId": {
        // NOTICE HERE FROM USER ALL DETIALS
        "_id": "6a255938208a2e713ef64dc2",
        "firstName": "John",
        "lastName": "wick",
        "email": "john@gmail.com",
        "password": "$2b$10$I.v54m4iQU2M3cjL4xMibujbwTF/0tyKrodUM1Tx8VnvEytjwiuJK",
        "photoUrl": "https://www.mjunction.in/wp-content/uploads/2020/09/Dummy.jpg",
        "about": "This is default about",
        "skills": [],
        "createdAt": "2026-06-07T11:42:48.364Z",
        "updatedAt": "2026-06-07T11:42:48.364Z",
        "__v": 0
      },
      "toUserId": "6a255914208a2e713ef64dc0", // NOTICE HERE , NOT MUCH DETAIL ABOUT TO USER
      "status": "interested",
      "createdAt": "2026-06-10T16:41:01.268Z",
      "updatedAt": "2026-06-10T16:41:01.268Z",
      "__v": 0
    },
    {
      "_id": "6a2993bed991eea0fc8e4574",
      "fromUserId": {
        "_id": "6a255924208a2e713ef64dc1",
        "firstName": "Adarsh",
        "lastName": "Jha",
        "email": "adarsh@gmail.com",
        "password": "$2b$10$03.LJkT0ePAn13WgqUGTTe6kEvSXfzy8MhUGHysTnMd6Dqs.jyFz2",
        "photoUrl": "https://www.mjunction.in/wp-content/uploads/2020/09/Dummy.jpg",
        "about": "This is default about",
        "skills": [],
        "createdAt": "2026-06-07T11:42:28.038Z",
        "updatedAt": "2026-06-07T11:42:28.038Z",
        "__v": 0
      },
      "toUserId": "6a255914208a2e713ef64dc0",
      "status": "interested",
      "createdAt": "2026-06-10T16:41:34.791Z",
      "updatedAt": "2026-06-10T16:41:34.791Z",
      "__v": 0
    }
  ]
}
```

**CASE 3: both populate toUserId & fromUserId**

```js
const data = await ConnectionRequest.find({
  toUserId: req.user._id,
  status: 'interested',
})
  .populate('fromUserId')
  .populate('toUserId');
```

**output:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "6a29939dd991eea0fc8e4573",
      "fromUserId": {
        // NOTICE HERE <------
        "_id": "6a255938208a2e713ef64dc2",
        "firstName": "John",
        "lastName": "wick",
        "email": "john@gmail.com",
        "password": "$2b$10$I.v54m4iQU2M3cjL4xMibujbwTF/0tyKrodUM1Tx8VnvEytjwiuJK",
        "photoUrl": "https://www.mjunction.in/wp-content/uploads/2020/09/Dummy.jpg",
        "about": "This is default about",
        "skills": [],
        "createdAt": "2026-06-07T11:42:48.364Z",
        "updatedAt": "2026-06-07T11:42:48.364Z",
        "__v": 0
      },
      "toUserId": {
        // NOTICE HERE <------
        "_id": "6a255914208a2e713ef64dc0",
        "firstName": "Virat",
        "lastName": "kohli",
        "email": "virat@gmail.com",
        "password": "$2b$10$4VZ4yd3oN59lhNIIGcoiu.ZSnHdfWBXSvbyrNIcqM2J4zuAwvhO3i",
        "photoUrl": "https://www.mjunction.in/wp-content/uploads/2020/09/Dummy.jpg",
        "about": "This is default about",
        "skills": [],
        "createdAt": "2026-06-07T11:42:12.539Z",
        "updatedAt": "2026-06-07T11:42:12.539Z",
        "__v": 0
      },
      "status": "interested",
      "createdAt": "2026-06-10T16:41:01.268Z",
      "updatedAt": "2026-06-10T16:41:01.268Z",
      "__v": 0
    },
    {
      "_id": "6a2993bed991eea0fc8e4574",
      "fromUserId": {
        // NOTICE HERE <------
        "_id": "6a255924208a2e713ef64dc1",
        "firstName": "Adarsh",
        "lastName": "Jha",
        "email": "adarsh@gmail.com",
        "password": "$2b$10$03.LJkT0ePAn13WgqUGTTe6kEvSXfzy8MhUGHysTnMd6Dqs.jyFz2",
        "photoUrl": "https://www.mjunction.in/wp-content/uploads/2020/09/Dummy.jpg",
        "about": "This is default about",
        "skills": [],
        "createdAt": "2026-06-07T11:42:28.038Z",
        "updatedAt": "2026-06-07T11:42:28.038Z",
        "__v": 0
      },
      "toUserId": {
        // NOTICE HERE <------
        "_id": "6a255914208a2e713ef64dc0",
        "firstName": "Virat",
        "lastName": "kohli",
        "email": "virat@gmail.com",
        "password": "$2b$10$4VZ4yd3oN59lhNIIGcoiu.ZSnHdfWBXSvbyrNIcqM2J4zuAwvhO3i",
        "photoUrl": "https://www.mjunction.in/wp-content/uploads/2020/09/Dummy.jpg",
        "about": "This is default about",
        "skills": [],
        "createdAt": "2026-06-07T11:42:12.539Z",
        "updatedAt": "2026-06-07T11:42:12.539Z",
        "__v": 0
      },
      "status": "interested",
      "createdAt": "2026-06-10T16:41:34.791Z",
      "updatedAt": "2026-06-10T16:41:34.791Z",
      "__v": 0
    }
  ]
}
```

CASE 4: with limited fields

```js
const data = await ConnectionRequest.find({
  toUserId: req.user._id,
  status: 'interested',
}).populate('fromUserId', 'firstName lastName photoUrl about ');
```

output :

```json
{
  "success": true,
  "data": [
    {
      "_id": "6a29939dd991eea0fc8e4573",
      "fromUserId": {
        "_id": "6a255938208a2e713ef64dc2",
        "firstName": "John",
        "lastName": "wick",
        "photoUrl": "https://www.mjunction.in/wp-content/uploads/2020/09/Dummy.jpg",
        "about": "This is default about"
      },
      "toUserId": "6a255914208a2e713ef64dc0",
      "status": "interested",
      "createdAt": "2026-06-10T16:41:01.268Z",
      "updatedAt": "2026-06-10T16:41:01.268Z",
      "__v": 0
    },
    {
      "_id": "6a2993bed991eea0fc8e4574",
      "fromUserId": {
        "_id": "6a255924208a2e713ef64dc1",
        "firstName": "Adarsh",
        "lastName": "Jha",
        "photoUrl": "https://www.mjunction.in/wp-content/uploads/2020/09/Dummy.jpg",
        "about": "This is default about"
      },
      "toUserId": "6a255914208a2e713ef64dc0",
      "status": "interested",
      "createdAt": "2026-06-10T16:41:34.791Z",
      "updatedAt": "2026-06-10T16:41:34.791Z",
      "__v": 0
    }
  ]
}
```
