# mail2rest Node.js App

This application regularly checks a configured IMAP email inbox for new messages with a specific subject (`SIREN`). When such an email is found, it reads the CSV content from the email body, converts it to JSON, and sends the JSON data to a remote REST endpoint.

## Features

- Connects to any IMAP-compatible mail server (e.g., Gmail)
- Searches for unread emails with the subject `SIREN`
- Reads CSV data from the email body (not attachments)
- Converts CSV to JSON
- Sends JSON data to a configurable REST endpoint via HTTP POST
- Marks processed emails as read (or optionally deletes them)
- Configurable via `.env` file

## Requirements

- Node.js (v14 or newer recommended)
- An IMAP-accessible email account

## Installation

1. Clone this repository.
2. Install dependencies:

   ```bash
   npm install
   ```

3. Create the .env file and configure your credentials and endpoints:

```
IMAP_USER=your@email.com
IMAP_PASSWORD=yourpassword
IMAP_HOST=imap.yourmail.com
IMAP_PORT=993
REST_HOST=http://restendpointserver
REST_PORT=5000
REST_PATH=/receive
CHECK_INTERVAL=10000
```

## Usage

Start the application:

   ```bash
   node mail_checker.js
   ```

The app will check for new emails every CHECK_INTERVAL milliseconds.

Notes
- For Gmail, you may need to use an App Password and enable IMAP access.
- The app disables TLS certificate verification for development. Remove or adjust process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"; for production use.
- The REST endpoint must accept POST requests with JSON data.

## License

MIT License