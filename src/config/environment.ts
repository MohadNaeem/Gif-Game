const localStorageKey = 'environment';
/* eslint-ignore no-shadow */
export enum Environment {
  Development = 'development',
  Production = 'production',
}

if (document.location.href.includes('development')) {
  localStorage.setItem(localStorageKey, Environment.Development);
}

export const ENVIRONMENT =
  process.env.REACT_APP_DEVELOPMENT ||
  (['127.0.0.1', 'localhost'].includes(document.location.hostname) &&
    localStorage.getItem(localStorageKey) === Environment.Development)
    ? Environment.Development
    : Environment.Production;

export const PRODUCTION = ENVIRONMENT === Environment.Production;
export const DEVELOPMENT = ENVIRONMENT === Environment.Development;
