const schedule = require("node-schedule");
const fs = require("fs");
const path = require("path");
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

/**
 * Publishes a random anecdote in a Discord channel with interactive buttons.
 */
function startAnecdoteScheduler(client, channelId, roleId) {
    schedule.scheduleJob("0 12 * * 1", async () => {
        try {
            const channel = await client.channels.fetch(channelId);
            if (!channel || !channel.isTextBased()) {
                console.error("[ERROR] The specified channel is not found or not text-based.");
                return;
            }

            const anecdotes = JSON.parse(fs.readFileSync(path.join(__dirname, "../data/anecdotes.json")));
            const randomAnecdote = anecdotes[Math.floor(Math.random() * anecdotes.length)];

            const roleButton = new ButtonBuilder()
                .setCustomId("toggle_anecdotes_role")
                .setLabel("Notifications 🔔")
                .setStyle(ButtonStyle.Primary);

            let row;
            if (randomAnecdote.reference.trim() !== "") { // If a reference is provided
                const linkButton = new ButtonBuilder()
                    .setLabel("En savoir plus")
                    .setStyle(ButtonStyle.Link)
                    .setURL(randomAnecdote.reference);
                row = new ActionRowBuilder().addComponents(linkButton, roleButton);
            } else {
                row = new ActionRowBuilder().addComponents(roleButton);
            }

            await channel.send({ // Send the message
                content: `📚 **Anecdote de la semaine** : ${randomAnecdote.content} <@&${roleId}>`,
                components: [row],
            });
            console.log(`[INFO] Anecdote published successfully, ID : ${randomAnecdote.id}`);
        } catch (error) {
            console.error("[ERROR] An error occurred while publishing the anecdote:", error);
        }
    });
}

module.exports = { startAnecdoteScheduler };