# DreamSeed Website Builder

**Version:** 1.3.0

## Setup Instructions

### Environment Variables

This project uses environment variables to store sensitive information. Before running the project:

1. Copy the `.env.example` file to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit the `.env` file and add your GitHub Personal Access Token:
   ```
   GITHUB_TOKEN=your_github_token_here
   ```

3. To generate a new GitHub token:
   - Go to https://github.com/settings/tokens
   - Click "Generate new token (classic)"
   - Give it appropriate permissions (repo, workflow)
   - Copy the token to your `.env` file

### Security Note

**NEVER commit the `.env` file to version control!** It contains sensitive credentials that should remain private. The `.gitignore` file is configured to exclude it.

### Using Environment Variables in n8n Workflows

The JSON workflow files now use `${GITHUB_TOKEN}` as a placeholder. When importing these workflows into n8n:

1. Set up the GitHub token as an environment variable in your n8n instance
2. Or replace `${GITHUB_TOKEN}` with your actual token in the n8n UI (but don't commit this change)

### Website Builder

The `dreamseed_website_builder/` directory contains a Next.js application for building websites based on user profiles.

To run the website builder:
```bash
cd dreamseed_website_builder
npm install
npm run dev
```

The site will be available at http://localhost:3000

## Deployment

### Vercel Deployment

This project is configured for easy deployment on Vercel:

1. Connect your GitHub repository to Vercel
2. The `vercel.json` file contains all necessary configuration
3. Root directory is automatically set to `dreamseed_website_builder`
4. Environment variables are not needed for basic deployment

The project will automatically deploy on every push to the main branch.