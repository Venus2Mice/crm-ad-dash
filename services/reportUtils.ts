import { ReportPeriod, DateRange, Deal, Customer } from '../types';

export const getDateRangeForPeriod = (period: ReportPeriod): DateRange => {
  const now = new Date();
  let startDate: Date | null = null;
  let endDate: Date | null = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999); // End of today

  switch (period) {
    case 'today':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0); // Start of today
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999); // End of today
      break;
    case 'this_month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999); // End of current month
      break;
    case 'last_month':
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999); // End of last month
      break;
    case 'last_90_days':
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 90);
      startDate.setHours(0,0,0,0); // Start of the day 90 days ago
      break;
    case 'year_to_date':
      startDate = new Date(now.getFullYear(), 0, 1); // January 1st of current year
      break;
    case 'all_time':
    default:
      startDate = null; // No start date filter
      endDate = null;   // No end date filter
      break;
  }
  return { startDate, endDate };
};

export const getUniqueDealOwners = (deals: Deal[]): string[] => {
  return Array.from(new Set(deals.map(deal => deal.owner))).sort();
};

export const getUniqueAccountManagers = (customers: Customer[]): string[] => {
  return Array.from(new Set(customers.map(customer => customer.accountManager).filter(Boolean) as string[])).sort();
};

export const formatCurrency = (value: number, currencyCode: string = 'USD'): string => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: currencyCode }).format(value);
};

// Helper to group data for charts, e.g., sales by month
export const groupDealsByMonth = (deals: Deal[], dateField: keyof Deal = 'closeDate'): { name: string, value: number }[] => {
    const monthlyData: { [key: string]: number } = {};
    deals.forEach(deal => {
        const dateStr = deal[dateField] as string;
        if (dateStr) {
            const date = new Date(dateStr);
            const monthYear = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
            monthlyData[monthYear] = (monthlyData[monthYear] || 0) + deal.value;
        }
    });

    return Object.entries(monthlyData)
        .map(([name, value]) => ({ name, value }))
        .sort((a,b) => new Date(a.name).getTime() - new Date(b.name).getTime()); // Sort by date
};

export const groupDealsByOwner = (deals: Deal[]): { name: string, value: number }[] => {
    const ownerData: { [key: string]: number } = {};
    deals.forEach(deal => {
        ownerData[deal.owner] = (ownerData[deal.owner] || 0) + deal.value;
    });
    return Object.entries(ownerData).map(([name, value]) => ({ name, value }));
};
