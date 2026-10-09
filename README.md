
# QuickNotes System Design

## Project Description

QuickNotes is a notes application designed to help users create, view, update, delete, and organise notes using tags. This project demonstrates a working HTML, CSS, and JavaScript API client alongside REST API design, relational database modelling, and scalable system architecture.

The API client uses JSONPlaceholder as a demonstration API. The design documents describe a proposed production QuickNotes backend.

## Features

- Load and display notes from an API.
- Create notes with title validation.
- Delete notes.
- Display loading, success, empty, and error messages.
- Document REST endpoints and HTTP status codes.
- Model users, notes, tags, and their relationships.
- Design an architecture for one million registered users.

## Project Structure

```text
quicknotes-system-design/
├── index.html
├── style.css
├── api.js
├── README.md
└── docs/
    ├── api-design.md
    ├── data-model.md
    └── architecture.md
```

## How to Run the API Client

1. Clone or download this repository.
2. Open `index.html` in a modern web browser, or serve the project using a local development server.
3. Click **Load Notes** to retrieve example posts.
4. Enter a title and note content, then click **Create Note**.
5. Click **Delete** on a note to send a delete request.

An internet connection is required because the client uses the JSONPlaceholder API.

JSONPlaceholder simulates create and delete operations. Changes are not permanently stored on its server, and this project does not yet include a production backend.

## Design Documents

- [API Design](docs/api-design.md) — REST endpoints, request and response examples, and error handling.
- [Data Model](docs/data-model.md) — database entities, relationships, SQL statements, indexes, and queries.
- [Architecture](docs/architecture.md) — requirements, load estimates, architecture diagram, request flows, and trade-offs.

## What I Learned

1. **API development:** how GET, POST, and DELETE requests work, and why requests need error handling and input validation.
2. **REST API design:** how HTTP methods, status codes, JSON bodies, and endpoint naming make an API easier to use.
3. **Relational databases:** how primary keys, foreign keys, indexes, and JOIN queries organise related data.
4. **System design:** how load balancers, caches, read replicas, queues, and workers help systems scale.
5. **Git and GitHub:** how to organise project files, commit changes, and maintain a version history.

## Future Improvements

- Build a real backend with persistent database storage.
- Add user authentication and authorisation.
- Implement searching, editing, and tag management.
- Add automated tests and continuous integration.
- Deploy the application and monitor performance.
- 
