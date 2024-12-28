/**
 * Handles button interactions for anecdotes and dates.
 * @param {Interaction} interaction - The interaction object from Discord.js
 * @param {string} roleId - The ID of the role for notifications
 */
async function handleInteraction(interaction, roleId) {
    if (!interaction.isButton()) return;

    if (interaction.customId === "toggle_anecdotes_role" || interaction.customId === "toggle_dates_role") {
        try {
            const member = interaction.member;
            const role = interaction.guild.roles.cache.get(roleId);
            if (!role) { // Role not found
                await interaction.reply({
                    content: "Les notifications sont indisponibles, désolé ! 🤖",
                    ephemeral: true,
                });
                return;
            }

            if (member.roles.cache.has(roleId)) { // Role already assigned
                await member.roles.remove(roleId);
                await interaction.reply({
                    content: "🔕 Anecdotes : les notifications ont été désactivées.",
                    ephemeral: true,
                });
            } else { // Role not assigned
                await member.roles.add(roleId);
                await interaction.reply({
                    content: "🔔 Anecdotes : les notifications ont été activées.",
                    ephemeral: true,
                });
            }
        } catch (error) {
            console.error("[ERROR] An error occurred while handling the interaction:", error);
            await interaction.reply({
                content: "Un problème est survenu, désolé ! 🤖",
                ephemeral: true,
            });
        }
    }
}

module.exports = { handleInteraction };