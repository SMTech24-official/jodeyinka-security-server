import { Client, Environment } from 'square';
import config from '.';
const squareClient = new Client({
  bearerAuthCredentials: {
    accessToken: config.squareup.SQUAREUP_ACCESS_TOKEN as string,
  },
  environment: Environment.Sandbox,
});

export const client = squareClient;
