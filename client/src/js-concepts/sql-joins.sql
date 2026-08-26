-- ============================================================
-- FILE: sql-joins.sql
-- TOPIC: PostgreSQL Schema and SQL JOINs Demonstration
-- Required for SQL (Postgres) evaluation criteria
-- ============================================================


-- ============================================================
-- SECTION 1: SCHEMA SETUP
-- ============================================================

-- 1a. Create Users Table
CREATE TABLE IF NOT EXISTS users (
    id        SERIAL PRIMARY KEY,
    name      VARCHAR(255) NOT NULL,
    email     VARCHAR(255) UNIQUE NOT NULL,
    password  VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 1b. Create Portfolios Table with Foreign Key → users.id
--     ON DELETE CASCADE: deleting a user removes their portfolio entries
CREATE TABLE IF NOT EXISTS portfolios (
    id        SERIAL PRIMARY KEY,
    user_id   INT REFERENCES users(id) ON DELETE CASCADE,
    symbol    VARCHAR(10) NOT NULL,
    added_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ============================================================
-- SECTION 2: SEED DATA (for demonstration)
-- ============================================================

INSERT INTO users (name, email, password) VALUES
    ('Arya Tiwari',   'arya@example.com',   'hashed_pw_1'),
    ('Riya Sharma',   'riya@example.com',   'hashed_pw_2'),
    ('Karan Mehta',   'karan@example.com',  'hashed_pw_3'),
    ('Priya Singh',   'priya@example.com',  'hashed_pw_4');   -- No portfolio (to demo LEFT JOIN)

INSERT INTO portfolios (user_id, symbol) VALUES
    (1, 'AAPL'),
    (1, 'GOOGL'),
    (1, 'TSLA'),
    (2, 'MSFT'),
    (2, 'AMZN'),
    (3, 'NVDA');


-- ============================================================
-- SECTION 3: INNER JOIN
-- Returns ONLY rows where there is a match in BOTH tables.
-- Users with no portfolio entries are EXCLUDED.
-- ============================================================

-- 3a. All users who have portfolio entries
SELECT
    u.id           AS user_id,
    u.name         AS user_name,
    u.email        AS user_email,
    p.id           AS portfolio_id,
    p.symbol       AS stock_symbol,
    p.added_at
FROM users u
INNER JOIN portfolios p ON u.id = p.user_id;

/*
Expected output:
 user_id | user_name    | user_email           | portfolio_id | stock_symbol | added_at
---------+--------------+----------------------+--------------+--------------+-----------
       1 | Arya Tiwari  | arya@example.com     |            1 | AAPL         | ...
       1 | Arya Tiwari  | arya@example.com     |            2 | GOOGL        | ...
       1 | Arya Tiwari  | arya@example.com     |            3 | TSLA         | ...
       2 | Riya Sharma  | riya@example.com     |            4 | MSFT         | ...
       2 | Riya Sharma  | riya@example.com     |            5 | AMZN         | ...
       3 | Karan Mehta  | karan@example.com    |            6 | NVDA         | ...
  NOTE → Priya Singh (user_id=4) is excluded — no portfolio rows
*/

-- 3b. Filtered INNER JOIN: portfolio stocks for a specific user
SELECT
    u.id           AS user_id,
    u.name         AS user_name,
    u.email        AS user_email,
    p.id           AS portfolio_id,
    p.symbol       AS stock_symbol,
    p.added_at
FROM users u
INNER JOIN portfolios p ON u.id = p.user_id
WHERE u.id = 1;

/*
Expected output (only Arya's stocks):
 user_id | user_name   | user_email       | portfolio_id | stock_symbol | added_at
---------+-------------+------------------+--------------+--------------+-----------
       1 | Arya Tiwari | arya@example.com |            1 | AAPL         | ...
       1 | Arya Tiwari | arya@example.com |            2 | GOOGL        | ...
       1 | Arya Tiwari | arya@example.com |            3 | TSLA         | ...
*/


-- ============================================================
-- SECTION 4: LEFT JOIN  (a.k.a. LEFT OUTER JOIN)
-- Returns ALL rows from the LEFT table (users), plus matching
-- rows from the RIGHT table (portfolios).
-- Users with NO portfolio entries get NULL for portfolio columns.
-- ============================================================

SELECT
    u.id           AS user_id,
    u.name         AS user_name,
    u.email        AS user_email,
    p.symbol       AS stock_symbol
FROM users u
LEFT JOIN portfolios p ON u.id = p.user_id;

/*
Expected output:
 user_id | user_name    | user_email           | stock_symbol
---------+--------------+----------------------+--------------
       1 | Arya Tiwari  | arya@example.com     | AAPL
       1 | Arya Tiwari  | arya@example.com     | GOOGL
       1 | Arya Tiwari  | arya@example.com     | TSLA
       2 | Riya Sharma  | riya@example.com     | MSFT
       2 | Riya Sharma  | riya@example.com     | AMZN
       3 | Karan Mehta  | karan@example.com    | NVDA
       4 | Priya Singh  | priya@example.com    | NULL   ← no portfolio, but user is kept
*/

-- Common use: find users who have NO portfolio at all
SELECT
    u.id,
    u.name,
    u.email
FROM users u
LEFT JOIN portfolios p ON u.id = p.user_id
WHERE p.id IS NULL;   -- filter to only un-matched (NULL) rows

/*
Expected output:
 id | name         | email
----+--------------+--------------------
  4 | Priya Singh  | priya@example.com
*/


-- ============================================================
-- SECTION 5: RIGHT JOIN  (a.k.a. RIGHT OUTER JOIN)
-- Returns ALL rows from the RIGHT table (portfolios / users),
-- plus matching rows from the LEFT table.
-- Here: RIGHT JOIN users means all users appear even if no
-- portfolio row references them.
-- NOTE: RIGHT JOIN is the mirror of LEFT JOIN.
--       Most developers rewrite as LEFT JOIN for clarity.
-- ============================================================

SELECT
    p.id           AS portfolio_id,
    p.symbol       AS stock_symbol,
    u.name         AS user_name,
    u.email        AS user_email
FROM portfolios p
RIGHT JOIN users u ON p.user_id = u.id;

/*
Expected output (same result as the LEFT JOIN above, different perspective):
 portfolio_id | stock_symbol | user_name    | user_email
--------------+--------------+--------------+--------------------
            1 | AAPL         | Arya Tiwari  | arya@example.com
            2 | GOOGL        | Arya Tiwari  | arya@example.com
            3 | TSLA         | Arya Tiwari  | arya@example.com
            4 | MSFT         | Riya Sharma  | riya@example.com
            5 | AMZN         | Riya Sharma  | riya@example.com
            6 | NVDA         | Karan Mehta  | karan@example.com
         NULL | NULL         | Priya Singh  | priya@example.com  ← portfolio cols are NULL
*/


-- ============================================================
-- SECTION 6: FULL OUTER JOIN
-- Returns ALL rows from BOTH tables.
-- NULLs appear where there is no match on either side.
-- ============================================================

SELECT
    u.id           AS user_id,
    u.name         AS user_name,
    p.id           AS portfolio_id,
    p.symbol       AS stock_symbol
FROM users u
FULL OUTER JOIN portfolios p ON u.id = p.user_id;

/*
Useful when you want to see:
  - Users with no stocks  (p.id IS NULL)
  - Orphaned portfolio rows with no user  (u.id IS NULL — shouldn't happen with FK, but useful after data migrations)
*/


-- ============================================================
-- SECTION 7: SELF JOIN
-- A table joined with itself — useful for hierarchical data
-- (e.g., manager → employee relationships)
-- ============================================================

-- Example: if users had a 'referred_by' column (self-referential FK)
-- SELECT
--     u.name         AS user_name,
--     r.name         AS referred_by
-- FROM users u
-- LEFT JOIN users r ON u.referred_by = r.id;


-- ============================================================
-- SECTION 8: AGGREGATE + JOIN
-- Useful reporting query: total stocks per user
-- ============================================================

SELECT
    u.id               AS user_id,
    u.name             AS user_name,
    COUNT(p.id)        AS total_stocks,
    STRING_AGG(p.symbol, ', ' ORDER BY p.symbol) AS symbols
FROM users u
LEFT JOIN portfolios p ON u.id = p.user_id
GROUP BY u.id, u.name
ORDER BY total_stocks DESC;

/*
Expected output:
 user_id | user_name    | total_stocks | symbols
---------+--------------+--------------+--------------------
       1 | Arya Tiwari  |            3 | AAPL, GOOGL, TSLA
       2 | Riya Sharma  |            2 | AMZN, MSFT
       3 | Karan Mehta  |            1 | NVDA
       4 | Priya Singh  |            0 | (null)
*/


-- ============================================================
-- SECTION 9: CLEANUP (run to reset demo)
-- ============================================================

-- DROP TABLE IF EXISTS portfolios;
-- DROP TABLE IF EXISTS users;
