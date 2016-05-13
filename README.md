# README

## How does it work?

### Chrome extension

The Chrome extension must be installed in Chrome browser. It will send requests to the Backend Automator using Socket.io, then receive and display the response.

### Backend Automator

The backend Automator is a NodeJS script continuously running in the background and listening on port 7500 using a lightweight HTTP server. It executes the command ordered by the Chrome extension either in the local host (commands using Sencha CMD) or in the VM (backend tasks) via SSH.

## Getting started
1. Clone this repo somewhere on your computer.
2. Install the Chrome extension in your browser:
   * Open [chrome://extensions/](chrome://extensions/) in Chrome.
   * Click "Load Unpacked Extension" and select the folder **/extension**
3. Configure the Backend Automator:
   * Open the file **/server/config/config.js** and make sure the variable **LOGALTO_DIR** points to your LogAlto directory.
   _Should be the path relative to your home directory._
4. Install NPM dependencies:
   * Open the terminal, navigate to the extension directory.
   * Run the following command:
   ```
   npm install
   ```
5. [Install Sencha CMD](https://docs.sencha.com/cmd/5.x/intro_to_cmd.html) on your computer (the local host machine, not the VM).
6. Launch the NodeJS server:
   * Open the terminal, navigate to the extension directory.
   * Runs the following commands in your Terminal to launch the Dispatcher.
   ```
   npm start
   ```
    This command must be run each time you restart the computer.
7. Open a LogAlto website in your browser: there should be a new icon button in the lower left corner (inside the menu). Clicking this button will open the extension panel

## Using the extension panel

### Open the panel
   * The launch button appear in the lower left corner of the window on each LogAlto website running locally.
   * Clicking the button toggles an overlay extension panel.

### Launch a task
   * Click on a task to display the task tab.
   * Click **Send command** or double-click on a task name to launch a task.

_You can launch multiple tasks in parallel. When all tasks complete, the page will reload automatically. Also the extension will always clear the cache before reloading. If the database is recreated, the extension will log you out from LogAlto._

### Tenant-aware
The panel automatically recognizes which tenant you are connected to using the URL subdomain.
_Each command sent to the Dispatcher will be executed for this tenant._

You can have multiple tabs open for different tenants. However, keep in mind that if you send a Sencha command, it will be executed for the tenant in the current tab.

### Which tasks to run when you...
_Tasks should be run simultaneously._

#### ... checkout a Git branch
   * Back-end - reset setup
   * Front-end - build all

#### ... open a tab for a different tenant
   * Back-end - load tenant fixtures (if not already done)
   * Front-end - build all

#### ... add web resources (images, fonts)
   * Resources - copy

#### ... update SASS files
   * SASS - compile

#### ... add/remove JS file(s)
   * Javascript - refresh index

#### ... test in production (locally)
   * Front-end - build all
   * Back-end - clear cache

## Add/edit the list of tasks

The list of available tasks is configured in **/server/config/tasks.yml**. This list is parsed and sent to the Chrome extension each time a new LogAlto tab is opened. You can edit this file to add/remove task both in the frontend or the backend. Keep in mind that you'll need to restart the NodeJS server after each change.

## How to edit extension files?

All files for the extension panel are located in the **/src** directory.

   * **/scripts/panel** - AngularJS app for the extension panel
   * **/scripts/background.js** - Script running in the browser background, listening for tab reload
   * **/scripts/content-script.js** - Script injected in the page to remove ExtJS loading mask stuck (partially working)
   * **/scripts/toolbar.js** - Script injected in a page to show the toggle button

There is a Gulp file configured to parse and compress JS and SASS files. The script can be run with the following command:
```
gulp start
```

The updated files from **/src** will be automatically copied to **/extension** with Gulp. Keep in mind that you will need to refresh the extension in Chrome:
   * Open [chrome://extensions/](chrome://extensions/) in Chrome.
   * Click "Refresh" link under the extension name

## Troubleshooting

### Request failed

If the Backend Automator is not running (or crashed), a command executed in Chrome extension panel will promptly display a "Request failed" message. Just runs the launch command for the Backend Automator to fix the problem.

### Request hanging after computer restart

Make sure the Backend Automator is running by executing this command in the extension directory:
```
npm start
```
If no instance is active, just runs the launch command for the Backend Automator to fix the problem.