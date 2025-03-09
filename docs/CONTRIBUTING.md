# Contributing Guidelines

Thank you for your interest in contributing to the Blockchain Intelligence Platform. This document provides guidelines and instructions for setting up the development environment and contributing to the project.

## Development Environment Setup

### Prerequisites

- Node.js (v18 or higher)
- Docker and Docker Compose
- Git

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/HindsightWise/blockchain_intel.git
   cd blockchain_intel
   ```

2. Install dependencies:
   ```
   # Install backend dependencies
   cd backend
   npm install
   
   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. Set up the development environment:
   ```
   # Start the development databases using Docker
   cd ../infrastructure
   docker-compose -f docker-compose.dev.yml up -d
   ```

4. Start the development servers:
   ```
   # In one terminal, start the backend
   cd backend
   npm run dev
   
   # In another terminal, start the frontend
   cd frontend
   npm start
   ```

## Project Structure

Please familiarize yourself with the project structure described in the README.md file before making contributions.

## Coding Standards

### General Guidelines

- Write clean, maintainable, and testable code
- Follow the principle of separation of concerns
- Document your code with appropriate comments
- Write unit tests for all new functionality

### JavaScript/TypeScript

- Use ESLint for linting (configuration provided in the project)
- Follow the Airbnb JavaScript Style Guide
- Use TypeScript for type safety
- Use async/await for asynchronous operations

### React

- Use functional components with hooks
- Follow the container/presentational component pattern
- Use CSS modules or styled-components for styling
- Use React Testing Library for component tests

## Git Workflow

1. Create a new branch for your feature or bugfix:
   ```
   git checkout -b feature/your-feature-name
   ```

2. Make your changes and commit them with descriptive commit messages:
   ```
   git commit -m "Add feature: your feature description"
   ```

3. Push your branch to the repository:
   ```
   git push origin feature/your-feature-name
   ```

4. Create a pull request on GitHub with a detailed description of your changes.

## Code Review Process

All contributions will go through a code review process:

1. All tests must pass
2. Code must follow the project's coding standards
3. At least one maintainer must approve the changes

## Communication

- Use GitHub Issues for bug reports and feature requests
- Use Pull Requests for code-related discussions

Thank you for contributing to the Blockchain Intelligence Platform!