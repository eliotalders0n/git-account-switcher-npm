const chalk = require('chalk');
const {
  initConfig,
  getAllAccounts,
  getAccount,
  addAccount,
  removeAccount,
  updateLastUsed,
  getConfigPath
} = require('./config');
const {
  checkDependencies,
  switchGitConfig,
  switchGhAccount,
  getCurrentGitConfig,
  getCurrentGhAccount
} = require('./git-operations');
const {
  setupWizard,
  manualAddAccount,
  listConfiguredAccounts
} = require('./interactive');

/**
 * List all configured accounts
 */
function listAccounts() {
  const accounts = getAllAccounts();

  if (accounts.length === 0) {
    console.log(chalk.yellow('No accounts configured yet.'));
    console.log(`Run ${chalk.cyan('git-switch setup')} to add accounts.`);
    return;
  }

  console.log(chalk.cyan('Configured Accounts:'));
  console.log();

  accounts.forEach((account, index) => {
    console.log(chalk.green(`[${index + 1}] ${account.name}`));
    console.log(`    Git:    ${account.git_name} <${account.git_email}>`);
    console.log(`    GitHub: ${account.gh_username}`);
    console.log();
  });
}

/**
 * Show current account status
 */
function showCurrent() {
  console.log(chalk.cyan('Current Git Configuration:'));
  const gitConfig = getCurrentGitConfig();
  console.log(`  Name:  ${gitConfig.name}`);
  console.log(`  Email: ${gitConfig.email}`);
  console.log();

  console.log(chalk.cyan('Current GitHub CLI Account:'));
  const ghAccount = getCurrentGhAccount();
  console.log(`  ${ghAccount}`);
  console.log();
}

/**
 * Switch to an account
 */
async function switchAccount(accountName, options = {}) {
  const isGlobal = options.global || false;

  const account = getAccount(accountName);

  if (!account) {
    console.log(chalk.red(`Error: Account '${accountName}' not found`));
    console.log(`Run ${chalk.cyan('git-switch list')} to see available accounts.`);
    process.exit(1);
  }

  // Switch git config
  try {
    switchGitConfig(account.git_name, account.git_email, isGlobal);
    const scope = isGlobal ? 'GLOBAL' : 'LOCAL - this repo only';
    console.log(chalk.green(`✓ Switched git config to '${accountName}' (${scope})`));
  } catch (error) {
    console.log(chalk.red(`Error switching git config: ${error.message}`));
    process.exit(1);
  }

  // Switch GitHub CLI account
  console.log();
  console.log(`Switching GitHub CLI to ${account.gh_username}...`);
  const ghSuccess = switchGhAccount(account.gh_username);

  if (ghSuccess) {
    console.log(chalk.green(`✓ GitHub CLI switched to ${account.gh_username}`));
  }

  // Update last used
  updateLastUsed(accountName);

  console.log();
  showCurrent();
}

/**
 * Remove an account
 */
async function removeAccountCommand(accountName) {
  if (!accountName) {
    console.log(chalk.red('Error: Account name required'));
    console.log(`Usage: ${chalk.cyan('git-switch remove <account-name>')}`);
    process.exit(1);
  }

  try {
    removeAccount(accountName);
    console.log(chalk.green(`✓ Removed account '${accountName}'`));
  } catch (error) {
    console.log(chalk.red(`Error: ${error.message}`));
    process.exit(1);
  }
}

/**
 * Add account command
 */
async function addAccountCommand() {
  await manualAddAccount();
}

/**
 * Setup command
 */
async function setup() {
  await setupWizard();
}

/**
 * Initialize the application
 */
function init() {
  // Check dependencies
  const deps = checkDependencies();
  const missingDeps = [];

  if (!deps.git) missingDeps.push('git');
  if (!deps.gh) missingDeps.push('gh (GitHub CLI) - optional for GitHub account switching');

  if (missingDeps.length > 0 && !deps.git) {
    console.log(chalk.red('Error: Missing required dependencies:'));
    missingDeps.forEach(dep => console.log(`  - ${dep}`));
    console.log();
    console.log('Please install missing dependencies:');
    console.log('  - git: https://git-scm.com/downloads');
    console.log('  - gh: https://cli.github.com/');
    process.exit(1);
  }

  // Initialize config
  initConfig();
}

module.exports = {
  init,
  setup,
  listAccounts,
  showCurrent,
  switchAccount,
  addAccountCommand,
  removeAccountCommand,
  getConfigPath
};
