import { createApp } from './app.js';
import { env } from './config/env.js';

const main = async () => {
  const app = createApp();

  app.listen(env.PORT, () => {
    console.log(`chat-service listening on port ${env.PORT}`);
  });
};

void main().catch((error) => {
  console.error('Failed to start chat-service', error);
  process.exit(1);
});