# XRP Commander

A command-line tool for doing XRP stuff

This is a wrapper around ripple-lib with a focus on adding functions that are generally pretty complex. 

The goal is to add commands over time as needed and have a consistent user experience so it's easy to install and use this tool without always copying and pasting XRP secrets etc.

## Install

```
npm install -g xrp-commander
```

## Run

```
xrp <command> <subcommand>
```

Some config is read from ENV variables if available:

| Var | Description | Default |
|-----|-------------|---------|
| XRP_ADDRESS | The XRP address to use when submitting transactions | None |
| XRP_SECRET | The XRP secret to use when submitting transactions | None |
| XRP_SERVER | The URL of the `rippled` server to connect to | wss://s1.ripple.com:443 |

## Security

Commands that require an XRP secret will look for this in ENV vars first then prompt for it if it's not found.
The XRP address will be derived from the secret if not provided.

## Commands

Inspired by `git` and `npm` commands are grouped by feature and then function (e.g. `escrow create`). Executing a command with no parameters will output details on what is required.

### Escrow

```
xrp escrow <create|release>
```

### Transactions

```
xrp tx <find>
```

### Account Settings

```
xrp account <domain|emailHash>
```

## Contributing

This lib has been intentionally designed for easy contribution. To add a command simply submit a PR that adds a new file in the `./src/commands/` folder.

If you want to to discuss the proposed new feature beforehand log an issue.

## TODOs

 - [ ] Add some tests
 - [ ] Document commands better
 - [ ] Improve interactive input collection and use of named params
 - [ ] Auto-generate docs from command definitions
 - [ ] Setup CI
 
 - Commands
   - [ ] Escrow (Cancel)
   - [ ] Payments
   - [ ] Payment Channels (Create/Monitor/Cleanup etc)