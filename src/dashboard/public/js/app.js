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
  }
};

document.addEventListener('DOMContentLoaded', () => App.init());
