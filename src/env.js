import dotenv from 'dotenv';

dotenv.config();

const environmentVariables = {
  GRAPHQL_SERVER_PORT: process.env.GRAPHQL_SERVER_PORT || null,
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
