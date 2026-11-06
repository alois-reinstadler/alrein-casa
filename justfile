# List recipes
default:
    @just --list

# Install workspace dependencies
install:
    pnpm install

# Run the site locally
dev:
    pnpm dev

# Format check, typecheck and lint every workspace (the merge gate)
check:
    pnpm check

# Build every workspace
build:
    pnpm build

# Format the repo
format:
    pnpm format
