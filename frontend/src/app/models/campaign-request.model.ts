export interface CampaignRequest {
  companyProfileId: number;
  targetCategoryId: number | null;
  title: string;
  description: string;
  campaignType: string;
  budget: number | null;
  deadline: string;
}
