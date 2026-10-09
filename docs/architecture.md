
# QuickNotes System Architecture

## 1. Overview

QuickNotes is a web application that lets users create, read, update, delete, and organise notes. The architecture is designed to support one million registered users while remaining reliable, secure, and responsive.

## 2. Functional Requirements

- Users can create accounts and sign in securely.
- Users can create, view, update, and delete their own notes.
- Users can organise notes with tags.
- Users can search and paginate through their notes.
- Users receive clear loading, success, empty, and error messages.
- Users cannot access or modify notes owned by other users.

## 3. Non-Functional Requirements

- **Scalability:** support growth in users and request volume.
- **Availability:** continue serving requests if an application server fails.
- **Performance:** use caching and database indexes to reduce response times.
- **Security:** use HTTPS, authentication, authorization, and server-side validation.
- **Durability:** persist notes in reliable database storage with backups.
- **Maintainability:** separate the frontend, API, database, and background processing.
- **Observability:** record logs, metrics, and errors to help diagnose failures.

## 4. Load Estimates for One Million Users

These are planning assumptions, not measured production traffic.

### Assumptions

- Registered users: 1,000,000.
- Daily active users (DAU): 20% of registered users = 200,000.
- Average requests per active user per day: 50.
- Read requests: 90% of API requests.
- Write requests: 10% of API requests.
- Average stored note content: 2 KB.
- Average notes created per active user per day: 2.
- Days per year: 365.

### Requests per second

Daily API requests:

`200,000 × 50 = 10,000,000 requests/day`

Average total requests per second:

`10,000,000 ÷ 86,400 ≈ 116 requests/second`

Read requests per second:

`116 × 0.90 ≈ 104 reads/second`

Write requests per second:

`116 × 0.10 ≈ 12 writes/second`

The system should be load-tested above these averages to account for peak periods, bursts, retries, and growth.

### Storage per year

Assume each active user creates two notes per day:

`200,000 × 2 = 400,000 notes/day`

Annual notes created:

`400,000 × 365 = 146,000,000 notes/year`

Estimated annual note-content storage:

`146,000,000 × 2 KB = 292,000,000 KB`

Using decimal units, this is approximately **292 GB per year** for note content alone.

Actual storage will be higher after accounting for indexes, metadata, database overhead, replicas, backups, and retained versions. If photo attachments are introduced, their object storage must be estimated separately.

## 5. Architecture Diagram

```text
                 +------------------+
                 |      Client      |
                 | Browser / Mobile |
                 +--------+---------+
                          |
                        HTTPS
                          |
                 +--------v---------+
                 |       DNS        |
                 +--------+---------+
                          |
                 +--------v---------+
                 |       CDN        |
                 | Static assets    |
                 +--------+---------+
                          |
                 +--------v---------+
                 |  Load Balancer   |
                 +----+---------+---+
                      |         |
              +-------v--+   +--v--------+
              | App      |   | App       |
              | Server 1 |   | Server 2  |
              +----+-----+   +-----+-----+
                   |               |
                   +-------+-------+
                           |
               +-----------+-----------+
               |                       |
        +------v------+         +------v------+
        | Cache       |         | Queue       |
        | Redis       |         | Jobs        |
        +------+------+\        +------+------+
               |       \              |
        +------v--------v--+    +------v------+
        | Primary Database |    | Worker      |
        | PostgreSQL       |    | Background  |
        +--------+---------+    +-------------+
                 |
          Replication
                 |
        +--------v---------+
        | Read Replica     |
        | PostgreSQL       |
        +------------------+
```

## 6. Components and Problems They Solve

- **Client:** provides the interface users interact with.
- **DNS:** resolves the application domain to its service endpoint.
- **CDN:** serves static files from geographically distributed locations, reducing latency and origin load.
- **Load balancer:** distributes requests across healthy application servers and routes around failed instances.
- **App servers:** validate requests, enforce permissions, implement business logic, and communicate with the database and cache.
- **Cache (Redis):** stores frequently accessed data temporarily to reduce repeated database reads.
- **Primary database:** stores authoritative user, note, tag, and relationship records and handles writes.
- **Read replica:** serves eligible read queries to reduce read load on the primary database.
- **Queue:** holds asynchronous jobs so slow background tasks do not block user requests.
- **Worker:** processes queued tasks such as notifications, exports, and other background work.

## 7. GET /notes Request Flow

1. The client sends `GET /notes` over HTTPS with its authentication credentials.
2. DNS resolves the domain, and the CDN serves any cacheable static assets; the API request proceeds to the application origin.
3. The load balancer forwards the request to a healthy application server.
4. The server authenticates the user and verifies authorization.
5. The server checks the cache for the user's notes using a key that includes the user identity and relevant query parameters.
6. If the cache contains valid data, the server returns it. Otherwise, the server reads from the read replica when suitable, or from the primary database when fresh data is required.
7. The server caches eligible results with an expiry time and returns a paginated JSON response.
8. The client displays the notes or an appropriate empty or error state.

## 8. POST /notes Request Flow

1. The client sends `POST /notes` with a JSON body containing the title and content.
2. DNS and the load balancer route the request to a healthy application server.
3. The server authenticates the user and validates the request, including the required title and its maximum length.
4. The server writes the new note to the primary database, associating it with the authenticated user.
5. After the database confirms the write, the server invalidates or updates relevant cached note lists.
6. Any non-essential background work is added to the queue for a worker to process.
7. The server responds with `201 Created` and the new note's details.
8. The client displays the new note and a success message.

## 9. Trade-Offs

### Cache speed versus data freshness

Caching reduces database load and improves response times, but cached notes can become stale. Use expiry times and invalidate or update affected cache entries after successful writes. For sensitive or consistency-critical reads, query the primary database.

### Read scaling versus replica lag

Read replicas distribute read traffic, but replication can lag behind the primary database. Use the primary for writes and reads that must immediately reflect a recent change, and use replicas for suitable read-heavy queries.

### More servers versus operating cost

Multiple application servers improve capacity and resilience, but increase infrastructure cost and operational complexity. Start with a modest number of instances and scale based on monitored traffic and load tests.

### Synchronous work versus background jobs

Queues keep slow tasks out of the main request path, but introduce eventual completion and retry complexity. Workers should handle retries safely, and jobs should be idempotent where possible.

## 10. Avoiding Single Points of Failure

- Run at least two application servers across separate failure domains behind a health-checking load balancer.
- Deploy redundant DNS and CDN services through a reliable provider.
- Use managed database high availability or a standby primary with tested failover; a read replica alone is not automatically a failover solution.
- Deploy the cache and queue with suitable replication or managed high-availability options.
- Maintain automated database backups and regularly test restoration.
- Monitor latency, errors, queue depth, replication lag, and resource usage, and alert when thresholds are exceeded.

A resilient system still needs tested recovery procedures; redundancy alone does not guarantee availability.
```
