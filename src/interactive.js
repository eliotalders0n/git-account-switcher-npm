const inquirer = require('inquirer');
const chalk = require('chalk');
const {
  detectGitConfig,
  detectGhAccounts,
  checkDependencies
} = require('./git-operations');
const {
  addAccount,
  getAllAccounts
} = require('./config');

/**
 * Interactive setup wizard
 */
async function setupWizard() {
  console.log(chalk.cyan('═══════════════════════════════════════════'));
  console.log(chalk.cyan('  Git Account Switcher - Setup Wizard'));
  console.log(chalk.cyan('═══════════════════════════════════════════'));
  console.log();

  // Check dependencies
  const deps = checkDependencies();
  if (!deps.git) {
    console.log(chalk.red('Error: git is not installed'));
    console.log('Please install git from https://git-scm.com/downloads');
    return;
  }

  if (!deps.gh) {
    console.log(chalk.yellow('Warning: GitHub CLI (gh) is not installed'));
    console.log('GitHub account switching will not work without it.');
    console.log('Install from: https://cli.github.com/');
    console.log();
  }

  // Detect existing configuration
  console.log(chalk.blue('Detecting existing accounts...'));
  console.log();

  const gitConfig = detectGitConfig();
  const ghAccounts = detectGhAccounts();

  if (gitConfig) {
    console.log(chalk.green('✓ Found git global config:'));
    console.log(`  Name:  ${gitConfig.name}`);
    console.log(`  Email: ${gitConfig.email}`);
    console.log();
  } else {
    console.log(chalk.yellow('⚠ No git global config found'));
    console.log();
  }

  if (ghAccounts.length > 0) {
    console.log(chalk.green('✓ Found GitHub CLI account(s):'));
    ghAccounts.forEach(account => {
      console.log(`  - ${account}`);
    });
    console.log();
  } else {
    console.log(chalk.yellow('⚠ No authenticated GitHub CLI accounts found'));
    console.log();
  }

  // Main menu
  let continueSetup = true;
  while (continueSetup) {
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        choices: [
          { name: 'Add detected accounts to switcher', value: 'add_detected' },
          { name: 'Manually add a new account', value: 'add_manual' },
          { name: 'Setup git/gh on this machine first', value: 'setup_help' },
          { name: 'List configured accounts', value: 'list' },
          { name: 'Exit setup', value: 'exit' }
        ]
      }
    ]);

    switch (action) {
      case 'add_detected':
        await addDetectedAccounts(gitConfig, ghAccounts);
        break;
      case 'add_manual':
        await manualAddAccount();
        break;
      case 'setup_help':
        showSetupHelp();
        break;
      case 'list':
        listConfiguredAccounts();
        break;
      case 'exit':
        continueSetup = false;
        console.log(chalk.green('Setup complete!'));
        break;
    }

    if (continueSetup && action !== 'exit') {
      console.log();
    }
  }
}

/**
 * Add detected accounts
 */
async function addDetectedAccounts(gitConfig, ghAccounts) {
  console.log();

  if (!gitConfig) {
    console.log(chalk.yellow('No git config detected. Please setup git first (option 3)'));
    console.log();
    return;
  }

  let ghUsername = '';

  if (ghAccounts.length > 0) {
    if (ghAccounts.length === 1) {
      ghUsername = ghAccounts[0];
    } else {
      const { selected } = await inquirer.prompt([
        {
          type: 'list',
          name: 'selected',
          message: 'Multiple GitHub accounts found. Which one matches this git config?',
          choices: ghAccounts
        }
      ]);
      ghUsername = selected;
    }
  } else {
    console.log(chalk.yellow('No GitHub CLI accounts detected.'));
    console.log('You can still add this account and enter your GitHub username manually.');
    console.log();

    const { username } = await inquirer.prompt([
      {
        type: 'input',
        name: 'username',
        message: 'Enter your GitHub username (or press Enter to skip):',
        default: ''
      }
    ]);

    ghUsername = username || 'not-configured';

    if (!username) {
      console.log(chalk.yellow('⚠ Warning: Account will be added without GitHub CLI integration'));
      console.log('  You can authenticate later with: gh auth login');
    }
  }

  const { accountName } = await inquirer.prompt([
    {
      type: 'input',
      name: 'accountName',
      message: 'Account name (e.g., "personal", "work"):',
      validate: input => input.trim() !== '' || 'Account name is required'
    }
  ]);

  try {
    addAccount({
      name: accountName,
      git_name: gitConfig.name,
      git_email: gitConfig.email,
      gh_username: ghUsername
    });
    console.log(chalk.green(`✓ Added account '${accountName}'`));
  } catch (error) {
    console.log(chalk.red(`Error: ${error.message}`));
  }

  console.log();
}

/**
 * Manually add account
 */
async function manualAddAccount() {
  console.log();
  console.log(chalk.cyan('Add New Account Manually'));
  console.log();

  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: 'Account name (e.g., "personal", "work"):',
      validate: input => input.trim() !== '' || 'Account name is required'
    },
    {
      type: 'input',
      name: 'git_name',
      message: 'Git name:',
      validate: input => input.trim() !== '' || 'Git name is required'
    },
    {
      type: 'input',
      name: 'git_email',
      message: 'Git email:',
      validate: input => {
        if (!input.trim()) return 'Git email is required';
        if (!input.includes('@')) return 'Please enter a valid email';
        return true;
      }
    },
    {
      type: 'input',
      name: 'gh_username',
      message: 'GitHub username:',
      validate: input => input.trim() !== '' || 'GitHub username is required'
    }
  ]);

  try {
    addAccount(answers);
    console.log(chalk.green(`✓ Added account '${answers.name}'`));
  } catch (error) {
    console.log(chalk.red(`Error: ${error.message}`));
  }

  console.log();
}

/**
 * Show setup help
 */
function showSetupHelp() {
  console.log();
  console.log(chalk.cyan('Setup Git and GitHub CLI'));
  console.log();
  console.log('To use this tool, you need to configure git and authenticate with GitHub CLI.');
  console.log();
  console.log(chalk.yellow('Step 1: Configure Git'));
  console.log('Run these commands:');
  console.log(chalk.cyan('  git config --global user.name "Your Name"'));
  console.log(chalk.cyan('  git config --global user.email "your.email@example.com"'));
  console.log();
  console.log(chalk.yellow('Step 2: Authenticate GitHub CLI'));
  console.log('Run this command and follow the prompts:');
  console.log(chalk.cyan('  gh auth login'));
  console.log();
  console.log('After completing these steps, run this setup wizard again.');
  console.log();
}

/**
 * List configured accounts
 */
function listConfiguredAccounts() {
  console.log();
  const accounts = getAllAccounts();

  if (accounts.length === 0) {
    console.log(chalk.yellow('No accounts configured yet.'));
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

module.exports = {
  setupWizard,
  manualAddAccount,
  listConfiguredAccounts
};
