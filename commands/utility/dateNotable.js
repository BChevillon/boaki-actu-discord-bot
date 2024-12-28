const { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const fs = require("fs");
const path = require("path");
const config = require("../../config.json");

/**
 * Command /datenotable :
 * - Description: Publishes the notable event of the day.
 * - Required Permissions: Roles defined in config.adminRoles.
 * - Parameters:
 *   - canal: The channel where the notable event will be published.
 * - Response: Sends a confirmation that the event was successfully published.
 */

module.exports = {
    data: new SlashCommandBuilder()
        .setName("datenotable")
        .setDescription("Publie l'évènement notable du jour.")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .addChannelOption(option =>
            option.setName("canal")
                .setDescription("Le canal où publier l'évènement notable")
                .setRequired(true)
        ),

    async execute(interaction) {
        const requiredRoles = config.adminRolesId; // Get roles from config.json
        const memberRoles = interaction.member.roles.cache;
        // Check if the member has all required roles
        if (!requiredRoles.every(roleId => memberRoles.has(roleId))) {
            return interaction.reply({
                content: "❌ Vous n'avez pas les permissions nécessaires pour exécuter cette commande",
                ephemeral: true,
            });
        }
        
        const targetChannel = interaction.options.getChannel("canal");
        const today = new Date(); // Current date

        try {
            const dates = JSON.parse(fs.readFileSync(path.join(__dirname, "../../data/notabledate.json")));
            const notableDate = dates.find(d => {
                const eventDate = new Date(d.date);
                return eventDate.getDate() === today.getDate() && eventDate.getMonth() === today.getMonth();
            });
            if (!notableDate) {
                return interaction.some({
                    content: `❌ Aucune évènement notable trouvé pour aujourd"hui`,
                    ephemeral: true,
                });
            }

            const eventDate = new Date(notableDate.date);
            const yearsPassed = today.getFullYear() - eventDate.getFullYear();
            const formattedDate = eventDate.toLocaleDateString("fr-FR");
            const roleButton = new ButtonBuilder()
                .setCustomId("toggle_dates_role")
                .setLabel("Notifications 🔔")
                .setStyle(ButtonStyle.Primary);
            let row;
            if (notableDate.reference && notableDate.reference.trim() !== "") {
                const linkButton = new ButtonBuilder()
                    .setLabel("En savoir plus")
                    .setStyle(ButtonStyle.Link)
                    .setURL(notableDate.reference);
                row = new ActionRowBuilder().addComponents(linkButton, roleButton);
            } else {
                row = new ActionRowBuilder().addComponents(roleButton);
            }

            await targetChannel.send({
                content: `📅 **Date Notable** : ${formattedDate} (il y a ${yearsPassed} ans). <@&${config.anecdoteRoleId}>\n${notableDate.message}`,
                components: [row]
            });
            await interaction.reply({
                content: `✅ Évènement notable publié avec succès dans ${targetChannel}.`,
                ephemeral: true
            });
            console.log(`[INFO] Notable date published successfully for ${formattedDate}.`);
        } catch (error) {
            console.error("[ERROR] Error while executing /datenotable command:", error);
            await interaction.reply({
                content: "❌ Une erreur est survenue lors de l'affichage de l'évènement notable.",
                ephemeral: true,
            });
        }
    },
};
