-- PostgreSQL reference schema for the HelperHub marketplace.
CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('jobseeker', 'recruiter', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE job_posts (
  id BIGSERIAL PRIMARY KEY,
  recruiter_id BIGINT NOT NULL REFERENCES users(id),
  assigned_helper_id BIGINT REFERENCES users(id),
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  budget NUMERIC(10, 2) CHECK (budget IS NULL OR budget >= 0),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'assigned', 'in_progress', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE hire_requests (
  id BIGSERIAL PRIMARY KEY,
  job_post_id BIGINT NOT NULL REFERENCES job_posts(id) ON DELETE CASCADE,
  recruiter_id BIGINT NOT NULL REFERENCES users(id),
  helper_id BIGINT NOT NULL REFERENCES users(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (job_post_id, helper_id)
);

CREATE TABLE reviews (
  id BIGSERIAL PRIMARY KEY,
  hire_request_id BIGINT NOT NULL REFERENCES hire_requests(id) ON DELETE CASCADE,
  reviewer_id BIGINT NOT NULL REFERENCES users(id),
  reviewee_id BIGINT NOT NULL REFERENCES users(id),
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (hire_request_id, reviewer_id)
);

CREATE INDEX job_posts_status_category_idx ON job_posts(status, category);
CREATE INDEX hire_requests_helper_status_idx ON hire_requests(helper_id, status);
CREATE INDEX reviews_reviewee_idx ON reviews(reviewee_id);
