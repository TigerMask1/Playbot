# PlayBot - Multi-Tenant Discord Bot Platform

## Overview

PlayBot is a comprehensive, customizable Discord bot platform that transforms the original ZooBot into a multi-tenant system where server admins can fully customize every aspect of their bot through a web dashboard.

## Project Structure

```
/
├── src/
│   ├── core/
│   │   ├── database.js      # MongoDB connection and collections
│   │   └── schemas.js       # Data schemas and templates
│   ├── services/
│   │   ├── TenantService.js    # Multi-tenant server management
│   │   ├── CurrencyService.js  # Global/Server currency management
│   │   ├── PermissionService.js # Role-based access control
│   │   └── AuditService.js     # Audit logging
│   ├── api/
│   │   ├── server.js        # Express web server
│   │   ├── middleware/
│   │   │   └── auth.js      # Authentication middleware
│   │   └── routes/
│   │       ├── auth.js      # Discord OAuth2
│   │       ├── servers.js   # Server management
│   │       ├── characters.js
│   │       ├── moves.js
│   │       ├── crates.js
│   │       ├── quests.js
│   │       ├── jobs.js
│   │       ├── drops.js
│   │       ├── battles.js
│   │       ├── events.js
│   │       ├── economy.js
│   │       ├── players.js
│   │       ├── audit.js
│   │       └── admin.js
│   ├── dashboard/
│   │   └── public/
│   │       ├── index.html
│   │       ├── css/style.css
│   │       └── js/app.js
│   ├── bot/                 # Discord bot files (to be integrated)
│   └── main.js              # Application entry point
├── index.js                 # Original bot code (legacy)
├── characters.js            # Default character data
├── moves.js                 # Default move data
└── [other legacy files]
```

## Key Features

### Multi-Tenant Architecture
- Each Discord server gets isolated configuration
- Per-server customization of all game elements
- Server admins manage via web dashboard

### Customizable Elements
- Characters (name, emoji, stats, rarity, abilities)
- Moves (damage, effects, tiers)
- Crates (drop rates, prices, rewards)
- Quests (requirements, rewards)
- Jobs/Work (duration, rewards, cooldowns)
- Economy (currency names, rates, daily rewards)
- Drops (intervals, messages, rates)
- Battles (rewards, rank tiers)
- Events (types, rewards)

### Global Currency System
- PlayCoins and PlayGems as global currencies
- Conversion to server-specific currencies
- Only super admins can create global currency
- Full audit trail for all transactions

### Permission Levels
1. **Super Admin** - Platform-wide control
2. **Server Owner** - Full server control
3. **Server Admin** - Most server settings
4. **Server Moderator** - Limited moderation
5. **Player** - Normal user
6. **Guest** - Unauthenticated

### Web Dashboard Features
- Discord OAuth2 authentication
- Server selection and management
- Visual editors for all game elements
- Player management and statistics
- Economy statistics and currency grants
- Audit log viewing
- Branding customization

## Environment Variables

Required:
- `MONGODB_URI` - MongoDB connection string
- `DISCORD_CLIENT_ID` - Discord OAuth2 application ID
- `DISCORD_CLIENT_SECRET` - Discord OAuth2 secret
- `DISCORD_REDIRECT_URI` - OAuth2 callback URL
- `SESSION_SECRET` - Express session secret
- `DISCORD_BOT_TOKEN` - Bot token for Discord integration

Optional:
- `PORT` - Server port (default: 5000)
- `ADMIN_INIT_KEY` - Secret key for first super admin setup
- `NODE_ENV` - Environment (development/production)

## Database Collections

### Global Collections
- `global_users` - User accounts linked to Discord
- `global_currency_ledger` - All currency transactions
- `global_super_admins` - Super admin list
- `global_audit_log` - Platform-wide audit logs

### Tenant Collections (per-server)
- `server_configs` - Server configuration
- `server_characters` - Custom characters
- `server_moves` - Custom moves
- `server_crates` - Custom crates
- `server_quests` - Custom quests
- `server_jobs` - Custom jobs
- `server_events` - Server events
- `server_shops` - Shop configurations

### User Collections
- `player_data` - Player data per server
- `player_characters` - Player-owned characters
- `player_inventory` - Player inventories

## Running the Application

### Development
```bash
npm install
node src/main.js
```

### Production (Render)
Set environment variables and deploy. The application will:
1. Connect to MongoDB
2. Start the Express dashboard server on port 5000
3. Initialize the Discord bot (when integrated)

## API Endpoints

### Authentication
- `GET /api/auth/login` - Initiate Discord OAuth
- `GET /api/auth/callback` - OAuth callback
- `GET /api/auth/user` - Get current user
- `POST /api/auth/logout` - Log out

### Servers
- `GET /api/servers` - List user's servers
- `POST /api/servers/setup` - Configure new server
- `GET /api/servers/:id` - Get server config
- `PUT /api/servers/:id` - Update server config

