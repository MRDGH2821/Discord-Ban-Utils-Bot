# Mod Commands execution order

1. Command Should be in Guild
2. Convict should be in guild
3. Command user should have permissions
4. Convict should be moderatable
5. Take action

## Implementation status

### Commands

| Name            | Implemented? |
| --------------- | ------------ |
| Ban             | ✅           |
| export ban list | ✅           |
| help            |              |
| import ban list | ✅           |
| kick            | ✅           |
| mass ban        | ✅           |
| mass unban      | ✅           |
| ping            | ✅           |
| settings        | ✅           |
| timeout         | ✅           |
| unban           | ✅           |
| user info       | ✅           |

### Audit Logs

| Log name                   | Implemented? |
| -------------------------- | ------------ |
| Ban                        | ✅           |
| Unban                      | ✅           |
| member exit                | ✅           |
| member join                |              |
| timeout (member update)    |              |
| un timeout (member update) |              |

### Bot Logs

| Log name          | Implemented? |
| ----------------- | ------------ |
| Ban               | ✅           |
| Unban             |              |
| kick              |              |
| timeout           |              |
| un timeout        |              |
| ban list export   | ✅           |
| ban list import   | ✅           |
| unban list import |              |
| settings change   |              |
| ban copy          |              |
| mass ban          | ✅           |
| mass unban        | ✅           |
