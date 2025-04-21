# Vanilla JS Calorie Tracker

A simple multi-day calorie tracking application built with vanilla HTML, CSS, and JavaScript.

## Features

*   Track daily calorie intake and expenditure.
*   Set daily calorie goals.
*   Log positive (food) and negative (exercise) calorie items.
*   Persists data across browser sessions using `localStorage`.
*   Edit or delete logged items.
*   Start new daily logs.
*   View log history page with net calories per day.
*   Clear log history.
*   Dark theme UI inspired by reference image.

## Running the Application

There are two main ways to run this application:

**1. Simple File Opening (Recommended for basic use)**

*   Navigate to the project directory in your file explorer.
*   Double-click the `index.html` file.
*   This will open the application directly in your default web browser.

**2. Using the Python Development Server**

*   Ensure you have Python 3 installed.
*   Open your terminal or command prompt.
*   Navigate (`cd`) to the project directory (where `server.py` is located).
*   Run the server using the command: `python server.py` (or `python3 server.py` on some systems).
*   Open your web browser and go to `http://localhost:8000` or `http://127.0.0.1:8000`.
*   To stop the server, go back to the terminal and press `Ctrl+C`.

## Files

*   `index.html`: Main application page structure.
*   `logs.html`: Log history page structure.
*   `style.css`: Contains all the styling for both pages.
*   `script.js`: Core application logic for `index.html` (tracking, adding, editing, deleting, multi-day handling, localStorage).
*   `logs.js`: Logic for the log history page (`logs.html`).
*   `server.py`: Simple Python HTTP server for development (optional).
*   `favicon.png`: Application icon displayed in browser tabs.

## Author's Note (From the User)

Just a heads-up, I (the user asking the AI for help!) put this together primarily as a personal tool to track my calories and motivate myself to work out. I know the code might be a bit rough around the edges or "badly built" in places – it's more about getting something functional for motivation than perfect code! 