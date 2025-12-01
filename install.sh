#!/bin/bash

# We Buy Any Car - Installation Script for macOS/Linux
# Run this script with: bash install.sh

echo "🚗 We Buy Any Car - Installation Script"
echo "========================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Check if Node.js is installed
echo -e "${YELLOW}Checking Node.js installation...${NC}"
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✓ Node.js $NODE_VERSION found${NC}"
else
    echo -e "${RED}✗ Node.js not found. Please install Node.js 18+ from https://nodejs.org/${NC}"
    exit 1
fi

# Check if npm is installed
echo -e "${YELLOW}Checking npm installation...${NC}"
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo -e "${GREEN}✓ npm $NPM_VERSION found${NC}"
else
    echo -e "${RED}✗ npm not found. Please install Node.js from https://nodejs.org/${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}Installing dependencies...${NC}"
echo -e "${NC}This may take a few minutes...${NC}"

# Install dependencies
npm install

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Dependencies installed successfully!${NC}"
else
    echo -e "${RED}✗ Failed to install dependencies${NC}"
    exit 1
fi

echo ""

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}Creating .env file...${NC}"
    if [ -f "env.example.txt" ]; then
        cp env.example.txt .env
        echo -e "${GREEN}✓ .env file created from env.example.txt${NC}"
        echo -e "${NC}  Note: Edit .env to add your API keys (optional)${NC}"
    else
        echo -e "${YELLOW}⚠ env.example.txt not found, skipping .env creation${NC}"
    fi
else
    echo -e "${GREEN}✓ .env file already exists${NC}"
fi

echo ""
echo -e "${CYAN}========================================${NC}"
echo -e "${GREEN}🎉 Installation Complete!${NC}"
echo -e "${CYAN}========================================${NC}"
echo ""
echo -e "${YELLOW}To start the development server, run:${NC}"
echo -e "${CYAN}  npm run dev${NC}"
echo ""
echo -e "${YELLOW}Then open your browser to:${NC}"
echo -e "${CYAN}  http://localhost:3000${NC}"
echo ""
echo -e "${YELLOW}📚 Documentation:${NC}"
echo -e "${NC}  - Quick Start: QUICKSTART.md${NC}"
echo -e "${NC}  - Setup Guide: SETUP_GUIDE.md${NC}"
echo -e "${NC}  - Features: FEATURES.md${NC}"
echo ""
echo -e "${GREEN}Happy Coding! 🚀${NC}"


