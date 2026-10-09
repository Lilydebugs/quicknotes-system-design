
const API_URL = "https://jsonplaceholder.typicode.com/posts";

const loadButton = document.getElementById("load-btn");
const statusMessage = document.getElementById("status");
const noteForm = document.getElementById("note-form");
const titleInput = document.getElementById("title-input");
const bodyInput = document.getElementById("body-input");
const submitButton = document.getElementById("submit-btn");
const notesList = document.getElementById("notes-list");

let notes = [];

function setStatus(message, type = "") {
  statusMessage.textContent = message;
  statusMessage.className = type;
}

function setButtonsDisabled(disabled) {
  loadButton.disabled = disabled;
  submitButton.disabled = disabled;

  notesList.querySelectorAll("button").forEach((button) => {
    button.disabled = disabled;
  });
}

async function request(url, options = {}) {
  const response = await fetch(url, options);

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

function renderNotes() {
  notesList.replaceChildren();

  if (notes.length === 0) {
    const emptyMessage = document.createElement("li");
    emptyMessage.textContent = "No notes to display. Load or create a note.";
    notesList.appendChild(emptyMessage);
    return;
  }

  notes.forEach((note) => {
    const item = document.createElement("li");
    const title = document.createElement("h3");
    const body = document.createElement("p");
    const deleteButton = document.createElement("button");

    title.textContent = note.title;
    body.textContent = note.body;
    deleteButton.textContent = "Delete";
    deleteButton.type = "button";
    deleteButton.addEventListener("click", () => deleteNote(note.id));

    item.append(title, body, deleteButton);
    notesList.appendChild(item);
  });
}

async function loadNotes() {
  setButtonsDisabled(true);
  setStatus("Loading notes...");

  try {
    const data = await request(`${API_URL}?_limit=10`);

    notes = Array.isArray(data) ? data : [];
    renderNotes();

    if (notes.length === 0) {
      setStatus("No notes found.", "success");
    } else {
      setStatus(`Successfully loaded ${notes.length} notes.`, "success");
    }
  } catch (error) {
    setStatus(`Could not load notes: ${error.message}`, "error");
  } finally {
    setButtonsDisabled(false);
  }
}

async function createNote(title, body) {
  setButtonsDisabled(true);
  setStatus("Creating note...");

  try {
    const newNote = await request(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        title: title,
        body: body,
        userId: 1
      })
    });

    notes.unshift(newNote);
    renderNotes();
    noteForm.reset();
    setStatus("Note created successfully.", "success");
  } catch (error) {
    setStatus(`Could not create note: ${error.message}`, "error");
  } finally {
    setButtonsDisabled(false);
  }
}

async function deleteNote(id) {
  setButtonsDisabled(true);
  setStatus("Deleting note...");

  try {
    await request(`${API_URL}/${encodeURIComponent(id)}`, {
      method: "DELETE"
    });

    notes = notes.filter((note) => note.id !== id);
    renderNotes();
    setStatus("Note deleted successfully.", "success");
  } catch (error) {
    setStatus(`Could not delete note: ${error.message}`, "error");
  } finally {
    setButtonsDisabled(false);
  }
}

loadButton.addEventListener("click", loadNotes);

noteForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const title = titleInput.value.trim();
  const body = bodyInput.value.trim();

  if (!title) {
    setStatus("Please enter a note title.", "error");
    titleInput.focus();
    return;
  }

  if (title.length > 100) {
    setStatus("The title must not exceed 100 characters.", "error");
    titleInput.focus();
    return;
  }

  if (!body) {
    setStatus("Please enter the note content.", "error");
    bodyInput.focus();
    return;
  }

  await createNote(title, body);
});

renderNotes();
