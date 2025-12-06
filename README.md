# Git Account Switcher

[![npm version](https://img.shields.io/npm/v/@variant96/git-account-switcher.svg)](https://www.npmjs.com/package/@variant96/git-account-switcher)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen.svg)](https://nodejs.org/)

A powerful, interactive CLI tool that helps you manage and switch between multiple git and GitHub CLI accounts seamlessly.

---

## Features

- **Auto-detection** - Automatically detects existing git configs and GitHub CLI accounts
- **Interactive Setup** - User-friendly wizard for first-time configuration
- **JSON Configuration** - Stores account settings in `~/.git-accounts.json`
- **Easy Switching** - Switch between accounts with a single command
- **Colored Output** - Clear, colorful terminal output for better readability
- **Validation** - Comprehensive error checking and user feedback
- **NPM Package** - Install globally and use anywhere

## Installation

Install globally using npm:

```bash
npm install -g @variant96/git-account-switcher
```

Or using yarn:

```bash
yarn global add @variant96/git-account-switcher
```

## Prerequisites

- **Node.js** - Version 14.0.0 or higher
- **git** - [Install Git](https://git-scm.com/downloads)
- **gh** (GitHub CLI) - [Install GitHub CLI](https://cli.github.com/) *(optional)*

> **Note:** You can add accounts without GitHub CLI authentication initially. The tool will allow you to enter your GitHub username manually and you can authenticate with `gh auth login` later.

## Quick Start

After installation, run the setup wizard:

```bash
git-switch setup
```

The wizard will guide you through adding your first account. Then start switching:

```bash
# Switch to an account (local - current repo only)
git-switch switch personal

# Switch to an account (global)
git-switch switch work --global
```

## Usage

### Commands

#### Setup
Run the interactive setup wizard:
```bash
git-switch setup
```

#### Switch Accounts
```bash
# Switch to an account (local scope - current repo only)
git-switch switch personal

# Switch to an account (global scope)
git-switch switch work --global
git-switch switch work -g
```

#### List Accounts
```bash
git-switch list
```

#### Show Current Status
```bash
git-switch current
```

#### Add New Account
```bash
git-switch add
```

You'll be prompted to enter:
- Account name (e.g., "personal", "work", "client")
- Git name
- Git email
- GitHub username

#### Remove Account
```bash
git-switch remove <account-name>
```

#### Help
```bash
git-switch --help
```

## Configuration File

Accounts are stored in `~/.git-accounts.json`:

```json
{
  "accounts": [
    {
      "name": "personal",
      "git_name": "John Doe",
      "git_email": "john@personal.com",
      "gh_username": "johndoe"
    },
    {
      "name": "work",
      "git_name": "John Doe",
      "git_email": "john.doe@company.com",
      "gh_username": "johndoe-work"
    }
  ],
  "last_used": "personal"
}
```

## Examples

### Complete Workflow

```bash
# First time - run setup
git-switch setup

# List available accounts
git-switch list

# Switch to work account globally
git-switch switch work -g

# Check current configuration
git-switch current

# Switch to personal account for current repo only
git-switch switch personal

# Add a new client account
git-switch add
```

### Multiple GitHub Accounts

If you have multiple GitHub accounts, you need to authenticate each one with GitHub CLI:

```bash
# Login with first account
gh auth login

# Login with second account (adds to existing)
gh auth login
```

The tool will automatically detect all authenticated accounts during setup.

## How It Works

1. **Account Storage**: Accounts are stored in a JSON file with git and GitHub CLI credentials
2. **Git Switching**: Uses `git config` to set user.name and user.email (local or global)
3. **GitHub CLI Switching**: Uses `gh auth switch` to change the active GitHub account
4. **Synchronization**: Both git and gh are switched together to keep them in sync

## Troubleshooting

### "No accounts configured yet"

Run the setup wizard:
```bash
git-switch setup
```

### "Failed to switch gh account"

Make sure you've authenticated the GitHub account:
```bash
gh auth login
```

### Config file location

The configuration is stored at `~/.git-accounts.json`. You can:
- View it: `cat ~/.git-accounts.json`
- Delete it to start fresh: `rm ~/.git-accounts.json`

### "command not found: git-switch"

If you installed the scoped package, make sure npm's global bin directory is in your PATH:
```bash
npm config get prefix
```
The binaries should be in `<prefix>/bin`.

## Development

### Local Development

Clone the repository and install dependencies:

```bash
git clone https://github.com/eliotalders0n/git-account-switcher.git
cd git-account-switcher-npm
npm install
```

Link the package locally:

```bash
npm link
```

Now you can use `git-switch` command locally for testing.

### Project Structure

```
git-account-switcher-npm/
├── bin/
│   └── git-switch.js       # CLI executable
├── src/
│   ├── config.js           # Configuration management
│   ├── git-operations.js   # Git and GitHub CLI operations
│   ├── interactive.js      # Interactive prompts and setup wizard
│   └── index.js            # Main module exports
├── package.json
└── README.md
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

**eliotalders0n**
- GitHub: [@eliotalders0n](https://github.com/eliotalders0n)

## Support

If you find this tool helpful, please consider:
- Starring the repository
- Reporting bugs
- Suggesting new features
- Sharing with others

---

**Made by developers, for developers**
