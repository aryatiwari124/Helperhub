# MongoDB Schema Modeling

MongoDB schemas should follow access patterns, not just mirror relational tables. HelperHub stores users, job posts, profiles, hire requests, payments, and reviews as separate Mongoose models.

Modeling decisions:

- Use references for independently queried entities such as `recruiterId` and `assignedHelperId`.
- Embed small, immutable values when they are always read with the parent.
- Add enum, required, length, and range validation at the schema boundary.
- Add indexes for query shapes, such as `JobPost.status + category`.
- Avoid unbounded arrays; create a collection when a relationship can grow without limit.

Review denormalization against consistency needs and write frequency before adding it.
