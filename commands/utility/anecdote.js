/**
 * Command /anecdote:
 * - Description: Publishes an anecdote from the predefined list.
 * - Required Permissions: Roles defined in config.adminRolesId.
 * - Parameters:
 *   - canal: The channel where the anecdote will be published.
 *   - id: (Optional) The ID of the specific anecdote to publish. If not provided, a random anecdote is selected.
 * - Response: Sends the anecdote content with interactive buttons in the specified channel and confirms the publication.
 */

const { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const fs = require("fs");
const path = require("path");
const config = require("../../config.json");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("anecdote")
        .setDescription("Publie une anecdote depuis la liste.")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .addChannelOption(option =>
            option.setName("canal")
                .setDescription("Le canal où publier l'anecdote")
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option.setName("id")
                .setDescription("ID de l'anecdote à publier")
                .setRequired(false)
        ),

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

        const id = interaction.options.getInteger("id");
        const targetChannel = interaction.options.getChannel("canal");
        try {
            const anecdotes = JSON.parse(fs.readFileSync(path.join(__dirname, "../../data/anecdotes.json")));
            let anecdote;
            if (id) { // If an ID is provided
                anecdote = anecdotes.find(a => a.id === id);
                if (!anecdote) {
                    return interaction.reply({ content: `❌ Anecdote avec l'ID ${id} introuvable.`, ephemeral: true });
                }
            } else {
                anecdote = anecdotes[Math.floor(Math.random() * anecdotes.length)];
            }
            const roleButton = new ButtonBuilder()
                .setCustomId("toggle_dates_role")
                .setLabel("Notifications 🔔")
                .setStyle(ButtonStyle.Primary);
            let row;
            if (anecdote.reference && anecdote.reference.trim() !== "") { // If a reference is provided
                const linkButton = new ButtonBuilder()
                    .setLabel("En savoir plus")
                    .setStyle(ButtonStyle.Link)
                    .setURL(anecdote.reference);
                row = new ActionRowBuilder().addComponents(linkButton, roleButton);
            } else {
                row = new ActionRowBuilder().addComponents(roleButton);
            }

            await targetChannel.send({
                content: `📚 **Anecdote** : ${anecdote.content} <@&${config.anecdoteRoleId}>`,
                components: [row]
            });
            await interaction.reply({
                content: `✅ Anecdote publiée avec succès dans ${targetChannel}.`,
                ephemeral: true
            });
            console.log(`[INFO] Anecdote published successfully, ID : ${anecdote.id}`);
        } catch (error) {
            console.error("[ERROR] An error occurred while publishing the anecdote:", error);
            await interaction.reply({ content: "❌ Une erreur est survenue lors de la publication.", ephemeral: true });
        }
    },
};