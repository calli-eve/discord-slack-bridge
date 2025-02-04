import { Client, Events, GatewayIntentBits } from 'discord.js';
import { WebClient } from '@slack/web-api';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Configure dotenv
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

// Parse channel connections
const channelConnections = JSON.parse(process.env.CHANNEL_CONNECTIONS || '[]');

// Initialize Discord client
const discord = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Initialize Slack client
const slack = new WebClient(process.env.SLACK_BOT_TOKEN);

// Discord bot ready event
discord.once(Events.ClientReady, (client) => {
  console.log(`Discord bot logged in as ${client.user.tag}`);
  console.log(`Monitoring ${channelConnections.length} channel connection(s)`);
  channelConnections.forEach((conn, index) => {
    console.log(`Connection ${index + 1}: Discord(${conn.discord}) -> Slack(${conn.slack})`);
  });
});

// Handle Discord messages
discord.on(Events.MessageCreate, async (message) => {
  // Ignore bot messages
  if (message.author.bot) return;

  // Find matching channel connection
  const connection = channelConnections.find(conn => conn.discord === message.channelId);
  if (!connection) return;

  try {
    // Get the channel name
    const channelName = message.channel.name;
    
    // Get the member's display name (nickname) or fall back to username
    const displayName = message.member?.displayName || message.author.username;

    // Format the message with channel name and display name
    const formattedMessage = `[#${channelName}] **${displayName}**: ${message.content}`;

    // Send message to corresponding Slack channel
    await slack.chat.postMessage({
      channel: connection.slack,
      text: formattedMessage,
      username: 'Discord Bridge',
    });

    console.log(`Message relayed to Slack channel ${connection.slack}: ${formattedMessage}`);
  } catch (error) {
    console.error('Error sending message to Slack:', error);
  }
});

// Error handling
discord.on('error', console.error);

// Login to Discord
discord.login(process.env.DISCORD_TOKEN).catch(console.error); 