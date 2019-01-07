import dotenv from 'dotenv';

dotenv.config();

const environmentVariables = {
  GRAPHQL_SERVER_PORT: process.env.GRAPHQL_SERVER_PORT || null,
  MYSQL_HOST: process.env.MYSQL_HOST || null,
  MYSQL_USER: process.env.MYSQL_USER || null,
  MYSQL_PASSWORD: process.env.MYSQL_PASSWORD || null,
  MYSQL_DATABASE: process.env.MYSQL_DATABASE || null,
  MYSQL_CONNECTION_POOL_LIMIT: parseInt(process.env.MYSQL_CONNECTION_POOL_LIMIT, 10) || 10,
  MYSQL_TIMEZONE: process.env.MYSQL_TIMEZONE || 'Z',
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
