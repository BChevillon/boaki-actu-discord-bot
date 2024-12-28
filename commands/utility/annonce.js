/**
 * Command /annonce:
 * - Description: Sends an announcement from a source message to a target channel.
 * - Required Permissions: Roles defined in config.adminRolesId.
 * - Parameters:
 *   - canal_message: The channel where the source message is located.
 *   - message_id: The ID of the source message to be sent.
 *   - canal_envoi: The target channel where the announcement will be sent.
 *   - everyone: (Optional) Whether to mention @everyone in the announcement.
 *   - notifications: (Optional) Whether to include a "Notifications" button.
 * - Response: Confirms the successful delivery of the announcement or returns an error message.
 */

const { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const config = require("../../config.json");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("annonce")
        .setDescription("Envoyer une annonce dans un canal spécifique.")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages) // Restricts access to moderators/admins
        .addChannelOption(option =>
            option.setName("canal_message")
                .setDescription("Le canal où récupérer le message")
                .setRequired(true))
        .addStringOption(option =>
            option.setName("message_id")
                .setDescription("L'ID du message à envoyer")
                .setRequired(true))
        .addChannelOption(option =>
            option.setName("canal_envoi")
                .setDescription("Le canal où envoyer l'annonce")
                .setRequired(true))
        .addBooleanOption(option =>
            option.setName("everyone")
                .setDescription("Mentionner @everyone ?")
                .setRequired(false))
        .addBooleanOption(option =>
            option.setName("notifications")
                .setDescription("Inclure un bouton Notifications ?")
                .setRequired(false)),

    async execute(interaction) {
        const requiredRoles = config.adminRolesId; // Get roles from config.json
        const memberRoles = interaction.member.roles.cache;
        // Check if the member has all required roles
        if (!requiredRoles.some(roleId => memberRoles.has(roleId))) {
            return interaction.reply({
                content: "❌ Vous n'avez pas les permissions nécessaires pour exécuter cette commande.",
                ephemeral: true,
            });
        }

        const sourceChannel = interaction.options.getChannel("canal_message"); // Source channel
        const messageId = interaction.options.getString("message_id"); // Message ID
        const targetChannel = interaction.options.getChannel("canal_envoi"); // Target channel
        const mentionEveryone = interaction.options.getBoolean("everyone") || false; // Mention @everyone option
        const addNotificationsButton = interaction.options.getBoolean("notifications") || false; // Include Notifications button

        // Verify that the channels are text-based
        if (!sourceChannel.isTextBased() || !targetChannel.isTextBased()) {
            return interaction.reply({
                content: "L'un des canaux sélectionnés n'est pas textuel.",
                ephemeral: true,
            });
        }

        let finalMessage = "";
        let messageAttachments = [];
        try { // Fetch the message from the source channel
            const fetchedMessage = await sourceChannel.messages.fetch(messageId);
            finalMessage = fetchedMessage.content; // Content of the fetched message
            messageAttachments = Array.from(fetchedMessage.attachments.values()); // Attached files
        } catch (error) {
            console.error(error);
            return interaction.reply({
                content: `Impossible de récupérer le message avec l'ID fourni : ${messageId}`,
                ephemeral: true,
            });
        }

        if (mentionEveryone) { // Add the @everyone mention if needed
            finalMessage = `@everyone ${finalMessage}`;
        }

        try {
            // Prepare the message options to send
            const components = [];
            if (addNotificationsButton) {
                const notificationsButton = new ButtonBuilder()
                    .setCustomId("toggle_anecdotes_role")
                    .setLabel("Notifications 🔔")
                    .setStyle(ButtonStyle.Primary);
                components.push(notificationsButton);
            }
            const row = components.length > 0 ? new ActionRowBuilder().addComponents(components) : null;

            const messageOptions = { content: finalMessage, files: messageAttachments };
            if (row) messageOptions.components = [row];

            // Send the announcement in the target channel
            await targetChannel.send(messageOptions);
            await interaction.reply({
                content: `Annonce envoyée avec succès dans ${targetChannel} !`,
                ephemeral: true,
            });
        } catch (error) {
            console.error("[ERROR] An error occurred while sending the announcement:", error);
            await interaction.reply({
                content: "Aie, quelque chose s'est mal passé avec /annonce...",
                ephemeral: true,
            });
        }
    },
};
