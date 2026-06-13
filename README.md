# Codeforces Toolkit

A Chrome extension and Flask backend designed to streamline Codeforces contests and practice sessions.

## Features

### Contest Environment Creation

* One-click contest setup
* Automatically creates contest folders
* Generates problem files (`A.cpp`, `B.cpp`, `C.cpp`, `D.cpp`, `E.cpp`, `F.cpp`, `F1.cpp`, `F2.cpp`, etc.)
* Creates backup files (`temp1.cpp`, `temp2.cpp`, `temp3.cpp`)
* Opens the contest folder in a new VS Code window

### Problem Management

* Open problems A-D
* Open problems A-F
* Open all contest problems in separate tabs
* Keyboard shortcut support

### Integrated Testing

Directly from the Codeforces problem page:

* Compile current solution
* Run all sample tests
* Compare outputs automatically
* Display pass/fail results
* Highlight incorrect outputs
* Show compile errors without leaving the browser

### Contest Progress Tracker

Displays a live contest progress table:

* Accepted submissions
* Wrong submissions
* Submissions currently in queue
* Automatic refresh

### Quality of Life

* Server status indicator
* Dark mode popup UI
* VS Code integration
* Automatic contest tracking

## Tech Stack

Frontend:

* Chrome Extension (Manifest V3)
* JavaScript
* HTML/CSS

Backend:

* Python
* Flask

Tools:

* Git
* VS Code
* g++

## Future Ideas

* Editorial integration
* Stress testing support
* Contest analytics
* Submission workflow improvements

## Author

Henil Shah
