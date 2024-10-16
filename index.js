import { createBot, Intents } from '@discordeno/bot'
import { getId, getInstagramGraphqlData } from './instagram-graphql.js'
import fetch from 'node-fetch';
import 'dotenv/config'

const bot = createBot({
	token: process.env.TOKEN,
	intents: Intents.Guilds | Intents.GuildMessages | Intents.MessageContent,
	events: {
		ready(data) {
			console.log('logged in as ' + data.user.username)
		},
		async messageCreate(message) {
			if (!message.content || !getId(message.content)) {
				return;
			}
			const data = await getInstagramGraphqlData(message.content);
			if (!data.video_url) {
				return;
			}
			const req = await fetch(data.video_url)
			const blob = await req.blob()
			bot.helpers.sendMessage(message.channelId, {
				files: [{ blob: blob, name: data.shortcode + ".mp4" }],
				messageReference: {
					messageId: message.id
				},
			});
		}
	},
})

bot.transformers.desiredProperties.message.id = true
bot.transformers.desiredProperties.message.content = true
bot.transformers.desiredProperties.message.channelId = true
bot.transformers.desiredProperties.user.username = true

await bot.start();