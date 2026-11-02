export interface YoutuberProfileRequest {
  userId: number;
  categoryId: number | null;
  channelName: string;
  youtubeUrl: string;
  description: string;
  country: string;
  language: string;
  subscribersCount: number;
  averageViews: number;
  pricePerAd: number;
  contactEmail: string;
}
