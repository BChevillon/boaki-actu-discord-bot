const schedule = require("node-schedule");
const fs = require("fs");
const path = require("path");
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

/**
 * Schedules a message for notable dates with interactive buttons.
 * @param {Client} client - The Discord.js bot instance.
 * @param {string} channelId - The ID of the channel where the messages will be sent.
 * @param {string} roleId - The ID of the role for notifications.
 */
function startDateScheduler(client, channelId, roleId) {
    // Schedule a task to run every day at midnight
    schedule.scheduleJob("0 0 * * *", async () => {
        const today = new Date(); // Current date

        try {
            const dates = JSON.parse(fs.readFileSync(path.join(__dirname, "../data/notabledate.json")));
            const notableDate = dates.find(d => {
                const eventDate = new Date(d.date);
                return eventDate.getDate() === today.getDate() && eventDate.getMonth() === today.getMonth();
            });
            if (!notableDate) {
                console.log(`[INFO] No notable date found for ${today.toLocaleDateString('fr-FR')}.`);
                return;
            }

            const channel = await client.channels.fetch(channelId);
            if (!channel || !channel.isTextBased()) {
                console.error("[ERROR] The specified channel is not found or not text-based.");
                return;
            }

            const eventDate = new Date(notableDate.date);
            const yearsPassed = today.getFullYear() - eventDate.getFullYear();
            const formattedDate = eventDate.toLocaleDateString('fr-FR');
            const roleButton = new ButtonBuilder()
                .setCustomId("toggle_dates_role")
                .setLabel("Notifications")
                .setStyle(ButtonStyle.Primary);
            let row;
            if (notableDate.reference && notableDate.reference.trim() !== "") { // If a reference is provided
                const linkButton = new ButtonBuilder()
                    .setLabel("En savoir plus")
                    .setStyle(ButtonStyle.Link)
                    .setURL(notableDate.reference);
                row = new ActionRowBuilder().addComponents(linkButton, roleButton);
            } else {
                row = new ActionRowBuilder().addComponents(roleButton);
            }

            await channel.send({ // Send the message
                content: `📅 **Date Notable** : ${formattedDate} (il y a ${yearsPassed} ans). <@&${roleId}>\n${notableDate.message}`,
                components: [row],
            });

            console.log(`[INFO] Notable date published successfully for ${formattedDate}.`);
        } catch (error) {
            console.error("[ERROR] An error occurred while publishing the notable date:", error);
        }
    });
}

module.exports = { startDateScheduler };