### Content Management
All content routes follow pattern:
- `GET /api/{resource}/:serverId` - List all
- `POST /api/{resource}/:serverId` - Create new
- `PUT /api/{resource}/:serverId/:itemId` - Update
- `DELETE /api/{resource}/:serverId/:itemId` - Delete

Resources: characters, moves, crates, quests, jobs, events

### Economy
- `GET /api/economy/:serverId/config` - Get economy config
- `PUT /api/economy/:serverId/config` - Update economy
- `POST /api/economy/:serverId/grant` - Grant currency
- `GET /api/economy/:serverId/stats` - Economy statistics

### Admin (Super Admin only)
- `GET /api/admin/stats` - Platform statistics
- `GET /api/admin/super-admins` - List super admins
- `POST /api/admin/global-currency/grant` - Grant global currency

## Recent Changes

- 2024-11: Initial PlayBot platform architecture
- Created multi-tenant database schema
- Built web dashboard with Discord OAuth2
- Implemented permission system (RBAC)
- Added currency service with audit logging
- Created API routes for all game elements
- Built responsive dashboard UI

- 2025-11-30: Phase 3 Dashboard UI Editors Implementation
  - Added dynamic OAuth redirect URI detection for deployment flexibility
    - Supports DISCORD_REDIRECT_URI env var override
    - Auto-detects Render (RENDER_EXTERNAL_URL)
    - Auto-detects Replit (REPLIT_DOMAINS)
    - Falls back to request headers for other deployments
  - Implemented complete CRUD modal editors for all systems:
    - Moves (showMoveModal, saveMove, editMove, deleteMove)
    - Crates (showCrateModal, saveCrate, editCrate, deleteCrate)
    - Quests (showQuestModal, saveQuest, editQuest, deleteQuest)
    - Jobs (showJobModal, saveJob, editJob, deleteJob)
    - Events (showEventModal, saveEvent, editEvent, deleteEvent)
    - Characters (editCharacter now functional)
  - Added save handlers for all configuration forms:
    - Economy settings (currency names, rates)
    - Daily rewards (coins, gems, streak bonuses)
    - Drop settings (intervals, rates, messages)
    - Battle settings (timeouts, trophy rewards)
    - Server settings (bot name, prefix, channels)
    - Branding settings (embed color, footer, thumbnail)
  - Added player management features:
    - View player details modal
    - Grant currency to players
  - Added super admin management:
    - Grant/deduct global currency
    - Add/remove super admins

- 2025-11-30: Phase 1 Template System Implementation
  - Created ConfigService for centralized configuration management with caching
  - Built comprehensive template system in src/core/templates/:
    - characters.js (52 characters with full stats, rarities, emojis)
    - moves.js (151 moves across low/mid/high/special tiers)
    - crates.js (6 crate types with costs, rewards, drop rates)
    - drops.js (drop system config with timers, costs, messages)
    - quests.js (65 quests with requirements and rewards)
    - jobs.js (5 job types with resources, tools, cooldowns)
    - economy.js (currency names, daily rewards, transfers)
    - battles.js (battle mechanics, ranks, rewards)
    - leveling.js (XP formulas, level requirements, milestone rewards)
    - timers.js (ALL cooldowns and intervals)
    - messages.js (ALL bot messages and embed settings)
    - boosters.js (ST/XP/coin boosters)
    - minigames.js (7 minigame types with all settings)
    - events.js (7 event types with rewards)
    - clans.js (full clan system config)
  - Updated all API routes to use ConfigService:
    - characters.js, moves.js, crates.js, quests.js, jobs.js
    - drops.js, economy.js, battles.js, events.js
  - Implemented template versioning with automatic migration support
  - Added seed-defaults and reset-to-defaults endpoints for all systems
  - Custom configs preserve isCustom flag to survive template updates

## Template System Architecture

### ConfigService (src/services/ConfigService.js)
- Centralized configuration loading with 60-second TTL cache
- Template versioning with automatic migration on version mismatch
- Methods: getCharacters, getMoves, getCrates, getQuests, getJobs, etc.
- All seeding uses bulkWrite with upserts for idempotency
- Custom items (isCustom: true) are preserved during template updates

### Template Version Flow
1. Server first access triggers default seeding
2. templateVersion stored in server_configs
3. On TEMPLATE_VERSION bump, migrations run automatically
4. Only non-custom items are updated during migrations

## Migration Notes

The original ZooBot code (index.js and related files) remains for reference.
Integration with the new multi-tenant system will:
1. Replace hardcoded configurations with database lookups (DONE - ConfigService)
2. Add server context to all operations
3. Use ConfigService for configuration (replaces TenantService for game config)
4. Use CurrencyService for all currency operations
5. Apply PermissionService for access control
