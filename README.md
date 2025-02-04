# Discord to Slack Bridge

A Node.js application that relays messages between multiple Discord and Slack channels.

## Prerequisites

- Node.js 18 or higher (for local development)
- A Discord bot token and application
- A Slack bot token and workspace access
- Docker and Docker Compose (for containerized deployment)

## Setup

### Local Setup

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy the `.env.example` file to `.env`:
   ```bash
   cp .env.example .env
   ```
4. Configure your environment variables in `.env`:
   - `DISCORD_TOKEN`: Your Discord bot token
   - `SLACK_BOT_TOKEN`: Your Slack bot token
   - `CHANNEL_CONNECTIONS`: A JSON array of channel pairs, each containing:
     - `discord`: Discord channel ID
     - `slack`: Slack channel ID
   
   Example configuration:
   ```
   CHANNEL_CONNECTIONS=[
     {"discord":"111111111111111111","slack":"C0123456789"},
     {"discord":"222222222222222222","slack":"C9876543210"}
   ]
   ```

### Docker Setup

1. Clone this repository
2. Copy the `.env.example` file to `.env` and configure it as described above
3. Build and start the container:
   ```bash
   docker-compose up -d
   ```

To view logs:
```bash
docker-compose logs -f
```

To stop the container:
```bash
docker-compose down
```

### Discord Bot Setup
1. Go to the [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application
3. Go to the Bot section and create a bot
4. Enable the "Message Content Intent" under Privileged Gateway Intents
5. Copy the bot token and add it to your `.env` file
6. Use the OAuth2 URL Generator to create an invite link with the following permissions:
   - Read Messages/View Channels
   - Send Messages
7. Invite the bot to your server

### Slack Bot Setup
1. Go to your [Slack Apps page](https://api.slack.com/apps)
2. Create a new app
3. Add the following OAuth scopes:
   - `chat:write`
   - `channels:read`
4. Install the app to your workspace
5. Copy the Bot User OAuth Token and add it to your `.env` file

## Running the Application

### Local Development

Development mode with auto-reload:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

### Docker Production

Start the container:
```bash
docker-compose up -d
```

## Features

- Relays messages between multiple Discord and Slack channels
- Supports configurable channel-to-channel connections
- Preserves username information
- Handles basic error cases
- Logs successful message relays and errors
- Containerized deployment with Docker 