# Mod Commands execution order

1. Command Should be in Guild
2. Convict should be in guild
3. Command user should have permissions
4. Convict should be moderatable
5. Take action

The following steps are for logs:

1. Check if done by command or not
2. Check settings exist or not
3. Check webhook exists or not
4. Find audit log
5. Find reason
6. Send log

## Implementation status

### Commands

- [x] Ban
- [x] Export Ban List
- [x] Help
- [x] Import Ban List
- [x] Kick
- [x] Mass Ban
- [x] Mass Unban
- [x] Ping
- [x] Settings
- [x] Timeout
- [x] Unban
- [x] User Info

### Audit Logs

- [x] Ban
- [x] Unban
- [x] Member Exit
- [x] Member Join
- [x] Timeout (Member Update)
- [x] Un Timeout (Member Update)

### Bot Logs

- [x] Ban
- [x] Unban
- [x] Kick
- [x] Timeout
- [x] Un Timeout
- [x] Ban List Export
- [x] Ban List Import
- [x] Unban List Import
- [x] Settings Change
- [ ] Ban Copy
- [x] Mass Ban
- [x] Mass Unban
