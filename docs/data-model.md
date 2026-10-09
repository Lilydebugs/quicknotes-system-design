
# QuickNotes Data Model

## 1. Database Choice

QuickNotes uses a relational SQL database such as PostgreSQL.

SQL is suitable because notes belong to users, tags can be shared by many notes, and foreign keys help maintain data integrity. Transactions also make related changes reliable. A NoSQL database could provide flexible documents and horizontal scaling, but SQL relationships and constraints fit this application's data well.

## 2. Entities and Columns

### Users

| Column | Type | Key / purpose |
|---|---|---|
| id | BIGINT | Primary key |
| name | VARCHAR(100) | User's display name |
| email | VARCHAR(255) | Unique email address |
| password_hash | VARCHAR(255) | Secure password hash |
| created_at | TIMESTAMP | Account creation time |

### Notes

| Column | Type | Key / purpose |
|---|---|---|
| id | BIGINT | Primary key |
| user_id | BIGINT | Foreign key to users.id |
| title | VARCHAR(100) | Required note title |
| body | TEXT | Note content |
| created_at | TIMESTAMP | Creation time |
| updated_at | TIMESTAMP | Last update time |

### Tags

| Column | Type | Key / purpose |
|---|---|---|
| id | BIGINT | Primary key |
| user_id | BIGINT | Foreign key to users.id |
| name | VARCHAR(50) | Tag name |
| created_at | TIMESTAMP | Creation time |

### Note_Tags

| Column | Type | Key / purpose |
|---|---|---|
| note_id | BIGINT | Foreign key to notes.id; part of primary key |
| tag_id | BIGINT | Foreign key to tags.id; part of primary key |

The composite primary key `(note_id, tag_id)` prevents the same tag from being attached to the same note more than once.

## 3. Relationships

- **Users to Notes — one-to-many:** one user can own many notes, while each note belongs to one user.
- **Users to Tags — one-to-many:** one user can create many tags, while each tag belongs to one user.
- **Notes to Tags — many-to-many:** one note can have multiple tags, and one tag can be used on multiple notes. The `note_tags` junction table implements this relationship.

## 4. CREATE TABLE Statements

The following statements use PostgreSQL syntax.

```sql
CREATE TABLE users (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notes (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    body TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tags (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, name)
);

CREATE TABLE note_tags (
    note_id BIGINT NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
    tag_id BIGINT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (note_id, tag_id)
);
```

## 5. Indexes

```sql
CREATE INDEX idx_notes_user_updated
ON notes(user_id, updated_at DESC);

CREATE INDEX idx_note_tags_tag
ON note_tags(tag_id);
```

The first index speeds up listing a user's notes in recently updated order. The second helps find notes associated with a particular tag.

The unique constraint on `users.email` also creates an index suitable for email lookups.

## 6. Example SQL Queries

### Query 1: List a user's notes

```sql
SELECT id, title, body, created_at, updated_at
FROM notes
WHERE user_id = 7
ORDER BY updated_at DESC
LIMIT 10;
```

This returns up to ten notes belonging to user 7.

### Query 2: Find notes with a particular tag (JOIN)

```sql
SELECT n.id, n.title, n.body
FROM notes AS n
JOIN note_tags AS nt ON nt.note_id = n.id
JOIN tags AS t ON t.id = nt.tag_id
WHERE n.user_id = 7
  AND t.name = 'School'
ORDER BY n.updated_at DESC;
```

This joins notes, the junction table, and tags to find notes labelled School.

### Query 3: Create a note

```sql
INSERT INTO notes (user_id, title, body)
VALUES (7, 'Study plan', 'Revise system design')
RETURNING id, user_id, title, body, created_at;
```

This creates a note and returns its generated ID and details.

### Query 4: Count notes per user

```sql
SELECT u.id, u.name, COUNT(n.id) AS note_count
FROM users AS u
LEFT JOIN notes AS n ON n.user_id = u.id
GROUP BY u.id, u.name
ORDER BY note_count DESC;
```

This counts each user's notes, including users with no notes.

## 7. Data Integrity and Security

Foreign keys prevent notes, tags, and tag links from referencing missing records. Cascading deletes remove a user's notes and related tag links when that user is deleted. Email addresses are unique, and password hashes must be generated with a suitable password-hashing algorithm rather than storing plain-text passwords.

The application should also enforce ownership checks so a user cannot read, change, or delete another user's notes.
