## Let's dry run **exactly how Mongoose + MongoDB executes this query step by step.**

code:

```js
const isExistingRequest = await ConnectionRequest.findOne({
  $or: [
    { toUserId, fromUserId },
    { fromUserId: toUserId, toUserId: fromUserId },
  ],
});
```

Imagine your values are:

```js
const fromUserId = '111'; // Rahul (logged in user)
const toUserId = '222'; // Amit
```

---

## Step 1: JavaScript creates the object

Because of shorthand:

```js
{
  (toUserId, fromUserId);
}
```

JavaScript converts it into:

```js
{
  toUserId: "222",
  fromUserId: "111"
}
```

Second object:

```js
{
  fromUserId: toUserId,
  toUserId: fromUserId
}
```

becomes:

```js
{
  fromUserId: "222",
  toUserId: "111"
}
```

---

## Step 2: Mongoose receives this query

Now Mongoose actually gets:

```js
ConnectionRequest.findOne({
  $or: [
    {
      toUserId: '222',
      fromUserId: '111',
    },
    {
      fromUserId: '222',
      toUserId: '111',
    },
  ],
});
```

---

## Step 3: Mongoose checks your schema

Suppose schema:

```js
const connectionSchema = new mongoose.Schema({
  fromUserId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  toUserId: {
    type: mongoose.Schema.Types.ObjectId,
  },
});
```

Mongoose sees:

```
"111"
```

and converts:

```js
'111';
```

into:

```js
ObjectId('111');
```

This is called **casting**.

---

## Step 4: MongoDB receives final query

MongoDB gets:

```js
{
  $or: [
    {
      toUserId: ObjectId('222'),
      fromUserId: ObjectId('111'),
    },
    {
      fromUserId: ObjectId('222'),
      toUserId: ObjectId('111'),
    },
  ];
}
```

---

Now assume your collection has:

```js
[
  {
    _id: 1,
    fromUserId: ObjectId('555'),
    toUserId: ObjectId('777'),
  },

  {
    _id: 2,
    fromUserId: ObjectId('222'),
    toUserId: ObjectId('111'),
  },

  {
    _id: 3,
    fromUserId: ObjectId('999'),
    toUserId: ObjectId('888'),
  },
];
```

---

# Step 5: MongoDB scans documents

### Document 1

```js
{
 fromUserId:"555",
 toUserId:"777"
}
```

Mongo checks:

Condition 1:

```
toUserId == 222
AND
fromUserId == 111
```

false ❌

Condition 2:

```
fromUserId == 222
AND
toUserId == 111
```

false ❌

Move next.

---

### Document 2

```js
{
 fromUserId:"222",
 toUserId:"111"
}
```

Condition 1:

```
toUserId == 222
AND
fromUserId == 111
```

false ❌

Try second condition:

```
fromUserId == 222
AND
toUserId == 111
```

true ✅

Found match.

---

Because you used:

```js
findOne();
```

MongoDB stops searching.

It returns:

```js
{
  _id:2,
  fromUserId:"222",
  toUserId:"111"
}
```

---

## Step 6: await receives data

So:

```js
const isExistingRequest = await ConnectionRequest.findOne(...)
```

becomes:

```js
const isExistingRequest = {
  _id: 2,
  fromUserId: '222',
  toUserId: '111',
};
```

Then:

```js
console.log(isExistingRequest);
```

prints that document.

---

If no match:

Mongo returns:

```js
null;
```

so:

```js
const isExistingRequest = null;
```

---

The whole query in English:

> "MongoDB, find me one connection where Rahul sent Amit a request OR Amit sent Rahul a request."

This prevents duplicate connections in both directions. ✅
