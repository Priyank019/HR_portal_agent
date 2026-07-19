import { createApp } from './app.js';
import { env } from './config/env.js';
import { qdrantService } from './services/qdrant.service.js';

const main = async () => {
  await qdrantService.initialize();

  const app = createApp();

  app.listen(env.PORT, () => {
    console.log(`document-service listening on port ${env.PORT}`);
  });
};

void main().catch((error) => {
  console.error('Failed to start document-service', error);
  process.exit(1);
});
