/**
 * Command /ping :
 * - Description: Checks if the bot is online.
 * - Required Permissions: Roles defined in config.adminRoles.
 * - Response: Sends a confirmation that the bot is online.
 */

const { SlashCommandBuilder, MessageFlags } = require("discord.js");
const config = require("../../config.json");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("ping")
		.setDescription("Est-ce que KiRobot est en ligne ?"),
	async execute(interaction) {
		const requiredRoles = config.adminRolesId; // Get roles from config.json
		const memberRoles = interaction.member.roles.cache;
		// Check if the member has all required roles
		if (!requiredRoles.some(roleId => memberRoles.has(roleId))) {
			return interaction.reply({
				content: "❌ Tu n'as pas la permission d'exécuter cette commande. 🤖",
				flags: MessageFlags.Ephemeral
			});
		}
		await interaction.reply({
			content: "Bien en ligne ! 🤖",
			flags: MessageFlags.Ephemeral
		});
	},
};