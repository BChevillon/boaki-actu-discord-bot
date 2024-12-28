const { ActivityType } = require("discord.js");

/**
 * Starts updating the bot's presence with random activities.
 * @param {User} botUser The bot user
 * @param {Array} activities List of activities to display
 */
function startPresenceUpdater(botUser, activities) {
    // Check parameters
    if (!botUser || typeof botUser.setActivity !== "function") { 
        console.error(`[ERROR] bot user is invalid or missing the "setActivity" method : ${botUser}`);
        return;
    }
    if (!Array.isArray(activities) || activities.length === 0) {
        console.error("[ERROR] Invalid or empty activities list.");
        return;
    }

    // Convert activities to Discord.js ActivityType enum
    const formtedActivs = activities.map(activity => ({
        name: activity.name,
        type: ActivityType[activity.type]
    }));

    // Activity update
    const updatePresence = () => {
        const randomIndex = Math.floor(Math.random() * formtedActivs.length);
        const newActivity = formtedActivs[randomIndex];
        try {
            botUser.setActivity(newActivity.name, { type: newActivity.type });
            console.log(`[INFO] Activity updated : ${newActivity.name}`);
        } catch (error) {
            console.error("[ERROR] An error occurred while updating the activity:", error);
        }
    };
    updatePresence();
    setInterval(updatePresence, 60 * 60 * 1000); // Regular update
}

module.exports = { startPresenceUpdater };