import {
  BoxIcon,
  CartIcon,
  CoinsIcon,
  DashboardIcon,
  GiftIcon,
  ReportIcon,
  SettingsIcon,
  UserCircleIcon,
  UsersIcon,
} from '../layouts/AdminLayout/icons';

export interface NavLeaf {
  label: string;
  path: string;
}

export interface NavGroup {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path?: string; // present on single (non-grouped) items
  children?: NavLeaf[];
  placeholder?: boolean; // no backing API yet — visible but flagged
}

// Mirrors the route map agreed on in the architecture review — every path
// here is backed by a real Admin API endpoint unless `placeholder` is set.
export const NAV_ITEMS: NavGroup[] = [
  { label: 'Dashboard', icon: DashboardIcon, path: '/dashboard' },
  { label: 'Users', icon: UsersIcon, path: '/users' },
  {
    label: 'Catalog',
    icon: BoxIcon,
    children: [
      { label: 'Categories', path: '/catalog/categories' },
      { label: 'Brands', path: '/catalog/brands' },
      { label: 'Products', path: '/catalog/products' },
      { label: 'Product Bulk Details', path: '/catalog/product-bulk-details' },
      { label: 'Product Actions', path: '/catalog/product-actions' },
      { label: 'Product Feedback', path: '/catalog/product-feedback' },
      { label: 'Review & Rating', path: '/catalog/review-rating' },
      { label: 'Product History', path: '/catalog/product-history' },
    ],
  },
  {
    label: 'Orders',
    icon: CartIcon,
    children: [
      { label: 'Orders', path: '/orders' },
      { label: 'Order Status', path: '/orders/order-status' },
      { label: 'Payment Status', path: '/orders/payment-status' },
      { label: 'Payment Options', path: '/orders/payment-options' },
    ],
  },
  {
    label: 'Points & Rewards',
    icon: CoinsIcon,
    children: [
      { label: 'Point Distribution', path: '/points/distribution' },
      { label: 'Point Pools', path: '/points/pools' },
      { label: 'Point Pool Details', path: '/points/pool-details' },
      { label: 'Point Transactions', path: '/points/transactions' },
      { label: 'Point Wallets', path: '/points/wallets' },
    ],
  },
  {
    label: 'Reward Mall',
    icon: GiftIcon,
    children: [
      { label: 'Categories', path: '/reward-mall/categories' },
      { label: 'Products', path: '/reward-mall/products' },
      { label: 'Purchase Status', path: '/reward-mall/purchase-status' },
      { label: 'Purchases', path: '/reward-mall/purchases' },
    ],
  },
  {
    label: 'Configuration',
    icon: SettingsIcon,
    children: [
      { label: 'User Types', path: '/configuration/user-types' },
      { label: 'Membership Types', path: '/configuration/membership-types' },
      { label: 'Registration Types', path: '/configuration/registration-types' },
    ],
  },
  { label: 'Reports', icon: ReportIcon, path: '/reports', placeholder: true },
  { label: 'Settings', icon: SettingsIcon, path: '/settings', placeholder: true },
  { label: 'Profile', icon: UserCircleIcon, path: '/profile' },
];
