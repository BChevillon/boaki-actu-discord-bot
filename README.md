
---

# **Boaki Actu discord bot**

A Node.js project for managing a Discord bot with features like anecdote publishing, announcements, notable date messages, and more. Built using `discord.js`.

This bot was created for the Boaki Actu community, bringing together several hundred players around an old video game.


## **Features**
- Publish predefined anecdotes or choose one at random.
- Send announcements to specified channels with optional interactive buttons.
- Automatically post notable events for the current day.
- Role-based notifications and interactive button management.
- Scheduled tasks for anecdotes and notable dates.


## **Installation**

Clone the repository and install dependencies:

```bash
git clone https://github.com/BChevillon/boaki-actu-discord-bot.git
cd boaki-actu-discord-bot
npm install
```


## **Configuration**

1. **Setup the `config.json` file** in the project directory:
   ```json
   {
        "token": "YOUR_DISCORD_BOT_TOKEN",
        "clientId": "YOUR_DISCORD_CLIENT_ID",
        "guildId": "YOUR_DISCORD_GUILD_ID",
        "adminRolesId": ["ROLE_ID_FOR_ADMIN_1", "ROLE_ID_FOR_ADMIN_2"],
        "anecdoteRoleId": "ROLE_ID_FOR_ANECDOTES",
        "activities": [
            { "name": "ACTIVITY_NAME_1", "type": "ACTIVITY_TYPE_1" },
            { "name": "ACTIVITY_NAME_2", "type": "ACTIVITY_TYPE_2" },
            { "name": "ACTIVITY_NAME_3", "type": "ACTIVITY_TYPE_3" },
            { "name": "ACTIVITY_NAME_4", "type": "ACTIVITY_TYPE_4" }
        ]
    }

   ```
2. Add JSON data files for anecdotes and notable dates:
   - `data/anecdotes.json`
   - `data/notabledate.json`


## **Usage**

### **Run the bot**
Start the bot using:
```bash
node index.js
```

### **Available Commands**

#### `/anecdote`
- **Description**: Publishes an anecdote.
- **Parameters**:
  - `canal`: The target channel.
  - `id` (optional): The ID of a specific anecdote.
- **Example**:
  ```
  /anecdote canal:#general id:3
  ```

#### `/annonce`
- **Description**: Sends an announcement to a target channel.
- **Parameters**:
  - `canal_message`: Source channel of the announcement.
  - `message_id`: ID of the message to announce.
  - `canal_envoi`: Target channel.
  - `everyone` (optional): Mention `@everyone`.
  - `notifications` (optional): Add a notifications button.
- **Example**:
  ```
  /annonce canal_message:#announcements message_id:123456789 canal_envoi:#general everyone:true
  ```

#### `/datenotable`
- **Description**: Publishes a notable event for today.
- **Parameters**:
  - `canal`: The target channel.
- **Example**:
  ```
  /datenotable canal:#general
  ```

#### `/ping`
- **Description**: Checks if the bot is online.
- **Example**:
  ```
  /ping
  ```


## **Custom Schedulers**

### Anecdote Scheduler
Schedules a weekly anecdote publication.
- Configurable via `startAnecdoteScheduler(client, channelId, roleId)`.

### Notable Date Scheduler
Schedules a daily notable event message.
- Configurable via `startDateScheduler(client, channelId, roleId)`.


## **Handling Button Interactions**

Interactive buttons for:
- Notifications: Toggle role for users.
- Links: Add external references.

Use `handleInteraction(interaction, roleId)` to manage button interactions.

## **Examples**

### Adding Activities to the Bot
Activities for the bot are defined in the `config.json` file under the `activities` section. Each activity contains:
- **`name`**: The activity name displayed in the bot’s status.
- **`type`**: The type of activity (`Playing`, `Listening`, `Watching`, or `Streaming`).

For example:
```json
"activities": [
    { "name": "Exploring Boaki", "type": "Playing" },
    { "name": "Sharing Boaki history", "type": "Streaming" },
    { "name": "Guiding new players", "type": "Listening" },
    { "name": "www.univers-kipulkai.fr", "type": "Watching" }
]
```

## **Creator**

This module was created by Benoit CHEVILLON. If you have any questions, feedback, or bug reports, you can open an issue on [GitHub](https://github.com/BChevillon/boaki-actu-discord-bot/issues) or contact via email at benoit.chevillon6@gmail.com.


## **License**

This project is licensed under the [MIT License](https://opensource.org/license/MIT).

---