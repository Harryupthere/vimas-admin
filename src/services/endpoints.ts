// Every path here is taken directly from Vimas-Admin.postman_collection.json.
// Do not add a path that isn't backed by a real request in that collection —
// if a page needs data with no endpoint, it stays a placeholder (see the
// gaps called out in the architecture notes: dashboard stats, admin profile,
// refresh token, product images, reports, generic settings).

export const API_ENDPOINTS = {
  // Upload (S3 presigned URLs) — not under /admin, and not role-gated
  // (any authenticated token works). See Backend/src/upload/upload.controller.ts.
  uploadPresignedUrl: '/upload/presigned-url',

  // Auth
  adminLogin: '/admin/login',
  adminRefreshToken: '/admin/refresh-token',
  adminChangePassword: '/admin/change-password',

  // Users
  adminUsers: '/admin/users',
  adminUserById: '/admin/user/:id',

  // Categories
  adminCategories: '/admin/categories',
  adminCategoryById: '/admin/category/:id',
  adminCategoryCreate: '/admin/category',

  // Brands
  adminBrands: '/admin/brands',
  adminBrandById: '/admin/brand/:id',
  adminBrandCreate: '/admin/brand',
  adminCategoryBrands: '/admin/category-brands/:id',
  adminBrandCategory: '/admin/brand-category/:id',
  adminBrandCategoryMap: '/admin/brand-category/map',

  // Products
  adminProducts: '/admin/products',
  adminProductById: '/admin/products/:id',
  adminProductMedia: '/admin/product-media',
  adminProductMediaById: '/admin/product-media/:id',
  adminProductPaymentOption: '/admin/product-payment-option',

  // Product Bulk Details (bulk/package pricing tiers per product)
  adminProductBulkDetails: '/admin/product-bulk-details',
  adminProductBulkDetailById: '/admin/product-bulk-details/:id',

  // Product Feedback
  adminProductFeedback: '/admin/product-feedback',
  adminProductFeedbackById: '/admin/product-feedback/:id',
  adminProductFeedbackStatus: '/admin/product-feedback/:id/status',

  // Product Actions
  adminProductActions: '/admin/product-actions',
  adminProductActionById: '/admin/product-actions/:id',

  // Product History
  adminProductHistory: '/admin/product-history',
  adminProductHistoryById: '/admin/product-history/:id',

  // Review & Rating
  adminReviewRating: '/admin/review-rating',
  adminReviewRatingVisibility: '/admin/review-rating/:id/visibility',
  adminReviewRatingById: '/admin/review-rating/:id',

  // Payment Options
  adminPaymentOptions: '/admin/payment-options',
  adminPaymentOptionById: '/admin/payment-options/:id',

  // Orders
  adminOrders: '/admin/orders',
  adminOrderById: '/admin/orders/:id',
  adminOrderStatusUpdate: '/admin/orders/:id/status',

  // Order Status (config)
  adminOrderStatus: '/admin/order-status',
  adminOrderStatusById: '/admin/order-status/:id',

  // Payment Status (config)
  adminPaymentStatus: '/admin/payment-status',
  adminPaymentStatusById: '/admin/payment-status/:id',

  // User Types
  adminUserTypes: '/admin/user-types',
  adminUserTypeById: '/admin/user-types/:id',

  // Membership Types
  adminMembershipTypes: '/admin/membership-types',
  adminMembershipTypeById: '/admin/membership-types/:id',

  // Registration Types
  adminRegistrationTypes: '/admin/registration-types',
  adminRegistrationTypeById: '/admin/registration-types/:id',

  // Point Distribution
  adminPointDistribution: '/admin/point-distribution',
  adminPointDistributionById: '/admin/point-distribution/:id',

  // Point User Balances
  adminPointUserBalance: '/admin/point-user-balance',
  adminPointUserBalanceById: '/admin/point-user-balance/:id',

  // Point Admin Balances
  adminPointAdminBalance: '/admin/point-admin-balance',
  adminPointAdminBalanceById: '/admin/point-admin-balance/:id',

  // Point Pool Details
  adminPointPoolDetail: '/admin/point-pool-detail',
  adminPointPoolDetailById: '/admin/point-pool-detail/:id',

  // Point Pools
  adminPointPool: '/admin/point-pool',
  adminPointPoolById: '/admin/point-pool/:id',

  // Point Transactions
  adminPointTransaction: '/admin/point-transaction',
  adminPointTransactionById: '/admin/point-transaction/:id',

  // Reward Mall Categories
  adminRewardMallCategories: '/admin/reward-mall-categories',
  adminRewardMallCategoryById: '/admin/reward-mall-categories/:id',

  // Reward Mall Products
  adminRewardMallProducts: '/admin/reward-mall-products',
  adminRewardMallProductById: '/admin/reward-mall-products/:id',

  // Reward Mall Product Media
  adminRewardMallProductMedia: '/admin/reward-mall-product-media',
  adminRewardMallProductMediaById: '/admin/reward-mall-product-media/:id',

  // Reward Mall Purchase Status
  adminRewardMallPurchaseStatus: '/admin/reward-mall-purchase-status',
  adminRewardMallPurchaseStatusById: '/admin/reward-mall-purchase-status/:id',

  // Reward Mall Purchases
  adminRewardMallPurchases: '/admin/reward-mall-purchases',
  adminRewardMallPurchaseById: '/admin/reward-mall-purchases/:id',
} as const;
