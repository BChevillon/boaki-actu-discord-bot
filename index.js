const fs = require("node:fs");
const path = require("node:path");
const { Client, Collection, Events, GatewayIntentBits } = require("discord.js");
const { token, anecdoteChannelId, anecdoteRoleId, activities } = require("./config.json");
const { handleInteraction } = require("./utils/interactionHandler");
const { startPresenceUpdater } = require("./utils/presenceManager"); 
const { startAnecdoteScheduler } = require("./utils/anecdoteScheduler");
const { startDateScheduler } = require("./utils/dateScheduler");

// Create a new client instance
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.MessageContent
    ]
});

client.commands = new Collection();
const foldersPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(foldersPath);

// Grab all command files
for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		if ("data" in command && "execute" in command) { // Check if the command has the required properties
			client.commands.set(command.data.name, command);
		} else {
			console.warn(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;
	const command = interaction.client.commands.get(interaction.commandName);
	if (!command) { // Command not found
		console.error(`[ERROR] No command found for ${interaction.commandName}.`);
		return;
	}
	try { // Execute the command
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: "Aie, quelque chose s'est mal passé...", flags: MessageFlags.Ephemeral });
		} else {
			await interaction.reply({ content: "Aie, quelque chose s'est mal passé...", flags: MessageFlags.Ephemeral });
		}
	}
});

// Handle button interactions
client.on("interactionCreate", async (interaction) => {
    handleInteraction(interaction, anecdoteRoleId);
});

client.once(Events.ClientReady, readyClient => {
	console.log(`[INFO] Connection : ${readyClient.user.tag}`);
    // Starts updater and schedulers
	startPresenceUpdater(client.user, activities); 
    startAnecdoteScheduler(client, anecdoteChannelId, anecdoteRoleId);
    startDateScheduler(client, anecdoteChannelId, anecdoteRoleId);
});

client.login(token);