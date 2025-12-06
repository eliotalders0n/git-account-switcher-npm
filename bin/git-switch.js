#!/usr/bin/env node

const { program } = require('commander');
const chalk = require('chalk');
const {
  init,
  setup,
  listAccounts,
  showCurrent,
  switchAccount,
  addAccountCommand,
  removeAccountCommand,
  getAllAccounts
} = require('../src/index');
const { getAllAccounts: getAccounts } = require('../src/config');

// Initialize the application
init();

// Check if we need to run setup automatically
const accounts = getAccounts();
const shouldAutoSetup = accounts.length === 0;

program
  .name('git-switch')
  .description('Interactive git and GitHub CLI account switcher')
  .version('1.0.0');

program
  .command('setup')
  .description('Run interactive setup wizard')
  .action(async () => {
    await setup();
  });

program
  .command('switch <account>')
  .description('Switch to an account')
  .option('-g, --global', 'Switch globally (default: local repo only)')
  .action(async (account, options) => {
    await switchAccount(account, options);
  });

program
  .command('list')
  .description('List all configured accounts')
  .action(() => {
    listAccounts();
  });

program
  .command('add')
  .description('Manually add a new account')
  .action(async () => {
    await addAccountCommand();
  });

program
  .command('remove <account>')
  .description('Remove an account')
  .action(async (account) => {
    await removeAccountCommand(account);
  });

program
  .command('current')
  .description('Show current git and gh status')
  .action(() => {
    showCurrent();
  });

// Auto-setup if no accounts configured and no command specified
if (shouldAutoSetup && process.argv.length === 2) {
  console.log(chalk.yellow('No accounts configured yet.'));
  console.log('Running setup wizard...\n');
  setup().then(() => process.exit(0));
} else {
  program.parse();
}
