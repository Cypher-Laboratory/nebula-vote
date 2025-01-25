# starknet-opinion-polling

An onChain Private opinion polling Bot for discord and telegram using the Starknet blockchain and Ring Signatures.


# Setup
- Rename the .env.example file to .env and fill in the required fields and add your discord bot token (`DISCORD_TOKEN`) and discord client id (`DISCORD_CLIENT_ID`).
- Run `yarn install` to install the dependencies.
- Run `yarn dev` to start the bot in development mode.
- Run `yarn build` to build the bot.
- Run `yarn start` to start the bot in production mode.

Don't forget to invite the bot in your discord server using the following link: `https://discord.com/oauth2/authorize?client_id=YOUR_CLIENT_ID&scope=bot&permissions=8`

> To deploy the bot commands on discord, run `ts-node src/deploy-commands.ts`.