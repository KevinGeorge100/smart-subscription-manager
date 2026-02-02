export interface UserAccount {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
}

export interface Subscription {
  id?: string;
  name: string;
  amount: number;
  billingCycle: 'monthly' | 'yearly';
  category: 'Streaming' | 'Software' | 'Cloud' | 'Education' | 'Utilities' | 'Others';
  renewalDate: any;
  userId: string;
  reminderSentAt?: any;
}
