/**
 * A command-line application using Node.js.
 * This application will serve as a note organizer,
 * where users can add, view, update, delete, and list notes.
 * Each note will possess a unique title, a body, and a timestamp of when it was added.
 */
const { capitalize, replace, toLower } = require("lodash");
const readline = require("readline-sync");
const fs = require("fs");
const FILE_PATH = "notes.json";

/**
 * Read json file and parse to JSON object
 */
const readFile = () => {
	try {
		const notes = fs.readFileSync(FILE_PATH, "utf8");
		return JSON.parse(notes);
	} catch {
		throw "File not found.";
	}
};

/**
 * Write notes to json file
 */
const writeFile = (notes) => {
	try {
		fs.writeFileSync(FILE_PATH, JSON.stringify(notes), "utf8");
	} catch (error) {
		throw error;
	}
};

/**
 * Generic function for getting user input
 * @returns user input as string
 */
const userInput = (key) => {
	message = `Enter note ${key}: `;
	do {
		key = readline.question(message);
	} while (!key);

	return key.trim();
};

/**
 * Add a new note with added time to json file
 * given title and body from user input
 */
const addNote = (notes) => {
	try {
		const title = userInput("title");

		if (notes.length > 0) {
			const note = findNote(notes, title);
			if (note) {
				throw "Failed to add, title already exist.";
			}
		}

		notes.push({
			title: title,
			body: userInput("body"),
			time_added: new Date(),
		});

		writeFile(notes);

		console.log("Note added successfully!\n");
	} catch (error) {
		console.log(error);
	}
};

/**
 * Format note object to desired string format
 * @returns formatted note as string
 */
const formatNote = (note) => {
	noteString = Object.entries(note)
		.map(([key, value]) => `${capitalize(key)}: ${value}`)
		.join("\n");
	return replace(noteString, "Time_added", "Added on");
};

/**
 * List all the notes in desired format
 * from json file
 */
const listNotes = (notes) => {
	if (notes.length <= 0) {
		console.log("Notes is empty.");
		return;
	}
	for (let i = 0; i < notes.length; i++) {
		console.log(`\n${i + 1}. ${formatNote(notes[i])}`);
	}
};

/**
 * Find a specific note given title
 * @return note as object
 */
const findNote = (notes, title) => {
	return notes.find((note) => toLower(note.title) === toLower(title));
};

/**
 * Read a note from json file
 * given note title
 * Display a formatted note as string
 */
const readNote = (notes) => {
	const title = userInput("title");

	const note = findNote(notes, title);
	if (!note) {
		console.log("Note not found.");
		return; // default is undefined
	}

	console.log(`\n${formatNote(note)}`);
};

/**
 * Delete a note from json file
 * given note title
 */
const deleteNote = (notes) => {
	try {
		const title = userInput("title");

		const noteToDelete = findNote(notes, title);
		if (!noteToDelete) {
			throw "Note not found.";
		}

		const updatedNotes = notes.filter(
			(note) => toLower(note.title) !== toLower(title)
		);

		writeFile(updatedNotes);

		console.log("Note deleted successfully!\n");
	} catch (error) {
		console.log(error || "Failed to delete note."); // if error is undefined then message
	}
};

/**
 * Update a note's body in json file
 * given title
 */
const updateNote = (notes) => {
	try {
		const title = userInput("title");

		const noteToUpdate = findNote(notes, title);
		if (!noteToUpdate) {
			throw "Note not found.";
		}

		noteToUpdate.body = userInput("body");

		writeFile(notes);

		console.log("Note updated successfully!");
	} catch (error) {
		console.log(error || "Failed to update note.");
	}
};

/**
 * Display menu choices and
 * get user input choice
 */
const getUserChoice = () => {
	console.log(`   
	Menu
*****************
1. Add a note
2. List all notes
3. Read a note
4. Delete a note
5. Update a note
6. Exit
    `);
	return readline.question("Enter your choice: ").trim();
};

/***
 * Main function for
 * JSON data manipulation,
 * file operations, and
 * object and array handlings.
 */
const main = () => {
	let menuChoice;
	do {
		menuChoice = getUserChoice();

		if (menuChoice === "6") {
			break;
		}

		let notes = [];
		try {
			notes = readFile();
		} catch (error) {
			if (menuChoice !== "1") {
				console.log(error);
				continue;
			}
		}

		switch (menuChoice) {
			case "1":
				addNote(notes);
				break;
			case "2":
				listNotes(notes);
				break;
			case "3":
				readNote(notes);
				break;
			case "4":
				deleteNote(notes);
				break;
			case "5":
				updateNote(notes);
				break;
		}
	} while (menuChoice != "6");
};

main();
