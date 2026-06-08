## Think Like This First — What Problem Does an Index Solve?

Without an index, MongoDB reads **every single document** to find your match. Like finding a name in a book with no table of contents — you read every page.

An index = **MongoDB's table of contents.** It jumps directly to relevant documents.

---

## Step 1 — Audit Your Queries First

The rule is simple: **wherever you write `.find()` or `.findOne()`, those fields are index candidates.**

Look at your own code:

```javascript
// Query 1 — your duplicate check
ConnectionRequest.findOne({
  $or: [
    { toUserId, fromUserId }, // searching by BOTH fields together
    { fromUserId: toUserId, toUserId: fromUserId },
  ],
});

// Query 2 -  Future queries you'll definitely write:
ConnectionRequest.find({ toUserId: req.user._id }); // "show my received requests"
// Query 3 :
ConnectionRequest.find({ fromUserId: req.user._id }); // "show my sent requests"
```

So the candidates are: `fromUserId`, `toUserId`, and `their combination`.

---

## Step 2 — Single Index vs Compound Index

**Single index** — you search that field alone:

```javascript
ConnectionRequest.find({ toUserId: someId }); // ← single field
```

**Compound index** — you search multiple fields **together** in the same query:

```javascript
ConnectionRequest.findOne({ fromUserId: x, toUserId: y }); // ← both fields together
```

### The Left-Prefix Rule (most important concept)

```
Compound index: { fromUserId: 1, toUserId: 1 }

Queries this index CAN serve:
✅ { fromUserId: x }
✅ { fromUserId: x, toUserId: y }

Queries this index CANNOT serve:
❌ { toUserId: y }   ← toUserId alone, not the leftmost field
```

So you still need **one separate index** for `toUserId` alone.

## **Total indexes needed = 2.**

## What to Add in Your Schema

```javascript
const connectionRequestSchema = new mongoose.Schema(
  {
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    toUserId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    status: {
      type: String,
      enum: {
        values: ['accepted', 'ignored', 'rejected', 'interested'],
        message: `{VALUE} is not the valid status`,
      },
    },
  },
  { timestamps: true },
);

// 1. Single index — for "show my received requests" -  covers find({ toUserId })
connectionRequestSchema.index({ toUserId: 1 });

// 2.Compound index — for duplicate check + "show my sent requests"
// covers: find({ fromUserId }) and find({ fromUserId, toUserId })
// also handles { fromUserId } alone (left-prefix rule)
connectionRequestSchema.index({ fromUserId: 1, toUserId: 1 }, { unique: true });
```

---

## The Decision Framework (How to Think About This)

```
For every field, ask these 3 questions:

1. Do I SEARCH by this field?
   Yes → index candidate

2. Do I SEARCH by this field TOGETHER with another field?
   Yes → compound index candidate (put more selective field first)

3. Is this field HIGH CARDINALITY? (many unique values)
   userId, email → great for index (narrows down a lot)
   status (4 values) → weak alone, ok as second field in compound
   boolean → almost never worth indexing alone
```

```
Write:Read ratio check:

Indexes SLOW DOWN writes slightly (index gets updated on every insert/update)
Collections that are mostly written to → be careful, don't over-index
Collections that are mostly read from → index more freely

Your ConnectionRequest model = write once, read many → safe to index
```

---

## Docs to Read

**MongoDB docs** → https://www.mongodb.com/docs/manual/indexes/

| What to read                    | Why                                                               |
| ------------------------------- | ----------------------------------------------------------------- |
| _"Index Types"_ section         | Understand single, compound, unique                               |
| _"Compound Indexes → Prefixes"_ | The left-prefix rule explained with examples                      |
| _"ESR Rule"_                    | How to ORDER fields in a compound index (Equality → Sort → Range) |
| _"explain()"_ method            | How to verify if your query is actually using the index           |

**How to read these docs as a habit:**
Every time you write a `.find()` query → go check: _"is there an index on these fields?"_ Run `query.explain('executionStats')` in MongoDB Compass or shell and look for `IXSCAN` (index scan, good) vs `COLLSCAN` (collection scan, bad).

---

```js
email: {
      type: String,
      unique: true,  // creates a Unique Index on email — no two users can have the same email, enforced at DB level
}
// Mongoose internally does the same as: UserSchema.index({email : 1}, unique:{true})
```
