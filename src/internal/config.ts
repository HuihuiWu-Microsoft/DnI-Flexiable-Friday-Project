const config = {
  botId: process.env.BOT_ID,
  botPassword: process.env.BOT_PASSWORD,
  storageConnectionString: process.env.WEBSITE_CONTENTAZUREFILECONNECTIONSTRING,
  envName: process.env.TEAMSFX_ENV,
  teamsAppId: process.env.TEAMS_APP_ID,
  openAiKey: process.env.OPENAI_KEY,
  openAiEndpoint: process.env.OPENAI_ENDPOINT,
  openAiDeploymentName: process.env.OPENAI_DEPLOYMENT_NAME,
};

export default config;
