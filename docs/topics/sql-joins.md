# SQL JOINs

A join combines rows using a relationship.

```sql
SELECT jp.title, recruiter.name, helper.name AS helper_name
FROM job_posts AS jp
JOIN users AS recruiter ON recruiter.id = jp.recruiter_id
LEFT JOIN users AS helper ON helper.id = jp.assigned_helper_id
WHERE jp.status = 'open';
```

Use `JOIN`/`INNER JOIN` when both sides are required. Use `LEFT JOIN` when the left row must remain even if the relationship is absent, as with an unassigned job. Put relationship predicates in `ON` when preserving unmatched rows matters; a filter in `WHERE` can turn a left join into an inner join.
