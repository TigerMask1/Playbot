const express = require('express');
const router = express.Router();
const { getCollection, COLLECTIONS } = require('../../core/database');
const { PermissionService } = require('../../services/PermissionService');

const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
const DISCORD_REDIRECT_URI = process.env.DISCORD_REDIRECT_URI || 'http://localhost:5000/api/auth/callback';

router.get('/login', (req, res) => {
  const scope = 'identify email guilds';
  const authUrl = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(DISCORD_REDIRECT_URI)}&response_type=code&scope=${encodeURIComponent(scope)}`;
  res.redirect(authUrl);
});

router.get('/callback', async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.redirect('/?error=no_code');
  }

  try {
    const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        client_id: DISCORD_CLIENT_ID,
        client_secret: DISCORD_CLIENT_SECRET,
        grant_type: 'authorization_code',
        code,
        redirect_uri: DISCORD_REDIRECT_URI
      })
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      console.error('Token error:', tokenData);
      return res.redirect('/?error=token_error');
    }

    const userResponse = await fetch('https://discord.com/api/users/@me', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`
      }
    });

    const userData = await userResponse.json();

    const guildsResponse = await fetch('https://discord.com/api/users/@me/guilds', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`
      }
    });

    const guildsData = await guildsResponse.json();

    const adminGuilds = guildsData.filter(guild => {
      const permissions = BigInt(guild.permissions);
      return (permissions & BigInt(0x8)) === BigInt(0x8) || 
             (permissions & BigInt(0x20)) === BigInt(0x20);
    });

    const globalUsers = await getCollection(COLLECTIONS.GLOBAL.USERS);
    await globalUsers.updateOne(
      { odiscordId: userData.id },
      {
        $set: {
          odiscordId: userData.id,
          username: userData.username,
          discriminator: userData.discriminator || '0',
          avatar: userData.avatar,
          email: userData.email,
          servers: adminGuilds.map(g => ({ id: g.id, name: g.name, icon: g.icon })),
          'stats.lastActive': new Date(),
          updatedAt: new Date()
        },
        $setOnInsert: {
          globalCurrency: { playCoins: 0, playGems: 0 },
          permissions: { isSuperAdmin: false, managedServers: [] },
          preferences: { notifications: true, dmAlerts: true, language: 'en' },
          'stats.accountCreated': new Date(),
          createdAt: new Date()
        }
      },
      { upsert: true }
    );

    const isSuperAdmin = await PermissionService.isSuperAdmin(userData.id);

    req.session.user = {
      id: userData.id,
      username: userData.username,
      discriminator: userData.discriminator || '0',
      avatar: userData.avatar,
      email: userData.email,
      adminGuilds,
      isSuperAdmin,
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token
    };

    res.redirect('/dashboard');
  } catch (error) {
    console.error('OAuth callback error:', error);
    res.redirect('/?error=oauth_error');
  }
});

router.get('/user', (req, res) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const { id, username, discriminator, avatar, adminGuilds, isSuperAdmin } = req.session.user;
  res.json({
    id,
    username,
    discriminator,
    avatar,
    avatarUrl: avatar 
      ? `https://cdn.discordapp.com/avatars/${id}/${avatar}.png`
      : `https://cdn.discordapp.com/embed/avatars/${parseInt(discriminator || '0') % 5}.png`,
    adminGuilds,
    isSuperAdmin
  });
});

router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.json({ success: true });
  });
});

router.get('/check', (req, res) => {
  res.json({
    authenticated: !!(req.session && req.session.user),
    user: req.session?.user ? {
      id: req.session.user.id,
      username: req.session.user.username
    } : null
  });
});

module.exports = router;
