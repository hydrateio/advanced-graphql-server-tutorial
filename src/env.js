import dotenv from 'dotenv';

dotenv.config();

const environmentVariables = {
  MYSQL_HOST: process.env.MYSQL_HOST || null,
  MYSQL_USER: process.env.MYSQL_USER || null,
  MYSQL_PASSWORD: process.env.MYSQL_PASSWORD || null,
  MYSQL_DATABASE: process.env.MYSQL_DATABASE || null,
  MYSQL_CONNECTION_POOL_LIMIT: process.env.MYSQL_CONNECTION_POOL_LIMIT ? parseInt(process.env.MYSQL_CONNECTION_POOL_LIMIT, 10) : 10,
  MYSQL_TIMEZONE: process.env.MYSQL_TIMEZONE || 'Z',
  MONGO_URL: process.env.MONGO_URL,
  MONGO_DATABASE: process.env.MONGO_DATABASE,
  MONGO_USER: process.env.MONGO_USER,
  MONGO_PASSWORD: process.env.MONGO_PASSWORD,
  MONGO_CONNECTION_POOL_SIZE: process.env.MONGO_CONNECTION_POOL_SIZE ? parseInt(process.env.MONGO_CONNECTION_POOL_SIZE, 10) : 10,
};

/**
 * Check that all required environment variable have been set and exit server if any are not defined.
 */
const missingEnvs = Object.keys(environmentVariables).filter(key => environmentVariables[key] === null);
const isMissingEnv = missingEnvs.length > 0;

if (isMissingEnv) {
  console.error('The following required environment variables are missing');
  console.error(missingEnvs.join('\n'), '\n');
  process.exit(1);
}

export default environmentVariables;
