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

- [X] Ban
- [X] Export Ban List
- [ ] Help
- [X] Import Ban List
- [X] Kick
- [X] Mass Ban
- [X] Mass Unban
- [X] Ping
- [X] Settings
- [X] Timeout
- [X] Unban
- [X] User Info

### Audit Logs

- [X] Ban
- [X] Unban
- [X] Member Exit
- [X] Member Join
- [X] Timeout (Member Update)
- [X] Un Timeout (Member Update)

### Bot Logs

- [X] Ban
- [X] Unban
- [X] Kick
- [X] Timeout
- [X] Un Timeout
- [X] Ban List Export
- [X] Ban List Import
- [ ] Unban List Import
- [ ] Settings Change
- [ ] Ban Copy
- [X] Mass Ban
- [X] Mass Unban
