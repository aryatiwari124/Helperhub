# PostgreSQL Relational Schema Design

The relational version of HelperHub is represented in [schema.sql](../sql/schema.sql). Tables use primary keys for identity and foreign keys for relationships.

Core relationships:

- `users` has many `job_posts` through `job_posts.recruiter_id`.
- `job_posts` may have one assigned helper through `assigned_helper_id`.
- `hire_requests` connects a recruiter, helper, and job post.
- `reviews` belongs to a completed hire and has a uniqueness constraint per reviewer/hire.

Use `NOT NULL` for required facts, `CHECK` constraints for valid state/range values, and indexes for foreign keys and frequent filters. Keep transactional facts normalized first; add read models only when measured query needs justify them.
