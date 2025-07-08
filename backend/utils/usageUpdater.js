const db = require('../models');
const { Op } = require('sequelize');

async function updateAllUsersUsage() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // 1. Get login counts for all users this month
  const loginCounts = await db.UserLogin.findAll({
    attributes: [
      'userId',
      [db.Sequelize.fn('COUNT', db.Sequelize.col('id')), 'loginCount']
    ],
    where: { createdAt: { [Op.gte]: startOfMonth } },
    group: ['userId']
  });

  // 2. Find the max login count
  const maxLogins = loginCounts.reduce((max, row) => {
    const count = parseInt(row.get('loginCount'), 10);
    return count > max ? count : max;
  }, 1);

  // 3. Update each user's usagePercent, usagePeriod, usageColor
  for (const row of loginCounts) {
    const userId = row.get('userId');
    const loginCount = parseInt(row.get('loginCount'), 10);
    const usagePercent = Math.round((loginCount / maxLogins) * 100);

    await db.User.update({
      usagePercent,
      usagePeriod: `${startOfMonth.toLocaleDateString()} - ${now.toLocaleDateString()}`,
      usageColor: usagePercent > 80 ? 'danger' : usagePercent > 50 ? 'warning' : 'success'
    }, {
      where: { id: userId }
    });
  }

  // 4. Set usagePercent to 0 for users with no logins this month
  await db.User.update({
    usagePercent: 0,
    usagePeriod: `${startOfMonth.toLocaleDateString()} - ${now.toLocaleDateString()}`,
    usageColor: 'secondary'
  }, {
    where: {
      id: { [Op.notIn]: loginCounts.map(row => row.get('userId')) }
    }
  });
}

module.exports = { updateAllUsersUsage };
