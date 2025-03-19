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
  // Find matching channel connection
  const connection = channelConnections.find(conn => conn.discord === message.channelId);
  if (!connection) return;

  try {
    // Get the channel name
    const channelName = message.channel.name;
    
    // Get the display name - handle both bot and user messages
    let displayName;
    if (message.author.bot) {
      displayName = message.author.username; // For bots, use their username
    } else {
      displayName = message.member?.displayName || message.author.username;
    }

    // Get the message content and resolve mentions
    let resolvedContent = message.content;
    
    // Replace role mentions
    resolvedContent = resolvedContent.replace(/<@&(\d+)>/g, (match, roleId) => {
      const role = message.guild.roles.cache.get(roleId);
      return role ? `@${role.name}` : match;
    });
    
    // Replace user mentions
    resolvedContent = resolvedContent.replace(/<@!?(\d+)>/g, (match, userId) => {
      const user = message.guild.members.cache.get(userId);
      return user ? `@${user.displayName}` : match;
    });
    
    // Replace channel mentions
    resolvedContent = resolvedContent.replace(/<#(\d+)>/g, (match, channelId) => {
      const channel = message.guild.channels.cache.get(channelId);
      return channel ? `#${channel.name}` : match;
    });

    // Handle embeds if present
    if (message.embeds.length > 0) {
      const embedContent = message.embeds.map(embed => {
        let content = '';
        if (embed.title) content += `**${embed.title}**\n`;
        if (embed.description) content += `${embed.description}\n`;
        if (embed.fields) {
          content += embed.fields.map(field => `**${field.name}**\n${field.value}`).join('\n\n');
        }
        return content.trim();
      }).join('\n\n');
      
      resolvedContent = resolvedContent + (resolvedContent ? '\n\n' : '') + embedContent;
    }

    // Format the message with channel name and display name
    const formattedMessage = `[#${channelName}] **${displayName}**: ${resolvedContent}`;

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