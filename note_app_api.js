/***
 * Web Service for Notes APP,
 * API endpoints using Express JS
 */
const express = require("express");
const { toLower, get } = require("lodash");
const fs = require("fs");
const FILE_PATH = "notes.json";

const app = express();
app.use(express.json());

/**
 * Get all notes
 * @returns {Array<{
 * title: String
 * body: String
 * time_added: String
 * }>}
 */
const getAllNotes = () => {
	try {
		const notes = fs.readFileSync(FILE_PATH, "utf8");
		return JSON.parse(notes);
	} catch (error) {
		throw error;
	}
};

/**
 * Save notes
 */
const saveNotes = (notes) => {
	try {
		fs.writeFileSync(FILE_PATH, JSON.stringify(notes), "utf8");
	} catch (error) {
		throw error;
	}
};

/**
 * Save a note
 */
const saveNote = (note) => {
	try {
		const notes = getAllNotes();
		notes.push(note);
		saveNotes(notes);
	} catch (error) {
		throw error;
	}
};

/**
 * Delete a note
 */
const deleteNote = (noteToDelete) => {
	try {
		const notes = getAllNotes();
		const updatedNotes = notes.filter(
			(note) => toLower(note.title) !== toLower(noteToDelete.title)
		);
		saveNotes(updatedNotes);
	} catch (error) {
		throw error;
	}
};

/**
 * Update a note
 */
const updateNote = (updatedNoteBody, title) => {
	try {
		const notes = getAllNotes();
		const noteToUpdate = notes.find(
			(note) => toLower(note.title) === toLower(title)
		);
		noteToUpdate.body = updatedNoteBody.body;
		saveNotes(notes);
	} catch (error) {
		throw error;
	}
};

/**
 * Find a specific note given title
 * @return note as object
 */
const findNote = (title) => {
	const notes = getAllNotes();
	return notes.find((note) => toLower(note.title) === toLower(title));
};

const handleError500 = (error, res) => {
	console.error(error);
	res.status(500).send("Internal Server Error");
};

/***
 * GET /notes: Returns a list of all notes.
 */
app.get("/notes", (req, res) => {
	try {
		const notes = getAllNotes();
		res.json(notes);
	} catch (error) {
		handleError500(error, res);
	}
});

/**
 * POST /notes: Adds a new note.
 * The title and body of the note are provided in the request body.
 */
app.post("/notes", (req, res) => {
	try {
		const newNote = req.body;

		const note = findNote(newNote.title);
		if (note) {
			res.status(400).send("Failed to add, title already exist.");
			return;
		}

		saveNote({
			title: newNote.title,
			body: newNote.body,
			time_added: new Date(),
		});

		res.status(201).send("Note added successfully!");
	} catch (error) {
		handleError500(error, res);
	}
});

/**
 * GET /notes/:title: Returns the note with the given title.
 */
app.get("/notes/:title", (req, res) => {
	try {
		const title = req.params.title;

		const note = findNote(title);
		if (!note) {
			res.status(404).send("Note not found.");
			return; // default is undefined
		}

		res.status(200).send(note);
	} catch (error) {
		handleError500(error, res);
	}
});

/**
 * DELETE /notes/:title: Deletes the note with the given title.
 */
app.delete("/notes/:title", (req, res) => {
	try {
		const title = req.params.title;

		const noteToDelete = findNote(title);
		if (!noteToDelete) {
			res.status(404).send("Note not found.");
		}

		deleteNote(noteToDelete);

		res.status(204).send("Note deleted successfully!");
	} catch (error) {
		handleError500(error, res);
	}
});

/**
 * PUT /notes/:title: Updates the note with the given title.
 * The new body is provided in the request body.
 */
app.put("/notes/:title", (req, res) => {
	try {
		const title = req.params.title;
		const updatedNoteBody = req.body;

		const note = findNote(title);
		if (!note) {
			res.status(400).send("Note not found.");
			return;
		}

		updateNote(updatedNoteBody, title);

		res.status(201).send("Note updated successfully!");
	} catch (error) {
		handleError500(error, res);
	}
});

app.listen(3000, () => {
	console.log("Note Organizer API is listening on port 3000!");
});
