import jwt, { JsonWebTokenError } from 'jsonwebtoken';
import * as fetch from 'node-fetch';
import env from '../env';

const pubKeyCache = {
  key: null,
  expires: 0,
};

const getSecret = async () => {
  if (!pubKeyCache.key || pubKeyCache.expires < Date.now()) {
    const key = await fetch(env.PUBLIC_JWT_KEY_URL).then(res => res.text());
    const expires = Date.now() + (60 * 60 * 1000); // 60 minutes
    pubKeyCache.key = key;
    pubKeyCache.expires = expires;
  }
  return pubKeyCache.key;
};

const getTokenFromHttpRequest = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return null;
  }
  const [type, credentials] = authHeader.split(' ');
  if (type !== 'Bearer') {
    throw new JsonWebTokenError('INVALID_TOKEN', { message: 'Unsupported Authentication Type' });
  }
  return credentials;
};

export const getUserFromToken = async (token) => {
  const secret = await getSecret();
  const user = jwt.verify(token, secret, {
    algorithm: 'RS256', // Very important when using key pairs!
  });
  return user;
};

export const authMiddleware = async (req, res, next) => {
  try {
    const token = getTokenFromHttpRequest(req);
    if (!token) {
      next();
      return;
    }
    const user = await getUserFromToken(token);
    if (user) {
      req.currentUser = user;
    }
    next();
    return;
  } catch (e) {
    next(e);
  }
};

export const authErrorHandler = (err, req, res, next) => {
  if (err instanceof JsonWebTokenError) {
    res.status(401);
    res.json({
      errors: [{
        message: err.message,
        extensions: {
          code: 'AUTH_TOKEN_ERROR',
        },
      }],
    });
  } else {
    next(err);
  }
};
