export const serviceCapabilities = [
  "bilingual_support",
  "customer_success",
  "sales_revenue_growth",
  "specialized_tech_support",
  "social_media_management",
  "onboarding_integration",
  "workflow_mapping",
  "kpi_definition",
  "access_management",
  "talent_matching",
  "project_management",
  "business_creativity_technology"
];

export function hasRequiredCapability(skills = []) {
  const normalized = Array.isArray(skills) ? skills : String(skills).split(",");
  return normalized.some((skill) => serviceCapabilities.includes(String(skill).trim()));
}
