export type Role = 'USER' | 'MODERATOR' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  location: string;
  venue: string;
  startDate: Date;
  endDate: Date;
  imageUrl?: string | null;
  videoUrl?: string | null;
  price?: number | null;
  source: string;
  sourceUrl?: string | null;
  categoryId: string;
  createdBy?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  category?: Category;
  creator?: User | null;
  tags?: EventTag[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  createdAt: Date;
}

export interface EventTag {
  id: string;
  eventId: string;
  tag: string;
}

export interface CrawlerSource {
  id: string;
  name: string;
  baseUrl: string;
  scraperType: string;
  isActive: boolean;
  lastCrawledAt?: Date | null;
  createdAt: Date;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface EventFilters {
  categoryId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  isFree?: boolean;
}

export interface AuthTokens {
  accessToken: string;
  expiresIn: string;
}

export interface AuthResponse {
  user: Omit<User, 'passwordHash'>;
  tokens: AuthTokens;
}

export interface Comment {
  id: string;
  content: string;
  eventId: string;
  userId: string;
  parentCommentId?: string | null;
  createdAt: Date;
  updatedAt: Date;
  user: Pick<User, 'id' | 'name'>;
  replies?: Comment[];
  likes?: CommentLike[];
  likesCount?: number;
  isLikedByUser?: boolean;
}

export interface CommentLike {
  id: string;
  commentId: string;
  userId: string;
  createdAt: Date;
}

export interface Rating {
  id: string;
  rating: number;
  eventId: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  user?: Pick<User, 'id' | 'name'>;
}

export interface EventRatingStats {
  averageRating: number;
  totalRatings: number;
  userRating?: number;
}

export type DigestFrequency = 'EVERY_3_DAYS' | 'WEEKLY';

export interface UserSubscription {
  id: string;
  categoryId: string;
  category: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
  };
  createdAt: Date;
}

export interface NotificationSettings {
  id: string;
  userId: string;
  digestFrequency: DigestFrequency;
  genericEmailOptOut: boolean;
  lastDigestSentAt: Date | null;
  lastGenericSentAt: Date | null;
}
