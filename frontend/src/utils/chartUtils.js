// Utility functions for processing transaction data for charts

// Get monthly spending data (last 6 months)
export const getMonthlySpendingData = (transactions) => {
  const monthlyData = {};
  const now = new Date();
  
  // Initialize last 6 months with 0
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    monthlyData[key] = 0;
  }

  // Sum up approved transactions by month
  transactions
    .filter(t => t.status === 'approved')
    .forEach(transaction => {
      const date = new Date(transaction.createdAt);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (monthlyData[key] !== undefined) {
        monthlyData[key] += transaction.amount;
      }
    });

  return Object.entries(monthlyData).map(([month, amount]) => ({
    month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    amount: amount
  }));
};

// Get category-wise spending data
export const getCategorySpendingData = (transactions) => {
  const categoryData = {};
  
  transactions
    .filter(t => t.status === 'approved')
    .forEach(transaction => {
      const category = transaction.category || 'Other';
      categoryData[category] = (categoryData[category] || 0) + transaction.amount;
    });

  const colors = {
    Food: '#8884d8',
    Travel: '#82ca9d',
    Stationery: '#ffc658',
    Entertainment: '#ff7300',
    Other: '#0088fe'
  };

  return Object.entries(categoryData).map(([name, value]) => ({
    name,
    value,
    fill: colors[name] || '#8884d8'
  }));
};

// Get weekly spending data (last 4 weeks)
export const getWeeklySpendingData = (transactions) => {
  const weeklyData = {};
  const now = new Date();
  
  // Initialize last 4 weeks with 0
  for (let i = 3; i >= 0; i--) {
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - (i * 7) - (now.getDay() || 7) + 1);
    weekStart.setHours(0, 0, 0, 0);
    const weekKey = `Week ${4 - i}`;
    weeklyData[weekKey] = 0;
  }

  // Sum up approved transactions by week
  transactions
    .filter(t => t.status === 'approved')
    .forEach(transaction => {
      const date = new Date(transaction.createdAt);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - (date.getDay() || 7) + 1);
      weekStart.setHours(0, 0, 0, 0);
      
      const weeksAgo = Math.floor((now - weekStart) / (7 * 24 * 60 * 60 * 1000));
      if (weeksAgo >= 0 && weeksAgo < 4) {
        const weekKey = `Week ${4 - weeksAgo}`;
        if (weeklyData[weekKey] !== undefined) {
          weeklyData[weekKey] += transaction.amount;
        }
      }
    });

  return Object.entries(weeklyData).map(([week, amount]) => ({
    week,
    amount
  }));
};

// Get line graph data (daily spending for last 30 days)
export const getDailySpendingData = (transactions) => {
  const dailyData = {};
  const now = new Date();
  
  // Initialize last 30 days with 0
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(now.getDate() - i);
    date.setHours(0, 0, 0, 0);
    const key = date.toISOString().split('T')[0];
    dailyData[key] = 0;
  }

  // Sum up approved transactions by day
  transactions
    .filter(t => t.status === 'approved')
    .forEach(transaction => {
      const date = new Date(transaction.createdAt);
      date.setHours(0, 0, 0, 0);
      const key = date.toISOString().split('T')[0];
      if (dailyData[key] !== undefined) {
        dailyData[key] += transaction.amount;
      }
    });

  return Object.entries(dailyData).map(([date, amount]) => ({
    date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    amount: amount
  }));
};

