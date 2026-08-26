# MongoDB CRUD

CRUD maps directly to Mongoose operations used by HelperHub controllers.

```js
await JobPost.create({ recruiterId, title, category, description, location });
const openJobs = await JobPost.find({ status: 'open' }).sort({ createdAt: -1 });
await JobPost.findByIdAndUpdate(id, { status: 'assigned' }, { new: true, runValidators: true });
await JobPost.findByIdAndDelete(id);
```

Validate ownership and authorization before update/delete. Use projections for sensitive fields, pagination for list endpoints, and indexes for common filters. Mongoose validation is useful, but request validation and authorization remain application responsibilities.
