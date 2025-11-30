const App = {
  user: null,
  currentServer: null,
  currentSection: 'overview',
  
  async init() {
    try {
      const authCheck = await this.checkAuth();
      
      if (authCheck.authenticated) {
        await this.loadUser();
        this.showDashboard();
      } else {
        this.showLogin();
      }
    } catch (error) {
      console.error('Init error:', error);
      this.showLogin();
    }
    
    document.getElementById('loading').classList.add('hidden');
    this.setupEventListeners();
  },
  
  async checkAuth() {
    const response = await fetch('/api/auth/check');
    return response.json();
  },
  
  async loadUser() {
    const response = await fetch('/api/auth/user');
    if (!response.ok) throw new Error('Failed to load user');
    this.user = await response.json();
    this.updateUserDisplay();
  },
  
  updateUserDisplay() {
    if (!this.user) return;
    
    document.getElementById('user-avatar').src = this.user.avatarUrl;
    document.getElementById('user-name').textContent = this.user.username;
    
    if (this.user.isSuperAdmin) {
      document.querySelector('.super-admin-only').classList.remove('hidden');
    }
    
    this.populateServerSelect();
  },
  
  async populateServerSelect() {
    const select = document.getElementById('server-select');
    select.innerHTML = '<option value="">Select a server...</option>';
    
    try {
      const response = await fetch('/api/servers');
      const data = await response.json();
      
      if (data.configured.length > 0) {
        const configuredGroup = document.createElement('optgroup');
        configuredGroup.label = 'Configured Servers';
        data.configured.forEach(server => {
          const option = document.createElement('option');
          option.value = server.id;
          option.textContent = server.name;
          option.dataset.configured = 'true';
          configuredGroup.appendChild(option);
        });
        select.appendChild(configuredGroup);
      }
      
      if (data.unconfigured.length > 0) {
        const unconfiguredGroup = document.createElement('optgroup');
        unconfiguredGroup.label = 'Unconfigured Servers';
        data.unconfigured.forEach(server => {
          const option = document.createElement('option');
          option.value = server.id;
          option.textContent = `${server.name} (Setup Required)`;
          option.dataset.configured = 'false';
          option.dataset.name = server.name;
          unconfiguredGroup.appendChild(option);
        });
        select.appendChild(unconfiguredGroup);
      }
    } catch (error) {
      console.error('Error loading servers:', error);
      this.showToast('Failed to load servers', 'error');
    }
  },
  
  showLogin() {
    document.getElementById('login-page').classList.remove('hidden');
    document.getElementById('dashboard-page').classList.add('hidden');
  },
  
  showDashboard() {
    document.getElementById('login-page').classList.add('hidden');
    document.getElementById('dashboard-page').classList.remove('hidden');
    document.getElementById('no-server-selected').classList.remove('hidden');
  },
  
  setupEventListeners() {
    document.getElementById('server-select').addEventListener('change', (e) => this.handleServerChange(e));
    
    document.querySelectorAll('.nav-menu a').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const section = e.currentTarget.dataset.section;
        this.switchSection(section);
      });
    });
    
    document.getElementById('logout-btn').addEventListener('click', () => this.logout());
    document.getElementById('refresh-btn').addEventListener('click', () => this.refreshCurrentSection());
    document.getElementById('modal-close').addEventListener('click', () => this.closeModal());
    document.getElementById('modal-overlay').addEventListener('click', (e) => {
      if (e.target === e.currentTarget) this.closeModal();
    });
    
    document.getElementById('add-character-btn')?.addEventListener('click', () => this.showCharacterModal());
    document.getElementById('add-quest-btn')?.addEventListener('click', () => this.showQuestModal());
    document.getElementById('add-job-btn')?.addEventListener('click', () => this.showJobModal());
    document.getElementById('add-crate-btn')?.addEventListener('click', () => this.showCrateModal());
    document.getElementById('add-move-btn')?.addEventListener('click', () => this.showMoveModal());
    document.getElementById('create-event-btn')?.addEventListener('click', () => this.showEventModal());
    
    document.getElementById('economy-form')?.addEventListener('submit', (e) => this.saveEconomyConfig(e));
    document.getElementById('daily-rewards-form')?.addEventListener('submit', (e) => this.saveDailyRewards(e));
    document.getElementById('settings-form')?.addEventListener('submit', (e) => this.saveSettings(e));
    document.getElementById('channels-form')?.addEventListener('submit', (e) => this.saveChannels(e));
    document.getElementById('branding-form')?.addEventListener('submit', (e) => this.saveBranding(e));
    document.getElementById('drops-form')?.addEventListener('submit', (e) => this.saveDropsConfig(e));
    document.getElementById('drop-rates-form')?.addEventListener('submit', (e) => this.saveDropRates(e));
    document.getElementById('drop-messages-form')?.addEventListener('submit', (e) => this.saveDropMessages(e));
    document.getElementById('battles-form')?.addEventListener('submit', (e) => this.saveBattlesConfig(e));
    document.getElementById('trophy-rewards-form')?.addEventListener('submit', (e) => this.saveTrophyRewards(e));
    
    document.getElementById('player-search')?.addEventListener('input', this.debounce((e) => {
      this.loadPlayers(e.target.value);
    }, 300));
    
    document.getElementById('move-tier-filter')?.addEventListener('change', (e) => {
      this.loadMoves(e.target.value);
    });
    
    document.getElementById('grant-global-btn')?.addEventListener('click', () => this.grantGlobalCurrency());
    document.getElementById('deduct-global-btn')?.addEventListener('click', () => this.deductGlobalCurrency());
    document.getElementById('add-super-admin-form')?.addEventListener('submit', (e) => this.addSuperAdmin(e));
    
    document.querySelectorAll('.action-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const action = e.currentTarget.dataset.action;
        this.handleQuickAction(action);
      });
    });
  },
  
  async handleServerChange(e) {
    const serverId = e.target.value;
    const selectedOption = e.target.options[e.target.selectedIndex];
    
    if (!serverId) {
      this.currentServer = null;
      document.getElementById('no-server-selected').classList.remove('hidden');
      document.querySelectorAll('.section').forEach(s => s.classList.add('hidden'));
      return;
    }
    
    if (selectedOption.dataset.configured === 'false') {
      const serverName = selectedOption.dataset.name;
      const confirmed = confirm(`Would you like to set up ${serverName} with PlayBot?`);
      
      if (confirmed) {
        try {
          const response = await fetch('/api/servers/setup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ serverId, serverName })
          });
          
          const result = await response.json();
          
          if (result.success) {
            this.showToast('Server configured successfully!', 'success');
            await this.populateServerSelect();
            document.getElementById('server-select').value = serverId;
          } else {
            this.showToast(result.message || 'Failed to configure server', 'error');
            return;
          }
        } catch (error) {
          this.showToast('Failed to configure server', 'error');
          return;
        }
      } else {
        e.target.value = '';
        return;
      }
    }
    
    try {
      const response = await fetch(`/api/servers/${serverId}`);
      const data = await response.json();
      
      this.currentServer = {
        id: serverId,
        ...data.config,
        permissions: data.permissions
      };
      
      document.getElementById('no-server-selected').classList.add('hidden');
      this.switchSection(this.currentSection);
      this.loadOverviewData();
    } catch (error) {
      console.error('Error loading server:', error);
      this.showToast('Failed to load server', 'error');
    }
  },
  
  switchSection(section) {
    this.currentSection = section;
    
    document.querySelectorAll('.nav-menu a').forEach(link => {
      link.classList.toggle('active', link.dataset.section === section);
    });
    
    document.querySelectorAll('.section').forEach(s => s.classList.add('hidden'));
    
    const sectionEl = document.getElementById(`section-${section}`);
    if (sectionEl) {
      sectionEl.classList.remove('hidden');
    }
    
    document.getElementById('section-title').textContent = this.getSectionTitle(section);
    
    this.loadSectionData(section);
  },
  
  getSectionTitle(section) {
    const titles = {
      overview: 'Overview',
      settings: 'Server Settings',
      branding: 'Branding',
      characters: 'Characters',
      moves: 'Moves',
      crates: 'Crates',
      items: 'Items',
      economy: 'Economy',
      drops: 'Drops',
      battles: 'Battles',
      quests: 'Quests',
      jobs: 'Jobs',
      events: 'Events',
      players: 'Players',
      audit: 'Audit Log',
      admin: 'Super Admin'
    };
    return titles[section] || section;
  },
  
  async loadSectionData(section) {
    if (!this.currentServer && section !== 'admin') return;
    
    switch (section) {
      case 'overview': this.loadOverviewData(); break;
      case 'characters': this.loadCharacters(); break;
      case 'moves': this.loadMoves(); break;
      case 'crates': this.loadCrates(); break;
      case 'quests': this.loadQuests(); break;
      case 'jobs': this.loadJobs(); break;
      case 'economy': this.loadEconomyData(); break;
      case 'drops': this.loadDropsData(); break;
      case 'battles': this.loadBattlesData(); break;
      case 'events': this.loadEvents(); break;
      case 'players': this.loadPlayers(); break;
      case 'audit': this.loadAuditLog(); break;
      case 'settings': this.loadSettings(); break;
      case 'admin': this.loadAdminData(); break;
    }
  },
  
  async loadOverviewData() {
    if (!this.currentServer) return;
    
    try {
      const [playersRes, charsRes, economyRes] = await Promise.all([
        fetch(`/api/players/${this.currentServer.id}/stats/overview`),
        fetch(`/api/characters/${this.currentServer.id}`),
        fetch(`/api/economy/${this.currentServer.id}/stats`)
      ]);
      
      const players = await playersRes.json();
      const characters = await charsRes.json();
      const economy = await economyRes.json();
      
      document.getElementById('stat-players').textContent = players.totalPlayers || 0;
      document.getElementById('stat-characters').textContent = characters.length || 0;
      document.getElementById('stat-coins').textContent = this.formatNumber(economy.totalCoins || 0);
      document.getElementById('stat-active').textContent = players.activePlayers24h || 0;
    } catch (error) {
      console.error('Error loading overview:', error);
    }
  },
  
  async loadCharacters() {
    if (!this.currentServer) return;
    
    try {
      const response = await fetch(`/api/characters/${this.currentServer.id}`);
      const characters = await response.json();
      
      const tbody = document.querySelector('#characters-table tbody');
      tbody.innerHTML = '';
      
      if (characters.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="empty-state">No characters found</td></tr>';
        return;
      }
      
      characters.forEach(char => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${char.emoji || '⭕'}</td>
          <td>${char.name}</td>
          <td><span class="rarity-${char.rarity}">${char.rarity || 'common'}</span></td>
          <td>${char.obtainable || 'crate'}</td>
          <td>HP: ${char.baseStats?.hp || 100} / ATK: ${char.baseStats?.attack || 10}</td>
          <td><span class="status-badge ${char.isActive ? 'active' : 'inactive'}">${char.isActive ? 'Active' : 'Inactive'}</span></td>
          <td class="actions">
            <button class="btn btn-sm btn-outline" onclick="App.editCharacter('${char.characterId}')">Edit</button>
            <button class="btn btn-sm btn-danger" onclick="App.deleteCharacter('${char.characterId}')">Delete</button>
          </td>
        `;
        tbody.appendChild(row);
      });
    } catch (error) {
      console.error('Error loading characters:', error);
      this.showToast('Failed to load characters', 'error');
    }
  },
  
  async loadMoves(tier = null) {
    if (!this.currentServer) return;
    
    try {
      let url = `/api/moves/${this.currentServer.id}`;
      if (tier) url += `?tier=${tier}`;
      
      const response = await fetch(url);
      const moves = await response.json();
      
      const tbody = document.querySelector('#moves-table tbody');
      tbody.innerHTML = '';
      
      if (moves.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="empty-state">No moves found</td></tr>';
        return;
      }
      
      moves.forEach(move => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${move.name}</td>
          <td>${move.damage}</td>
          <td>${move.tier}</td>
          <td>${move.type || 'normal'}</td>
          <td>${move.characterName || '-'}</td>
          <td><span class="status-badge ${move.isActive ? 'active' : 'inactive'}">${move.isActive ? 'Active' : 'Inactive'}</span></td>
          <td class="actions">
            <button class="btn btn-sm btn-outline" onclick="App.editMove('${move.moveId}')">Edit</button>
            <button class="btn btn-sm btn-danger" onclick="App.deleteMove('${move.moveId}')">Delete</button>
          </td>
        `;
        tbody.appendChild(row);
      });
    } catch (error) {
      console.error('Error loading moves:', error);
      this.showToast('Failed to load moves', 'error');
    }
  },
  
  async loadCrates() {
    if (!this.currentServer) return;
    
    try {
      const response = await fetch(`/api/crates/${this.currentServer.id}`);
      const crates = await response.json();
      
      const tbody = document.querySelector('#crates-table tbody');
      tbody.innerHTML = '';
      
      if (crates.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="empty-state">No crates found</td></tr>';
        return;
      }
      
      crates.forEach(crate => {
        const row = document.createElement('tr');
        const price = crate.price?.coins > 0 ? `${crate.price.coins} coins` : `${crate.price?.gems || 0} gems`;
        row.innerHTML = `
          <td>${crate.emoji || '📦'}</td>
          <td>${crate.name}</td>
          <td>${price}</td>
          <td>L: ${crate.dropRates?.legendary || 0}%</td>
          <td><span class="status-badge ${crate.isActive ? 'active' : 'inactive'}">${crate.isActive ? 'Active' : 'Inactive'}</span></td>
          <td class="actions">
            <button class="btn btn-sm btn-outline" onclick="App.editCrate('${crate.crateId}')">Edit</button>
            <button class="btn btn-sm btn-danger" onclick="App.deleteCrate('${crate.crateId}')">Delete</button>
          </td>
        `;
        tbody.appendChild(row);
      });
    } catch (error) {
      console.error('Error loading crates:', error);
      this.showToast('Failed to load crates', 'error');
    }
  },
  
  async loadQuests() {
    if (!this.currentServer) return;
    
    try {
      const response = await fetch(`/api/quests/${this.currentServer.id}`);
      const quests = await response.json();
      
      const tbody = document.querySelector('#quests-table tbody');
      tbody.innerHTML = '';
      
      if (quests.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="empty-state">No quests found</td></tr>';
        return;
      }
      
      quests.forEach(quest => {
        const row = document.createElement('tr');
        const rewards = `${quest.rewards?.coins || 0} coins, ${quest.rewards?.gems || 0} gems`;
        row.innerHTML = `
          <td>${quest.name}</td>
          <td>${quest.type}</td>
          <td>${quest.requirement?.action}: ${quest.requirement?.count}</td>
          <td>${rewards}</td>
          <td><span class="status-badge ${quest.isActive ? 'active' : 'inactive'}">${quest.isActive ? 'Active' : 'Inactive'}</span></td>
          <td class="actions">
            <button class="btn btn-sm btn-outline" onclick="App.editQuest('${quest.questId}')">Edit</button>
            <button class="btn btn-sm btn-danger" onclick="App.deleteQuest('${quest.questId}')">Delete</button>
          </td>
        `;
        tbody.appendChild(row);
      });
    } catch (error) {
      console.error('Error loading quests:', error);
      this.showToast('Failed to load quests', 'error');
    }
  },
  
  async loadJobs() {
    if (!this.currentServer) return;
    
    try {
      const response = await fetch(`/api/jobs/${this.currentServer.id}`);
      const jobs = await response.json();
      
      const tbody = document.querySelector('#jobs-table tbody');
      tbody.innerHTML = '';
      
      if (jobs.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="empty-state">No jobs found</td></tr>';
        return;
      }
      
      jobs.forEach(job => {
        const row = document.createElement('tr');
        const duration = this.formatDuration(job.duration);
        const cooldown = this.formatDuration(job.cooldown);
        const rewards = `${job.rewards?.coins?.min || 0}-${job.rewards?.coins?.max || 0} coins`;
        row.innerHTML = `
          <td>${job.emoji || '💼'}</td>
          <td>${job.name}</td>
          <td>${duration}</td>
          <td>${rewards}</td>
          <td>${cooldown}</td>
          <td><span class="status-badge ${job.isActive ? 'active' : 'inactive'}">${job.isActive ? 'Active' : 'Inactive'}</span></td>
          <td class="actions">
            <button class="btn btn-sm btn-outline" onclick="App.editJob('${job.jobId}')">Edit</button>
            <button class="btn btn-sm btn-danger" onclick="App.deleteJob('${job.jobId}')">Delete</button>
          </td>
        `;
        tbody.appendChild(row);
      });
    } catch (error) {
      console.error('Error loading jobs:', error);
      this.showToast('Failed to load jobs', 'error');
    }
  },
  
  async loadEconomyData() {
    if (!this.currentServer) return;
    
    try {
      const [configRes, statsRes] = await Promise.all([
        fetch(`/api/economy/${this.currentServer.id}/config`),
        fetch(`/api/economy/${this.currentServer.id}/stats`)
      ]);
      
      const config = await configRes.json();
      const stats = await statsRes.json();
      
      if (config.serverCurrency) {
        document.getElementById('coin-name').value = config.serverCurrency.name || 'Coins';
        document.getElementById('coin-emoji').value = config.serverCurrency.emoji || '💰';
      }
      if (config.serverGems) {
        document.getElementById('gem-name').value = config.serverGems.name || 'Gems';
        document.getElementById('gem-emoji').value = config.serverGems.emoji || '💎';
      }
      if (config.globalToServerRate) {
        document.getElementById('playcoin-rate').value = config.globalToServerRate.playCoins || 1;
        document.getElementById('playgem-rate').value = config.globalToServerRate.playGems || 1;
      }
      if (config.dailyReward) {
        document.getElementById('daily-coins').value = config.dailyReward.coins || 100;
        document.getElementById('daily-gems').value = config.dailyReward.gems || 5;
        document.getElementById('streak-enabled').checked = config.dailyReward.streakBonus?.enabled !== false;
        document.getElementById('streak-multiplier').value = config.dailyReward.streakBonus?.multiplier || 0.1;
      }
      
      document.getElementById('economy-total-coins').textContent = this.formatNumber(stats.totalCoins || 0);
      document.getElementById('economy-total-gems').textContent = this.formatNumber(stats.totalGems || 0);
      document.getElementById('economy-avg-coins').textContent = this.formatNumber(Math.round(stats.avgCoins || 0));
      document.getElementById('economy-avg-gems').textContent = this.formatNumber(Math.round(stats.avgGems || 0));
    } catch (error) {
      console.error('Error loading economy data:', error);
    }
  },
  
  async loadDropsData() {
    if (!this.currentServer) return;
    
    try {
      const response = await fetch(`/api/drops/${this.currentServer.id}/config`);
      const config = await response.json();
      
      document.getElementById('drops-enabled').checked = config.enabled !== false;
      document.getElementById('drop-interval').value = (config.interval || 30000) / 1000;
      document.getElementById('catch-timeout').value = (config.catchTimeout || 30000) / 1000;
      document.getElementById('max-drops').value = config.maxDropsPerHour || 120;
      
      if (config.dropRates) {
        document.getElementById('rate-common').value = config.dropRates.common || 60;
        document.getElementById('rate-uncommon').value = config.dropRates.uncommon || 25;
        document.getElementById('rate-rare').value = config.dropRates.rare || 10;
        document.getElementById('rate-epic').value = config.dropRates.epic || 4;
        document.getElementById('rate-legendary').value = config.dropRates.legendary || 1;
      }
      
      if (config.customMessages) {
        document.getElementById('msg-spawn').value = config.customMessages.spawn || '';
        document.getElementById('msg-caught').value = config.customMessages.caught || '';
        document.getElementById('msg-missed').value = config.customMessages.missed || '';
      }
    } catch (error) {
      console.error('Error loading drops data:', error);
    }
  },
  
  async loadBattlesData() {
    if (!this.currentServer) return;
    
    try {
      const response = await fetch(`/api/battles/${this.currentServer.id}/config`);
      const config = await response.json();
      
      document.getElementById('battles-enabled').checked = config.enabled !== false;
      document.getElementById('turn-timeout').value = (config.turnTimeout || 60000) / 1000;
      document.getElementById('max-rounds').value = config.maxRounds || 20;
      
      if (config.trophyRewards) {
        document.getElementById('trophy-win').value = config.trophyRewards.win || 30;
        document.getElementById('trophy-lose').value = config.trophyRewards.lose || -15;
        document.getElementById('trophy-draw').value = config.trophyRewards.draw || 5;
      }
    } catch (error) {
      console.error('Error loading battles data:', error);
    }
  },
  
  async loadEvents() {
    if (!this.currentServer) return;
    
    try {
      const response = await fetch(`/api/events/${this.currentServer.id}/list`);
      const events = await response.json();
      
      const container = document.getElementById('events-list');
      container.innerHTML = '';
      
      if (events.length === 0) {
        container.innerHTML = '<p class="empty-state">No events scheduled</p>';
        return;
      }
      
      events.forEach(event => {
        const card = document.createElement('div');
        card.className = 'event-card';
        card.innerHTML = `
          <h3>${event.name}</h3>
          <p class="event-meta">
            <strong>Type:</strong> ${event.type}<br>
            <strong>Status:</strong> ${event.status}<br>
            <strong>Starts:</strong> ${new Date(event.startAt).toLocaleString()}
          </p>
          <div class="actions" style="margin-top: 0.75rem;">
            <button class="btn btn-sm btn-outline" onclick="App.editEvent('${event.eventId}')">Edit</button>
            <button class="btn btn-sm btn-danger" onclick="App.deleteEvent('${event.eventId}')">Delete</button>
          </div>
        `;
        container.appendChild(card);
      });
    } catch (error) {
      console.error('Error loading events:', error);
    }
  },
  
  async loadPlayers(search = '') {
    if (!this.currentServer) return;
    
    try {
      let url = `/api/players/${this.currentServer.id}`;
      if (search) url += `?search=${encodeURIComponent(search)}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      const tbody = document.querySelector('#players-table tbody');
      tbody.innerHTML = '';
      
      if (data.players.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="empty-state">No players found</td></tr>';
        return;
      }
      
      data.players.forEach(player => {
        const row = document.createElement('tr');
        const lastActive = player.lastActivity ? new Date(player.lastActivity).toLocaleDateString() : 'Never';
        row.innerHTML = `
          <td>${player.username}</td>
          <td>${player.level?.current || 1}</td>
          <td>${player.trophies || 200}</td>
          <td>${this.formatNumber(player.currency?.coins || 0)}</td>
          <td>${this.formatNumber(player.currency?.gems || 0)}</td>
          <td>${lastActive}</td>
          <td class="actions">
            <button class="btn btn-sm btn-outline" onclick="App.viewPlayer('${player.odiscordId}')">View</button>
            <button class="btn btn-sm btn-success" onclick="App.grantPlayerCurrency('${player.odiscordId}')">Grant</button>
          </td>
        `;
        tbody.appendChild(row);
      });
    } catch (error) {
      console.error('Error loading players:', error);
    }
  },
  
  async loadAuditLog() {
    if (!this.currentServer) return;
    
    try {
      const response = await fetch(`/api/audit/${this.currentServer.id}`);
      const logs = await response.json();
      
      const tbody = document.querySelector('#audit-table tbody');
      tbody.innerHTML = '';
      
      if (logs.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="empty-state">No audit logs found</td></tr>';
        return;
      }
      
      logs.forEach(log => {
        const row = document.createElement('tr');
        const time = new Date(log.timestamp).toLocaleString();
        row.innerHTML = `
          <td>${time}</td>
          <td>${log.action}</td>
          <td>${log.username || 'System'}</td>
          <td>${log.targetType || '-'}: ${log.targetId || '-'}</td>
          <td>${log.category || '-'}</td>
        `;
        tbody.appendChild(row);
      });
    } catch (error) {
      console.error('Error loading audit log:', error);
    }
  },
  
  async loadSettings() {
    if (!this.currentServer) return;
    
    document.getElementById('bot-name').value = this.currentServer.botName || 'PlayBot';
    document.getElementById('command-prefix').value = this.currentServer.prefix || '!';
    
    if (this.currentServer.channels) {
      document.getElementById('drops-channel').value = this.currentServer.channels.drops || '';
      document.getElementById('events-channel').value = this.currentServer.channels.events || '';
      document.getElementById('updates-channel').value = this.currentServer.channels.updates || '';
      document.getElementById('battles-channel').value = this.currentServer.channels.battles || '';
    }
    
    const toggleGrid = document.getElementById('feature-toggles');
    toggleGrid.innerHTML = '';
    
    const features = this.currentServer.features || {};
    const featureNames = {
      drops: 'Drops', battles: 'Battles', trading: 'Trading', market: 'Market',
      auctions: 'Auctions', events: 'Events', clans: 'Clans', quests: 'Quests',
      work: 'Work/Jobs', minigames: 'Minigames', trivia: 'Trivia', giveaways: 'Giveaways',
      lotteries: 'Lotteries'
    };
    
    Object.entries(featureNames).forEach(([key, name]) => {
      const item = document.createElement('div');
      item.className = 'toggle-item';
      item.innerHTML = `
        <span>${name}</span>
        <label class="toggle-switch">
          <input type="checkbox" data-feature="${key}" ${features[key] !== false ? 'checked' : ''}>
          <span class="toggle-slider"></span>
        </label>
      `;
      toggleGrid.appendChild(item);
    });
  },
  
  async loadAdminData() {
    if (!this.user?.isSuperAdmin) return;
    
    try {
      const [statsRes, adminsRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/super-admins')
      ]);
      
      const stats = await statsRes.json();
      const admins = await adminsRes.json();
      
      document.getElementById('admin-total-servers').textContent = stats.totalServers || 0;
      document.getElementById('admin-total-users').textContent = stats.totalGlobalUsers || 0;
      document.getElementById('admin-total-players').textContent = stats.totalPlayers || 0;
      
      const adminsList = document.getElementById('super-admins-list');
      adminsList.innerHTML = '';
      
      admins.forEach(admin => {
        const item = document.createElement('div');
        item.className = 'activity-item';
        item.innerHTML = `
          <span class="activity-icon">👑</span>
          <div class="activity-content">
            <strong>${admin.username}</strong>
            <small>ID: ${admin.odiscordId}</small>
          </div>
          <button class="btn btn-sm btn-danger" onclick="App.removeSuperAdmin('${admin.odiscordId}')">Remove</button>
        `;
        adminsList.appendChild(item);
      });
    } catch (error) {
      console.error('Error loading admin data:', error);
    }
  },
  
  showCharacterModal(characterData = null) {
    const isEdit = !!characterData;
    document.getElementById('modal-title').textContent = isEdit ? 'Edit Character' : 'Add Character';
    
    document.getElementById('modal-body').innerHTML = `
      <form id="character-form">
        <div class="form-group">
          <label>Name *</label>
          <input type="text" id="char-name" required value="${characterData?.name || ''}">
        </div>
        <div class="form-group">
          <label>Emoji</label>
          <input type="text" id="char-emoji" value="${characterData?.emoji || '⭕'}">
        </div>
        <div class="form-group">
          <label>Rarity</label>
          <select id="char-rarity">
            <option value="common" ${characterData?.rarity === 'common' ? 'selected' : ''}>Common</option>
            <option value="uncommon" ${characterData?.rarity === 'uncommon' ? 'selected' : ''}>Uncommon</option>
            <option value="rare" ${characterData?.rarity === 'rare' ? 'selected' : ''}>Rare</option>
            <option value="epic" ${characterData?.rarity === 'epic' ? 'selected' : ''}>Epic</option>
            <option value="legendary" ${characterData?.rarity === 'legendary' ? 'selected' : ''}>Legendary</option>
          </select>
        </div>
        <div class="form-group">
          <label>Obtainable From</label>
          <select id="char-obtainable">
            <option value="crate" ${characterData?.obtainable === 'crate' ? 'selected' : ''}>Crate</option>
            <option value="starter" ${characterData?.obtainable === 'starter' ? 'selected' : ''}>Starter</option>
            <option value="drop" ${characterData?.obtainable === 'drop' ? 'selected' : ''}>Drop</option>
            <option value="event" ${characterData?.obtainable === 'event' ? 'selected' : ''}>Event</option>
          </select>
        </div>
        <div class="form-group">
          <label>Base HP</label>
          <input type="number" id="char-hp" value="${characterData?.baseStats?.hp || 100}" min="1">
        </div>
        <div class="form-group">
          <label>Base Attack</label>
          <input type="number" id="char-attack" value="${characterData?.baseStats?.attack || 10}" min="1">
        </div>
        <div class="form-group">
          <label>Base Defense</label>
          <input type="number" id="char-defense" value="${characterData?.baseStats?.defense || 10}" min="1">
        </div>
        <div class="form-group">
          <label>Base Speed</label>
          <input type="number" id="char-speed" value="${characterData?.baseStats?.speed || 10}" min="1">
        </div>
        <div class="form-group">
          <label>Description</label>
          <textarea id="char-description" rows="3">${characterData?.description || ''}</textarea>
        </div>
        <input type="hidden" id="char-id" value="${characterData?.characterId || ''}">
      </form>
    `;
    
    document.getElementById('modal-footer').innerHTML = `
      <button class="btn btn-outline" onclick="App.closeModal()">Cancel</button>
      <button class="btn btn-primary" onclick="App.saveCharacter()">${isEdit ? 'Update' : 'Create'}</button>
    `;
    
    this.openModal();
  },
  
  async saveCharacter() {
    const characterId = document.getElementById('char-id').value;
    const isEdit = !!characterId;
    
    const data = {
      name: document.getElementById('char-name').value,
      emoji: document.getElementById('char-emoji').value,
      rarity: document.getElementById('char-rarity').value,
      obtainable: document.getElementById('char-obtainable').value,
      description: document.getElementById('char-description').value,
      baseStats: {
        hp: parseInt(document.getElementById('char-hp').value),
        attack: parseInt(document.getElementById('char-attack').value),
        defense: parseInt(document.getElementById('char-defense').value),
        speed: parseInt(document.getElementById('char-speed').value)
      }
    };
    
    try {
      const url = isEdit 
        ? `/api/characters/${this.currentServer.id}/${characterId}`
        : `/api/characters/${this.currentServer.id}`;
      
      const response = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      const result = await response.json();
      
      if (result.success || result.character) {
        this.showToast(`Character ${isEdit ? 'updated' : 'created'} successfully!`, 'success');
        this.closeModal();
        this.loadCharacters();
      } else {
        this.showToast(result.error || 'Failed to save character', 'error');
      }
    } catch (error) {
      console.error('Error saving character:', error);
      this.showToast('Failed to save character', 'error');
    }
  },
  
  async deleteCharacter(characterId) {
    if (!confirm('Are you sure you want to delete this character?')) return;
    
    try {
      const response = await fetch(`/api/characters/${this.currentServer.id}/${characterId}`, {
        method: 'DELETE'
      });
      
      const result = await response.json();
      
      if (result.success) {
        this.showToast('Character deleted', 'success');
        this.loadCharacters();
      } else {
        this.showToast(result.error || 'Failed to delete character', 'error');
      }
    } catch (error) {
      console.error('Error deleting character:', error);
      this.showToast('Failed to delete character', 'error');
    }
  },
  
  async logout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.reload();
    } catch (error) {
      console.error('Logout error:', error);
    }
  },
  
  refreshCurrentSection() {
    this.loadSectionData(this.currentSection);
    this.showToast('Refreshed', 'info');
  },
  
  openModal() {
    document.getElementById('modal-overlay').classList.remove('hidden');
  },
  
  closeModal() {
    document.getElementById('modal-overlay').classList.add('hidden');
  },
  
  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    
    setTimeout(() => {
      toast.remove();
    }, 3000);
  },
  
  formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  },
  
  formatDuration(ms) {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  },
  
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },
  
  handleQuickAction(action) {
    switch (action) {
      case 'add-character':
        this.switchSection('characters');
        this.showCharacterModal();
        break;
      case 'create-event':
        this.switchSection('events');
        this.showEventModal();
        break;
      case 'toggle-drops':
        this.switchSection('drops');
        break;
    }
  },

  async editCharacter(characterId) {
    try {
      const response = await fetch(`/api/characters/${this.currentServer.id}/${characterId}`);
      const character = await response.json();
      this.showCharacterModal(character);
    } catch (error) {
      console.error('Error loading character:', error);
      this.showToast('Failed to load character', 'error');
    }
  },

  showMoveModal(moveData = null) {
    const isEdit = !!moveData;
    document.getElementById('modal-title').textContent = isEdit ? 'Edit Move' : 'Add Move';
    
    document.getElementById('modal-body').innerHTML = `
      <form id="move-form">
        <div class="form-group">
          <label>Name *</label>
          <input type="text" id="move-name" required value="${moveData?.name || ''}">
        </div>
        <div class="form-group">
          <label>Damage</label>
          <input type="number" id="move-damage" value="${moveData?.damage || 20}" min="1">
        </div>
        <div class="form-group">
          <label>Tier</label>
          <select id="move-tier">
            <option value="low" ${moveData?.tier === 'low' ? 'selected' : ''}>Low</option>
            <option value="mid" ${moveData?.tier === 'mid' ? 'selected' : ''}>Mid</option>
            <option value="high" ${moveData?.tier === 'high' ? 'selected' : ''}>High</option>
            <option value="special" ${moveData?.tier === 'special' ? 'selected' : ''}>Special</option>
          </select>
        </div>
        <div class="form-group">
          <label>Type</label>
          <select id="move-type">
            <option value="normal" ${moveData?.type === 'normal' ? 'selected' : ''}>Normal</option>
            <option value="special" ${moveData?.type === 'special' ? 'selected' : ''}>Special</option>
            <option value="buff" ${moveData?.type === 'buff' ? 'selected' : ''}>Buff</option>
            <option value="debuff" ${moveData?.type === 'debuff' ? 'selected' : ''}>Debuff</option>
            <option value="heal" ${moveData?.type === 'heal' ? 'selected' : ''}>Heal</option>
          </select>
        </div>
        <div class="form-group">
          <label>Accuracy (%)</label>
          <input type="number" id="move-accuracy" value="${moveData?.accuracy || 100}" min="1" max="100">
        </div>
        <div class="form-group">
          <label>Character (optional)</label>
          <input type="text" id="move-character" value="${moveData?.characterName || ''}" placeholder="Leave empty for universal move">
        </div>
        <div class="form-group">
          <label>Description</label>
          <textarea id="move-description" rows="2">${moveData?.description || ''}</textarea>
        </div>
        <input type="hidden" id="move-id" value="${moveData?.moveId || ''}">
      </form>
    `;
    
    document.getElementById('modal-footer').innerHTML = `
      <button class="btn btn-outline" onclick="App.closeModal()">Cancel</button>
      <button class="btn btn-primary" onclick="App.saveMove()">${isEdit ? 'Update' : 'Create'}</button>
    `;
    
    this.openModal();
  },

  async saveMove() {
    const moveId = document.getElementById('move-id').value;
    const isEdit = !!moveId;
    
    const data = {
      name: document.getElementById('move-name').value,
      damage: parseInt(document.getElementById('move-damage').value),
      tier: document.getElementById('move-tier').value,
      type: document.getElementById('move-type').value,
      accuracy: parseInt(document.getElementById('move-accuracy').value),
      characterName: document.getElementById('move-character').value || null,
      description: document.getElementById('move-description').value
    };
    
    try {
      const url = isEdit 
        ? `/api/moves/${this.currentServer.id}/${moveId}`
        : `/api/moves/${this.currentServer.id}`;
      
      const response = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      const result = await response.json();
      
      if (result.success || result.move) {
        this.showToast(`Move ${isEdit ? 'updated' : 'created'} successfully!`, 'success');
        this.closeModal();
        this.loadMoves();
      } else {
        this.showToast(result.error || 'Failed to save move', 'error');
      }
    } catch (error) {
      console.error('Error saving move:', error);
      this.showToast('Failed to save move', 'error');
    }
  },

  async editMove(moveId) {
    try {
      const response = await fetch(`/api/moves/${this.currentServer.id}/${moveId}`);
      const move = await response.json();
      this.showMoveModal(move);
    } catch (error) {
      console.error('Error loading move:', error);
      this.showToast('Failed to load move', 'error');
    }
  },

  async deleteMove(moveId) {
    if (!confirm('Are you sure you want to delete this move?')) return;
    
    try {
      const response = await fetch(`/api/moves/${this.currentServer.id}/${moveId}`, {
        method: 'DELETE'
      });
      
      const result = await response.json();
      
      if (result.success) {
        this.showToast('Move deleted', 'success');
        this.loadMoves();
      } else {
        this.showToast(result.error || 'Failed to delete move', 'error');
      }
    } catch (error) {
      console.error('Error deleting move:', error);
      this.showToast('Failed to delete move', 'error');
    }
  },

  showCrateModal(crateData = null) {
    const isEdit = !!crateData;
    document.getElementById('modal-title').textContent = isEdit ? 'Edit Crate' : 'Add Crate';
    
    document.getElementById('modal-body').innerHTML = `
      <form id="crate-form">
        <div class="form-group">
          <label>Name *</label>
          <input type="text" id="crate-name" required value="${crateData?.name || ''}">
        </div>
        <div class="form-group">
          <label>Emoji</label>
          <input type="text" id="crate-emoji" value="${crateData?.emoji || '📦'}">
        </div>
        <div class="form-group">
          <label>Type</label>
          <select id="crate-type">
            <option value="common" ${crateData?.type === 'common' ? 'selected' : ''}>Common</option>
            <option value="uncommon" ${crateData?.type === 'uncommon' ? 'selected' : ''}>Uncommon</option>
            <option value="rare" ${crateData?.type === 'rare' ? 'selected' : ''}>Rare</option>
            <option value="epic" ${crateData?.type === 'epic' ? 'selected' : ''}>Epic</option>
            <option value="legendary" ${crateData?.type === 'legendary' ? 'selected' : ''}>Legendary</option>
            <option value="special" ${crateData?.type === 'special' ? 'selected' : ''}>Special</option>
          </select>
        </div>
        <div class="form-group">
          <label>Price (Coins)</label>
          <input type="number" id="crate-price-coins" value="${crateData?.price?.coins || 0}" min="0">
        </div>
        <div class="form-group">
          <label>Price (Gems)</label>
          <input type="number" id="crate-price-gems" value="${crateData?.price?.gems || 0}" min="0">
        </div>
        <h3 style="margin: 1rem 0 0.5rem; grid-column: 1/-1;">Drop Rates (%)</h3>
        <div class="form-group">
          <label>Common</label>
          <input type="number" id="crate-rate-common" value="${crateData?.dropRates?.common || 60}" min="0" max="100">
        </div>
        <div class="form-group">
          <label>Uncommon</label>
          <input type="number" id="crate-rate-uncommon" value="${crateData?.dropRates?.uncommon || 25}" min="0" max="100">
        </div>
        <div class="form-group">
          <label>Rare</label>
          <input type="number" id="crate-rate-rare" value="${crateData?.dropRates?.rare || 10}" min="0" max="100">
        </div>
        <div class="form-group">
          <label>Epic</label>
          <input type="number" id="crate-rate-epic" value="${crateData?.dropRates?.epic || 4}" min="0" max="100">
        </div>
        <div class="form-group">
          <label>Legendary</label>
          <input type="number" id="crate-rate-legendary" value="${crateData?.dropRates?.legendary || 1}" min="0" max="100">
        </div>
        <div class="form-group">
          <label>Description</label>
          <textarea id="crate-description" rows="2">${crateData?.description || ''}</textarea>
        </div>
        <input type="hidden" id="crate-id" value="${crateData?.crateId || ''}">
      </form>
    `;
    
    document.getElementById('modal-footer').innerHTML = `
      <button class="btn btn-outline" onclick="App.closeModal()">Cancel</button>
      <button class="btn btn-primary" onclick="App.saveCrate()">${isEdit ? 'Update' : 'Create'}</button>
    `;
    
    this.openModal();
  },

  async saveCrate() {
    const crateId = document.getElementById('crate-id').value;
    const isEdit = !!crateId;
    
    const data = {
      name: document.getElementById('crate-name').value,
      emoji: document.getElementById('crate-emoji').value,
      type: document.getElementById('crate-type').value,
      price: {
        coins: parseInt(document.getElementById('crate-price-coins').value),
        gems: parseInt(document.getElementById('crate-price-gems').value)
      },
      dropRates: {
        common: parseInt(document.getElementById('crate-rate-common').value),
        uncommon: parseInt(document.getElementById('crate-rate-uncommon').value),
        rare: parseInt(document.getElementById('crate-rate-rare').value),
        epic: parseInt(document.getElementById('crate-rate-epic').value),
        legendary: parseInt(document.getElementById('crate-rate-legendary').value)
      },
      description: document.getElementById('crate-description').value
    };
    
    try {
      const url = isEdit 
        ? `/api/crates/${this.currentServer.id}/${crateId}`
        : `/api/crates/${this.currentServer.id}`;
      
      const response = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      const result = await response.json();
      
      if (result.success || result.crate) {
        this.showToast(`Crate ${isEdit ? 'updated' : 'created'} successfully!`, 'success');
        this.closeModal();
        this.loadCrates();
      } else {
        this.showToast(result.error || 'Failed to save crate', 'error');
      }
    } catch (error) {
      console.error('Error saving crate:', error);
      this.showToast('Failed to save crate', 'error');
    }
  },

  async editCrate(crateId) {
    try {
      const response = await fetch(`/api/crates/${this.currentServer.id}/${crateId}`);
      const crate = await response.json();
      this.showCrateModal(crate);
    } catch (error) {
      console.error('Error loading crate:', error);
      this.showToast('Failed to load crate', 'error');
    }
  },

  async deleteCrate(crateId) {
    if (!confirm('Are you sure you want to delete this crate?')) return;
    
    try {
      const response = await fetch(`/api/crates/${this.currentServer.id}/${crateId}`, {
        method: 'DELETE'
      });
      
      const result = await response.json();
      
      if (result.success) {
        this.showToast('Crate deleted', 'success');
        this.loadCrates();
      } else {
        this.showToast(result.error || 'Failed to delete crate', 'error');
      }
    } catch (error) {
      console.error('Error deleting crate:', error);
      this.showToast('Failed to delete crate', 'error');
    }
  },

  showQuestModal(questData = null) {
    const isEdit = !!questData;
    document.getElementById('modal-title').textContent = isEdit ? 'Edit Quest' : 'Add Quest';
    
    document.getElementById('modal-body').innerHTML = `
      <form id="quest-form">
        <div class="form-group">
          <label>Name *</label>
          <input type="text" id="quest-name" required value="${questData?.name || ''}">
        </div>
        <div class="form-group">
          <label>Type</label>
          <select id="quest-type">
            <option value="daily" ${questData?.type === 'daily' ? 'selected' : ''}>Daily</option>
            <option value="weekly" ${questData?.type === 'weekly' ? 'selected' : ''}>Weekly</option>
            <option value="story" ${questData?.type === 'story' ? 'selected' : ''}>Story</option>
            <option value="achievement" ${questData?.type === 'achievement' ? 'selected' : ''}>Achievement</option>
          </select>
        </div>
        <div class="form-group">
          <label>Action Required</label>
          <select id="quest-action">
            <option value="catch" ${questData?.requirement?.action === 'catch' ? 'selected' : ''}>Catch Characters</option>
            <option value="battle" ${questData?.requirement?.action === 'battle' ? 'selected' : ''}>Win Battles</option>
            <option value="work" ${questData?.requirement?.action === 'work' ? 'selected' : ''}>Complete Jobs</option>
            <option value="earn" ${questData?.requirement?.action === 'earn' ? 'selected' : ''}>Earn Coins</option>
            <option value="open" ${questData?.requirement?.action === 'open' ? 'selected' : ''}>Open Crates</option>
            <option value="trade" ${questData?.requirement?.action === 'trade' ? 'selected' : ''}>Complete Trades</option>
          </select>
        </div>
        <div class="form-group">
          <label>Count Required</label>
          <input type="number" id="quest-count" value="${questData?.requirement?.count || 1}" min="1">
        </div>
        <div class="form-group">
          <label>Coin Reward</label>
          <input type="number" id="quest-reward-coins" value="${questData?.rewards?.coins || 100}" min="0">
        </div>
        <div class="form-group">
          <label>Gem Reward</label>
          <input type="number" id="quest-reward-gems" value="${questData?.rewards?.gems || 0}" min="0">
        </div>
        <div class="form-group">
          <label>XP Reward</label>
          <input type="number" id="quest-reward-xp" value="${questData?.rewards?.xp || 50}" min="0">
        </div>
        <div class="form-group">
          <label>Description</label>
          <textarea id="quest-description" rows="2">${questData?.description || ''}</textarea>
        </div>
        <input type="hidden" id="quest-id" value="${questData?.questId || ''}">
      </form>
    `;
    
    document.getElementById('modal-footer').innerHTML = `
      <button class="btn btn-outline" onclick="App.closeModal()">Cancel</button>
      <button class="btn btn-primary" onclick="App.saveQuest()">${isEdit ? 'Update' : 'Create'}</button>
    `;
    
    this.openModal();
  },

  async saveQuest() {
    const questId = document.getElementById('quest-id').value;
    const isEdit = !!questId;
    
    const data = {
      name: document.getElementById('quest-name').value,
      type: document.getElementById('quest-type').value,
      requirement: {
        action: document.getElementById('quest-action').value,
        count: parseInt(document.getElementById('quest-count').value)
      },
      rewards: {
        coins: parseInt(document.getElementById('quest-reward-coins').value),
        gems: parseInt(document.getElementById('quest-reward-gems').value),
        xp: parseInt(document.getElementById('quest-reward-xp').value)
      },
      description: document.getElementById('quest-description').value
    };
    
    try {
      const url = isEdit 
        ? `/api/quests/${this.currentServer.id}/${questId}`
        : `/api/quests/${this.currentServer.id}`;
      
      const response = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      const result = await response.json();
      
      if (result.success || result.quest) {
        this.showToast(`Quest ${isEdit ? 'updated' : 'created'} successfully!`, 'success');
        this.closeModal();
        this.loadQuests();
      } else {
        this.showToast(result.error || 'Failed to save quest', 'error');
      }
    } catch (error) {
      console.error('Error saving quest:', error);
      this.showToast('Failed to save quest', 'error');
    }
  },

  async editQuest(questId) {
    try {
      const response = await fetch(`/api/quests/${this.currentServer.id}/${questId}`);
      const quest = await response.json();
      this.showQuestModal(quest);
    } catch (error) {
      console.error('Error loading quest:', error);
      this.showToast('Failed to load quest', 'error');
    }
  },

  async deleteQuest(questId) {
    if (!confirm('Are you sure you want to delete this quest?')) return;
    
    try {
      const response = await fetch(`/api/quests/${this.currentServer.id}/${questId}`, {
        method: 'DELETE'
      });
      
      const result = await response.json();
      
      if (result.success) {
        this.showToast('Quest deleted', 'success');
        this.loadQuests();
      } else {
        this.showToast(result.error || 'Failed to delete quest', 'error');
      }
    } catch (error) {
      console.error('Error deleting quest:', error);
      this.showToast('Failed to delete quest', 'error');
    }
  },

  showJobModal(jobData = null) {
    const isEdit = !!jobData;
    document.getElementById('modal-title').textContent = isEdit ? 'Edit Job' : 'Add Job';
    
    document.getElementById('modal-body').innerHTML = `
      <form id="job-form">
        <div class="form-group">
          <label>Name *</label>
          <input type="text" id="job-name" required value="${jobData?.name || ''}">
        </div>
        <div class="form-group">
          <label>Emoji</label>
          <input type="text" id="job-emoji" value="${jobData?.emoji || '💼'}">
        </div>
        <div class="form-group">
          <label>Type</label>
          <select id="job-type">
            <option value="mining" ${jobData?.type === 'mining' ? 'selected' : ''}>Mining</option>
            <option value="fishing" ${jobData?.type === 'fishing' ? 'selected' : ''}>Fishing</option>
            <option value="hunting" ${jobData?.type === 'hunting' ? 'selected' : ''}>Hunting</option>
            <option value="farming" ${jobData?.type === 'farming' ? 'selected' : ''}>Farming</option>
            <option value="crafting" ${jobData?.type === 'crafting' ? 'selected' : ''}>Crafting</option>
          </select>
        </div>
        <div class="form-group">
          <label>Duration (minutes)</label>
          <input type="number" id="job-duration" value="${(jobData?.duration || 60000) / 60000}" min="1">
        </div>
        <div class="form-group">
          <label>Cooldown (minutes)</label>
          <input type="number" id="job-cooldown" value="${(jobData?.cooldown || 300000) / 60000}" min="1">
        </div>
        <div class="form-group">
          <label>Min Coins</label>
          <input type="number" id="job-coins-min" value="${jobData?.rewards?.coins?.min || 10}" min="0">
        </div>
        <div class="form-group">
          <label>Max Coins</label>
          <input type="number" id="job-coins-max" value="${jobData?.rewards?.coins?.max || 50}" min="0">
        </div>
        <div class="form-group">
          <label>XP Reward</label>
          <input type="number" id="job-xp" value="${jobData?.rewards?.xp || 10}" min="0">
        </div>
        <div class="form-group">
          <label>Description</label>
          <textarea id="job-description" rows="2">${jobData?.description || ''}</textarea>
        </div>
        <input type="hidden" id="job-id" value="${jobData?.jobId || ''}">
      </form>
    `;
    
    document.getElementById('modal-footer').innerHTML = `
      <button class="btn btn-outline" onclick="App.closeModal()">Cancel</button>
      <button class="btn btn-primary" onclick="App.saveJob()">${isEdit ? 'Update' : 'Create'}</button>
    `;
    
    this.openModal();
  },

  async saveJob() {
    const jobId = document.getElementById('job-id').value;
    const isEdit = !!jobId;
    
    const data = {
      name: document.getElementById('job-name').value,
      emoji: document.getElementById('job-emoji').value,
      type: document.getElementById('job-type').value,
      duration: parseInt(document.getElementById('job-duration').value) * 60000,
      cooldown: parseInt(document.getElementById('job-cooldown').value) * 60000,
      rewards: {
        coins: {
          min: parseInt(document.getElementById('job-coins-min').value),
          max: parseInt(document.getElementById('job-coins-max').value)
        },
        xp: parseInt(document.getElementById('job-xp').value)
      },
      description: document.getElementById('job-description').value
    };
    
    try {
      const url = isEdit 
        ? `/api/jobs/${this.currentServer.id}/${jobId}`
        : `/api/jobs/${this.currentServer.id}`;
      
      const response = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      const result = await response.json();
      
      if (result.success || result.job) {
        this.showToast(`Job ${isEdit ? 'updated' : 'created'} successfully!`, 'success');
        this.closeModal();
        this.loadJobs();
      } else {
        this.showToast(result.error || 'Failed to save job', 'error');
      }
    } catch (error) {
      console.error('Error saving job:', error);
      this.showToast('Failed to save job', 'error');
    }
  },

  async editJob(jobId) {
    try {
      const response = await fetch(`/api/jobs/${this.currentServer.id}/${jobId}`);
      const job = await response.json();
      this.showJobModal(job);
    } catch (error) {
      console.error('Error loading job:', error);
      this.showToast('Failed to load job', 'error');
    }
  },

  async deleteJob(jobId) {
    if (!confirm('Are you sure you want to delete this job?')) return;
    
    try {
      const response = await fetch(`/api/jobs/${this.currentServer.id}/${jobId}`, {
        method: 'DELETE'
      });
      
      const result = await response.json();
      
      if (result.success) {
        this.showToast('Job deleted', 'success');
        this.loadJobs();
      } else {
        this.showToast(result.error || 'Failed to delete job', 'error');
      }
    } catch (error) {
      console.error('Error deleting job:', error);
      this.showToast('Failed to delete job', 'error');
    }
  },

  showEventModal(eventData = null) {
    const isEdit = !!eventData;
    document.getElementById('modal-title').textContent = isEdit ? 'Edit Event' : 'Create Event';
    
    const now = new Date();
    const defaultStart = eventData?.startAt ? new Date(eventData.startAt).toISOString().slice(0, 16) : now.toISOString().slice(0, 16);
    const defaultEnd = eventData?.endAt ? new Date(eventData.endAt).toISOString().slice(0, 16) : new Date(now.getTime() + 24*60*60*1000).toISOString().slice(0, 16);
    
    document.getElementById('modal-body').innerHTML = `
      <form id="event-form">
        <div class="form-group">
          <label>Name *</label>
          <input type="text" id="event-name" required value="${eventData?.name || ''}">
        </div>
        <div class="form-group">
          <label>Type</label>
          <select id="event-type">
            <option value="drop_boost" ${eventData?.type === 'drop_boost' ? 'selected' : ''}>Drop Boost</option>
            <option value="xp_boost" ${eventData?.type === 'xp_boost' ? 'selected' : ''}>XP Boost</option>
            <option value="coin_boost" ${eventData?.type === 'coin_boost' ? 'selected' : ''}>Coin Boost</option>
            <option value="special_drop" ${eventData?.type === 'special_drop' ? 'selected' : ''}>Special Drop</option>
            <option value="tournament" ${eventData?.type === 'tournament' ? 'selected' : ''}>Tournament</option>
            <option value="community" ${eventData?.type === 'community' ? 'selected' : ''}>Community</option>
          </select>
        </div>
        <div class="form-group">
          <label>Boost Multiplier</label>
          <input type="number" id="event-multiplier" value="${eventData?.multiplier || 2}" min="1" max="10" step="0.5">
        </div>
        <div class="form-group">
          <label>Start Time</label>
          <input type="datetime-local" id="event-start" value="${defaultStart}">
        </div>
        <div class="form-group">
          <label>End Time</label>
          <input type="datetime-local" id="event-end" value="${defaultEnd}">
        </div>
        <div class="form-group">
          <label>Coin Reward</label>
          <input type="number" id="event-reward-coins" value="${eventData?.rewards?.coins || 0}" min="0">
        </div>
        <div class="form-group">
          <label>Gem Reward</label>
          <input type="number" id="event-reward-gems" value="${eventData?.rewards?.gems || 0}" min="0">
        </div>
        <div class="form-group">
          <label>Description</label>
          <textarea id="event-description" rows="2">${eventData?.description || ''}</textarea>
        </div>
        <input type="hidden" id="event-id" value="${eventData?.eventId || ''}">
      </form>
    `;
    
    document.getElementById('modal-footer').innerHTML = `
      <button class="btn btn-outline" onclick="App.closeModal()">Cancel</button>
      <button class="btn btn-primary" onclick="App.saveEvent()">${isEdit ? 'Update' : 'Create'}</button>
    `;
    
    this.openModal();
  },

  async saveEvent() {
    const eventId = document.getElementById('event-id').value;
    const isEdit = !!eventId;
    
    const data = {
      name: document.getElementById('event-name').value,
      type: document.getElementById('event-type').value,
      multiplier: parseFloat(document.getElementById('event-multiplier').value),
      startAt: new Date(document.getElementById('event-start').value).toISOString(),
      endAt: new Date(document.getElementById('event-end').value).toISOString(),
      rewards: {
        coins: parseInt(document.getElementById('event-reward-coins').value),
        gems: parseInt(document.getElementById('event-reward-gems').value)
      },
      description: document.getElementById('event-description').value
    };
    
    try {
      const url = isEdit 
        ? `/api/events/${this.currentServer.id}/${eventId}`
        : `/api/events/${this.currentServer.id}`;
      
      const response = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      const result = await response.json();
      
      if (result.success || result.event) {
        this.showToast(`Event ${isEdit ? 'updated' : 'created'} successfully!`, 'success');
        this.closeModal();
        this.loadEvents();
      } else {
        this.showToast(result.error || 'Failed to save event', 'error');
      }
    } catch (error) {
      console.error('Error saving event:', error);
      this.showToast('Failed to save event', 'error');
    }
  },

  async editEvent(eventId) {
    try {
      const response = await fetch(`/api/events/${this.currentServer.id}/${eventId}`);
      const event = await response.json();
      this.showEventModal(event);
    } catch (error) {
      console.error('Error loading event:', error);
      this.showToast('Failed to load event', 'error');
    }
  },

  async deleteEvent(eventId) {
    if (!confirm('Are you sure you want to delete this event?')) return;
    
    try {
      const response = await fetch(`/api/events/${this.currentServer.id}/${eventId}`, {
        method: 'DELETE'
      });
      
      const result = await response.json();
      
      if (result.success) {
        this.showToast('Event deleted', 'success');
        this.loadEvents();
      } else {
        this.showToast(result.error || 'Failed to delete event', 'error');
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      this.showToast('Failed to delete event', 'error');
    }
  },

  async saveEconomyConfig(e) {
    e.preventDefault();
    if (!this.currentServer) return;
    
    const data = {
      serverCurrency: {
        name: document.getElementById('coin-name').value,
        emoji: document.getElementById('coin-emoji').value
      },
      serverGems: {
        name: document.getElementById('gem-name').value,
        emoji: document.getElementById('gem-emoji').value
      },
      globalToServerRate: {
        playCoins: parseFloat(document.getElementById('playcoin-rate').value),
        playGems: parseFloat(document.getElementById('playgem-rate').value)
      }
    };
    
    try {
      const response = await fetch(`/api/economy/${this.currentServer.id}/config`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      const result = await response.json();
      
      if (result.success) {
        this.showToast('Economy settings saved!', 'success');
      } else {
        this.showToast(result.error || 'Failed to save settings', 'error');
      }
    } catch (error) {
      console.error('Error saving economy config:', error);
      this.showToast('Failed to save settings', 'error');
    }
  },

  async saveDailyRewards(e) {
    e.preventDefault();
    if (!this.currentServer) return;
    
    const data = {
      dailyReward: {
        coins: parseInt(document.getElementById('daily-coins').value),
        gems: parseInt(document.getElementById('daily-gems').value),
        streakBonus: {
          enabled: document.getElementById('streak-enabled').checked,
          multiplier: parseFloat(document.getElementById('streak-multiplier').value)
        }
      }
    };
    
    try {
      const response = await fetch(`/api/economy/${this.currentServer.id}/config`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      const result = await response.json();
      
      if (result.success) {
        this.showToast('Daily rewards saved!', 'success');
      } else {
        this.showToast(result.error || 'Failed to save settings', 'error');
      }
    } catch (error) {
      console.error('Error saving daily rewards:', error);
      this.showToast('Failed to save settings', 'error');
    }
  },

  async saveDropsConfig(e) {
    e.preventDefault();
    if (!this.currentServer) return;
    
    const data = {
      enabled: document.getElementById('drops-enabled').checked,
      interval: parseInt(document.getElementById('drop-interval').value) * 1000,
      catchTimeout: parseInt(document.getElementById('catch-timeout').value) * 1000,
      maxDropsPerHour: parseInt(document.getElementById('max-drops').value)
    };
    
    try {
      const response = await fetch(`/api/drops/${this.currentServer.id}/config`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      const result = await response.json();
      
      if (result.success) {
        this.showToast('Drop settings saved!', 'success');
      } else {
        this.showToast(result.error || 'Failed to save settings', 'error');
      }
    } catch (error) {
      console.error('Error saving drops config:', error);
      this.showToast('Failed to save settings', 'error');
    }
  },

  async saveDropRates(e) {
    e.preventDefault();
    if (!this.currentServer) return;
    
    const data = {
      dropRates: {
        common: parseInt(document.getElementById('rate-common').value),
        uncommon: parseInt(document.getElementById('rate-uncommon').value),
        rare: parseInt(document.getElementById('rate-rare').value),
        epic: parseInt(document.getElementById('rate-epic').value),
        legendary: parseInt(document.getElementById('rate-legendary').value)
      }
    };
    
    try {
      const response = await fetch(`/api/drops/${this.currentServer.id}/config`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      const result = await response.json();
      
      if (result.success) {
        this.showToast('Drop rates saved!', 'success');
      } else {
        this.showToast(result.error || 'Failed to save settings', 'error');
      }
    } catch (error) {
      console.error('Error saving drop rates:', error);
      this.showToast('Failed to save settings', 'error');
    }
  },

  async saveDropMessages(e) {
    e.preventDefault();
    if (!this.currentServer) return;
    
    const data = {
      customMessages: {
        spawn: document.getElementById('msg-spawn').value,
        caught: document.getElementById('msg-caught').value,
        missed: document.getElementById('msg-missed').value
      }
    };
    
    try {
      const response = await fetch(`/api/drops/${this.currentServer.id}/config`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      const result = await response.json();
      
      if (result.success) {
        this.showToast('Drop messages saved!', 'success');
      } else {
        this.showToast(result.error || 'Failed to save settings', 'error');
      }
    } catch (error) {
      console.error('Error saving drop messages:', error);
      this.showToast('Failed to save settings', 'error');
    }
  },

  async saveBattlesConfig(e) {
    e.preventDefault();
    if (!this.currentServer) return;
    
    const data = {
      enabled: document.getElementById('battles-enabled').checked,
      turnTimeout: parseInt(document.getElementById('turn-timeout').value) * 1000,
      maxRounds: parseInt(document.getElementById('max-rounds').value)
    };
    
    try {
      const response = await fetch(`/api/battles/${this.currentServer.id}/config`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      const result = await response.json();
      
      if (result.success) {
        this.showToast('Battle settings saved!', 'success');
      } else {
        this.showToast(result.error || 'Failed to save settings', 'error');
      }
    } catch (error) {
      console.error('Error saving battles config:', error);
      this.showToast('Failed to save settings', 'error');
    }
  },

  async saveTrophyRewards(e) {
    e.preventDefault();
    if (!this.currentServer) return;
    
    const data = {
      trophyRewards: {
        win: parseInt(document.getElementById('trophy-win').value),
        lose: parseInt(document.getElementById('trophy-lose').value),
        draw: parseInt(document.getElementById('trophy-draw').value)
      }
    };
    
    try {
      const response = await fetch(`/api/battles/${this.currentServer.id}/config`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      const result = await response.json();
      
      if (result.success) {
        this.showToast('Trophy rewards saved!', 'success');
      } else {
        this.showToast(result.error || 'Failed to save settings', 'error');
      }
    } catch (error) {
      console.error('Error saving trophy rewards:', error);
      this.showToast('Failed to save settings', 'error');
    }
  },

  async saveSettings(e) {
    e.preventDefault();
    if (!this.currentServer) return;
    
    const data = {
      botName: document.getElementById('bot-name').value,
      prefix: document.getElementById('command-prefix').value
    };
    
    try {
      const response = await fetch(`/api/servers/${this.currentServer.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      const result = await response.json();
      
      if (result.success) {
        this.showToast('Settings saved!', 'success');
      } else {
        this.showToast(result.error || 'Failed to save settings', 'error');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      this.showToast('Failed to save settings', 'error');
    }
  },

  async saveChannels(e) {
    e.preventDefault();
    if (!this.currentServer) return;
    
    const data = {
      channels: {
        drops: document.getElementById('drops-channel').value,
        events: document.getElementById('events-channel').value,
        updates: document.getElementById('updates-channel').value,
        battles: document.getElementById('battles-channel').value
      }
    };
    
    try {
      const response = await fetch(`/api/servers/${this.currentServer.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      const result = await response.json();
      
      if (result.success) {
        this.showToast('Channels saved!', 'success');
      } else {
        this.showToast(result.error || 'Failed to save settings', 'error');
      }
    } catch (error) {
      console.error('Error saving channels:', error);
      this.showToast('Failed to save settings', 'error');
    }
  },

  async saveBranding(e) {
    e.preventDefault();
    if (!this.currentServer) return;
    
    const data = {
      branding: {
        embedColor: document.getElementById('embed-color').value,
        footerText: document.getElementById('footer-text').value,
        thumbnailUrl: document.getElementById('thumbnail-url').value
      }
    };
    
    try {
      const response = await fetch(`/api/servers/${this.currentServer.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      const result = await response.json();
      
      if (result.success) {
        this.showToast('Branding saved!', 'success');
      } else {
        this.showToast(result.error || 'Failed to save settings', 'error');
      }
    } catch (error) {
      console.error('Error saving branding:', error);
      this.showToast('Failed to save settings', 'error');
    }
  },

  async viewPlayer(playerId) {
    try {
      const response = await fetch(`/api/players/${this.currentServer.id}/${playerId}`);
      const player = await response.json();
      
      document.getElementById('modal-title').textContent = `Player: ${player.username}`;
      document.getElementById('modal-body').innerHTML = `
        <div class="stats-grid small">
          <div class="stat-card">
            <h4>Level</h4>
            <p class="stat-value">${player.level?.current || 1}</p>
          </div>
          <div class="stat-card">
            <h4>Trophies</h4>
            <p class="stat-value">${player.trophies || 200}</p>
          </div>
          <div class="stat-card">
            <h4>Coins</h4>
            <p class="stat-value">${this.formatNumber(player.currency?.coins || 0)}</p>
          </div>
          <div class="stat-card">
            <h4>Gems</h4>
            <p class="stat-value">${this.formatNumber(player.currency?.gems || 0)}</p>
          </div>
        </div>
        <div style="margin-top: 1rem;">
          <p><strong>Discord ID:</strong> ${player.odiscordId}</p>
          <p><strong>Characters Owned:</strong> ${player.charactersOwned || 0}</p>
          <p><strong>Battles Won:</strong> ${player.stats?.battlesWon || 0}</p>
          <p><strong>Last Active:</strong> ${player.lastActivity ? new Date(player.lastActivity).toLocaleString() : 'Never'}</p>
        </div>
      `;
      document.getElementById('modal-footer').innerHTML = `
        <button class="btn btn-outline" onclick="App.closeModal()">Close</button>
        <button class="btn btn-success" onclick="App.grantPlayerCurrency('${playerId}')">Grant Currency</button>
      `;
      this.openModal();
    } catch (error) {
      console.error('Error loading player:', error);
      this.showToast('Failed to load player', 'error');
    }
  },

  async grantPlayerCurrency(playerId) {
    const amount = prompt('Enter amount to grant:');
    if (!amount || isNaN(parseInt(amount))) return;
    
    const type = prompt('Enter currency type (coins/gems):') || 'coins';
    
    try {
      const response = await fetch(`/api/economy/${this.currentServer.id}/grant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerId,
          amount: parseInt(amount),
          type,
          reason: 'Admin grant'
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        this.showToast(`Granted ${amount} ${type}!`, 'success');
        this.closeModal();
        this.loadPlayers();
      } else {
        this.showToast(result.error || 'Failed to grant currency', 'error');
      }
    } catch (error) {
      console.error('Error granting currency:', error);
      this.showToast('Failed to grant currency', 'error');
    }
  },

  async grantGlobalCurrency() {
    const targetId = document.getElementById('currency-target-id').value;
    const amount = parseInt(document.getElementById('currency-amount').value);
    const type = document.getElementById('currency-type').value;
    const reason = document.getElementById('currency-reason').value;
    
    if (!targetId || !amount) {
      this.showToast('Please fill in target ID and amount', 'error');
      return;
    }
    
    try {
      const response = await fetch('/api/admin/global-currency/grant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetId, amount, type, reason })
      });
      
      const result = await response.json();
      
      if (result.success) {
        this.showToast(`Granted ${amount} ${type}!`, 'success');
        document.getElementById('currency-target-id').value = '';
        document.getElementById('currency-amount').value = '0';
        document.getElementById('currency-reason').value = '';
      } else {
        this.showToast(result.error || 'Failed to grant currency', 'error');
      }
    } catch (error) {
      console.error('Error granting global currency:', error);
      this.showToast('Failed to grant currency', 'error');
    }
  },

  async deductGlobalCurrency() {
    const targetId = document.getElementById('currency-target-id').value;
    const amount = parseInt(document.getElementById('currency-amount').value);
    const type = document.getElementById('currency-type').value;
    const reason = document.getElementById('currency-reason').value;
    
    if (!targetId || !amount) {
      this.showToast('Please fill in target ID and amount', 'error');
      return;
    }
    
    try {
      const response = await fetch('/api/admin/global-currency/deduct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetId, amount, type, reason })
      });
      
      const result = await response.json();
      
      if (result.success) {
        this.showToast(`Deducted ${amount} ${type}!`, 'success');
        document.getElementById('currency-target-id').value = '';
        document.getElementById('currency-amount').value = '0';
        document.getElementById('currency-reason').value = '';
      } else {
        this.showToast(result.error || 'Failed to deduct currency', 'error');
      }
    } catch (error) {
      console.error('Error deducting global currency:', error);
      this.showToast('Failed to deduct currency', 'error');
    }
  },

  async addSuperAdmin(e) {
    e.preventDefault();
    
    const discordId = document.getElementById('new-admin-id').value;
    const username = document.getElementById('new-admin-name').value;
    
    if (!discordId || !username) {
      this.showToast('Please fill in all fields', 'error');
      return;
    }
    
    try {
      const response = await fetch('/api/admin/super-admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ discordId, username })
      });
      
      const result = await response.json();
      
      if (result.success) {
        this.showToast('Super admin added!', 'success');
        document.getElementById('new-admin-id').value = '';
        document.getElementById('new-admin-name').value = '';
        this.loadAdminData();
      } else {
        this.showToast(result.error || 'Failed to add super admin', 'error');
      }
    } catch (error) {
      console.error('Error adding super admin:', error);
      this.showToast('Failed to add super admin', 'error');
    }
  },

  async removeSuperAdmin(discordId) {
    if (!confirm('Are you sure you want to remove this super admin?')) return;
    
    try {
      const response = await fetch(`/api/admin/super-admins/${discordId}`, {
        method: 'DELETE'
      });
      
      const result = await response.json();
      
      if (result.success) {
        this.showToast('Super admin removed', 'success');
        this.loadAdminData();
      } else {
        this.showToast(result.error || 'Failed to remove super admin', 'error');
      }
    } catch (error) {
      console.error('Error removing super admin:', error);
      this.showToast('Failed to remove super admin', 'error');
    }
  }
};

document.addEventListener('DOMContentLoaded', () => App.init());
