# ergoc

A modern CLI compiler for ErgoScript, the smart contract language for the [Ergo blockchain](https://ergoplatform.org/en/).

## Features

- ✨ **Effortless Compilation** – Compile ErgoScript contracts with a single, straightforward command.
- 🔄 **Live Watch Mode** – Automatically recompile scripts on file changes for rapid development.
- 🔧 **Flexible Configuration** – Easily adjust output encoding, ErgoTree version, constant segregation, and more to suit your workflow.
- 📦 **Multiple Output Formats** – Generate both raw ErgoTree hex and ready-to-use base58 addresses.
- 🚀 **Fast & Modern** – Built with TypeScript and Bun for speed, reliability, and modern developer experience.

## Installation

```bash
# Install globally via npm
npm install -g ergoc
 
# Or use with npx (no installation required)
npx ergoc script.es
```

## Usage

### Basic Usage

```bash
# Compile an ErgoScript file
ergoc script.es

# Compile with base58 address output
ergoc script.es --encoding base58

# Compile for testnet
ergoc script.es --network testnet

# Compact output (only the compiled result)
ergoc script.es --compact
```

### Command Line Options

```
Usage
  $ ergoc <script-file> [options]

Options
  -w, --watch               Watch for script changes
  -h, --help                Show help
  -v, --version             Show version
  -c, --compact             Compact output
  -e TYPE, --encoding TYPE  ErgoTree output encoding (hex, base58) [default: hex]
  -n TYPE, --network TYPE   Contract network (mainnet, testnet) [default: mainnet]
  --ergotree-version        Output Ergotree version (0, 1, latest) [default: latest]
  --segregate-consts        Segregate output constants [default: true]
  --no-size-info            Don't include size info if ErgoTree version is set to 0
  --verbose                 Enable verbose mode, showing additional information
```

### Examples

```bash
# Basic compilation
ergoc ./contract.es

# Watch mode for development
ergoc ./contract.es --watch

# Compile with hex encoding (default)
ergoc ./contract.es --encoding hex

# Compile with base58 address encoding for testnet
ergoc ./contract.es --encoding base58 --network testnet

# Legacy ErgoTree v0 with verbose output
ergoc ./contract.es --ergotree-version 0 --verbose

# Compact output for scripting
ergoc ./contract.es --compact > compiled.hex
```

## Output Formats

### Hex Encoding (default)
Outputs the compiled ErgoTree as a hexadecimal string:
```
0008cd03b196b003d24302...
```

### Base58 Address Encoding
Outputs a P2S (Pay-to-Script) address that can be used directly:
```
2Z4YBkDsDvQj8BX7xiySFewjitqp2ge9c99jfes2whbtKitZTxdBYqbrVZUvZvKv6aqn9by4kp3LE1c26LCyosFnVnm6b6U1JYvks5pNEJEM...
```

## Configuration

### Supported Encodings
- `hex`, `base16`, `b16` - Hexadecimal output
- `base58`, `b58`, `addr`, `address` - Base58 address output

### Networks
- `mainnet` - Ergo mainnet (default)
- `testnet` - Ergo testnet

### ErgoTree Versions
- `latest` - Latest version (default, currently v1)
- `1` - ErgoTree version 1
- `0` - Legacy ErgoTree version 0

## Development

This project is built with:

- **TypeScript** - Type-safe development
- **Bun** - Fast JavaScript runtime and package manager
- **Biome** - Fast linting and formatting
- **Fleet SDK** - Ergo blockchain development toolkit

### Building from Source

```bash
# Clone the repository
git clone https://github.com/arobsn/ergoc
cd ergoc

# Install dependencies
bun install

# Build the project
bun run build

# Run locally
bun run dev script.es
```

### Scripts

```bash
# Development
bun run dev                # Run CLI in development mode
bun run build              # Build for production

# Testing & Quality
bun run test:unit          # Run unit tests
bun run test:lint          # Check linting
bun run test:format        # Check formatting

# Fixes
bun run fix:lint           # Fix linting issues
bun run fix:format         # Fix formatting issues
```

## License

MIT © [Alison Oliveira](mailto:arobsn@proton.me)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.