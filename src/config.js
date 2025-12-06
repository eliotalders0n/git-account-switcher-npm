const fs = require('fs');
const path = require('path');
const os = require('os');

const CONFIG_FILE = path.join(os.homedir(), '.git-accounts.json');

/**
 * Initialize config file if it doesn't exist
 */
function initConfig() {
  if (!fs.existsSync(CONFIG_FILE)) {
    const initialConfig = {
      accounts: [],
      last_used: ''
    };
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(initialConfig, null, 2));
    return initialConfig;
  }
  return loadConfig();
}

/**
 * Load configuration from file
 */
function loadConfig() {
  try {
    if (!fs.existsSync(CONFIG_FILE)) {
      return { accounts: [], last_used: '' };
    }
    const data = fs.readFileSync(CONFIG_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading config:', error.message);
    return { accounts: [], last_used: '' };
  }
}

/**
 * Save configuration to file
 */
function saveConfig(config) {
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving config:', error.message);
    return false;
  }
}

/**
 * Get account by name
 */
function getAccount(name) {
  const config = loadConfig();
  return config.accounts.find(acc => acc.name === name);
}

/**
 * Check if account exists
 */
function accountExists(name) {
  return getAccount(name) !== undefined;
}

/**
 * Add new account
 */
function addAccount(account) {
  const config = loadConfig();

  if (accountExists(account.name)) {
    throw new Error(`Account '${account.name}' already exists`);
  }

  config.accounts.push(account);
  saveConfig(config);
  return true;
}

/**
 * Remove account
 */
function removeAccount(name) {
  const config = loadConfig();

  if (!accountExists(name)) {
    throw new Error(`Account '${name}' not found`);
  }

  config.accounts = config.accounts.filter(acc => acc.name !== name);
  saveConfig(config);
  return true;
}

/**
 * Update last used account
 */
function updateLastUsed(name) {
  const config = loadConfig();
  config.last_used = name;
  saveConfig(config);
}

/**
 * Get all accounts
 */
function getAllAccounts() {
  const config = loadConfig();
  return config.accounts;
}

/**
 * Get config file path
 */
function getConfigPath() {
  return CONFIG_FILE;
}

module.exports = {
  initConfig,
  loadConfig,
  saveConfig,
  getAccount,
  accountExists,
  addAccount,
  removeAccount,
  updateLastUsed,
  getAllAccounts,
  getConfigPath
};
