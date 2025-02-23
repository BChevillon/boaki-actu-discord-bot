const { SlashCommandBuilder } = require("discord.js");
const config = require("../../config.json");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("modifiermessage")
		.setDescription("Modifier un message déjà existant écrit par KiRobot.")
		.addChannelOption(option =>
			option
				.setName("canal_source")
				.setDescription("Le canal où se trouve le message dont le contenu sera repris")
				.setRequired(true)
		)
		.addStringOption(option =>
			option
				.setName("source_message_id")
				.setDescription("L'identifiant du message dont le contenu sera repris")
				.setRequired(true)
		)
		.addChannelOption(option =>
			option
				.setName("canal_modification")
				.setDescription("Le canal où se trouve le message à modifier")
				.setRequired(true)
		)
		.addStringOption(option =>
			option
				.setName("message_id")
				.setDescription("L'identifiant du message à modifier")
				.setRequired(true)
		),
	async execute(interaction) {
		const requiredRoles = config.adminRolesId;
		const memberRoles = interaction.member.roles.cache;
		// Check if the member has the required roles
		if (!requiredRoles.some(roleId => memberRoles.has(roleId))) {
			return interaction.reply({
				content: "❌ Tu n'as pas la permission d'exécuter cette commande.",
				ephemeral: true,
			});
		}

		const sourceChannel = interaction.options.getChannel("canal_source");
		const targetChannel = interaction.options.getChannel("canal_modification");
		if (!targetChannel.isTextBased() || !sourceChannel.isTextBased()) { // Verify that both channels are text-based
			return interaction.reply({
				content: "❌ L'un des canaux sélectionnés n'est pas textuel.",
				ephemeral: true,
			});
		}

		const targetMessageId = interaction.options.getString("message_id");
		const sourceMessageId = interaction.options.getString("source_message_id");

		try {
			const targetMessage = await targetChannel.messages.fetch(targetMessageId);
			if (targetMessage.author.id !== interaction.client.user.id) { // Check if the target message was sent by the bot
				return interaction.reply({
					content: "❌ Ce message n'a pas été envoyé par KiRobot.",
					ephemeral: true,
				});
			}
			// Fetch the source message from the specified source channel
			const sourceMessage = await sourceChannel.messages.fetch(sourceMessageId);
			const newContent = sourceMessage.content;
			await targetMessage.edit(newContent); // Edit the target message with the content from the source message
			return interaction.reply({
				content: "✅ Le message a été modifié avec succès.",
				ephemeral: true,
			});
		} catch (error) {
			console.error("[ERROR] Error while executing /modifiermessage command:", error);
			return interaction.reply({
				content: "❌ Une erreur est survenue lors de la modification du message.",
				ephemeral: true,
			});
		}
	},
};
