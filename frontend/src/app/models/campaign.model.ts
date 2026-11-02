export interface Campaign {
  id: number;
  companyProfileId: number;
  companyName: string;
  targetCategoryId: number;
  targetCategoryName: string;
  title: string;
  description: string;
  campaignType: string;
  budget: number;
  deadline: string;
  createdAt: string;
}
