const { execSync } = require('child_process');
const chalk = require('chalk');

/**
 * Execute a shell command and return output
 */
function execCommand(command, options = {}) {
  try {
    // Use shell: true to properly handle stderr redirection (2>&1)
    const output = execSync(command, {
      encoding: 'utf8',
      shell: true,
      stdio: options.silent ? ['pipe', 'pipe', 'pipe'] : 'inherit',
      ...options
    });
    return { success: true, output: output ? output.trim() : '' };
  } catch (error) {
    // Capture both stdout and stderr from the error
    const stdout = error.stdout ? error.stdout.toString().trim() : '';
    const stderr = error.stderr ? error.stderr.toString().trim() : '';
    const combinedOutput = stdout + (stderr ? '\n' + stderr : '');

    return {
      success: false,
      error: error.message,
      output: combinedOutput || '',
      stderr: stderr,
      stdout: stdout
    };
  }
}

/**
 * Check if required dependencies are installed
 */
function checkDependencies() {
  const dependencies = {
    git: false,
    gh: false
  };

  // Check git
  const gitCheck = execCommand('git --version', { silent: true });
  dependencies.git = gitCheck.success;

  // Check gh
  const ghCheck = execCommand('gh --version', { silent: true });
  dependencies.gh = ghCheck.success;

  return dependencies;
}

/**
 * Detect current git global configuration
 */
function detectGitConfig() {
  const nameResult = execCommand('git config --global user.name', { silent: true });
  const emailResult = execCommand('git config --global user.email', { silent: true });

  if (nameResult.success && emailResult.success && nameResult.output && emailResult.output) {
    return {
      name: nameResult.output,
      email: emailResult.output
    };
  }

  return null;
}

/**
 * Detect authenticated GitHub CLI accounts
 */
function detectGhAccounts() {
  const result = execCommand('gh auth status 2>&1', { silent: true });

  // gh auth status outputs to stderr
  let output = result.output || result.stderr || result.stdout || '';

  if (!output) {
    return [];
  }

  // Parse the output to find usernames
  const matches = output.match(/Logged in to.*?as (\S+)/g);

  if (!matches) {
    return [];
  }

  return matches.map(match => {
    const username = match.match(/as (\S+)/);
    return username ? username[1] : null;
  }).filter(Boolean);
}

/**
 * Switch git configuration
 */
function switchGitConfig(gitName, gitEmail, isGlobal = false) {
  const scope = isGlobal ? '--global' : '';

  const nameResult = execCommand(`git config ${scope} user.name "${gitName}"`, { silent: true });
  const emailResult = execCommand(`git config ${scope} user.email "${gitEmail}"`, { silent: true });

  if (!nameResult.success || !emailResult.success) {
    throw new Error('Failed to switch git config');
  }

  return true;
}

/**
 * Switch GitHub CLI account
 */
function switchGhAccount(username) {
  const result = execCommand(`gh auth switch -u "${username}"`, { silent: true });

  if (!result.success) {
    console.log(chalk.yellow('⚠ Failed to switch gh account'));
    console.log(chalk.yellow('  You may need to run: gh auth login'));
    return false;
  }

  return true;
}

/**
 * Get current git configuration
 */
function getCurrentGitConfig() {
  const nameResult = execCommand('git config user.name', { silent: true });
  const emailResult = execCommand('git config user.email', { silent: true });

  return {
    name: nameResult.success ? nameResult.output : 'Not set',
    email: emailResult.success ? emailResult.output : 'Not set'
  };
}

/**
 * Get current GitHub CLI account
 */
function getCurrentGhAccount() {
  const result = execCommand('gh auth status 2>&1', { silent: true });

  // gh auth status returns the output in stderr, and may have non-zero exit code
  // Combine all possible output sources
  let output = '';
  if (result.output) {
    output = result.output;
  } else if (result.stderr) {
    output = result.stderr;
  } else if (result.stdout) {
    output = result.stdout;
  }

  if (!output) {
    return 'Not authenticated';
  }

  // Return the full output with line breaks (like the bash version)
  // Filter only lines that contain "Logged in"
  const lines = output.split('\n').filter(line => line.includes('Logged in'));

  if (lines.length === 0) {
    return 'Not authenticated';
  }

  return lines.join('\n  ');
}

module.exports = {
  checkDependencies,
  detectGitConfig,
  detectGhAccounts,
  switchGitConfig,
  switchGhAccount,
  getCurrentGitConfig,
  getCurrentGhAccount
};
