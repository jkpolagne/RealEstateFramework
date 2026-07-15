export type PropertyType = 'House' | 'Lot' | 'House and Lot';
export type PropertyStatus = 'available' | 'reserved' | 'sold';
export type TurnoverStatus = 'Ready for turnover' | 'Under construction';

export interface Developer {
  id: string;
  name: string;
  totalCutPercent: number;
  status: 'active' | 'inactive';
  directSale: { brokerPercent: number; salesManagerPercent: number };
  referredSale: {
    brokerPercent: number;
    salesManagerPercent: number;
    salesPersonPercent: number;
  };
}

export interface Property {
  id: string;
  name: string;
  developerId: string;
  developerName: string;
  type: PropertyType;
  price: number;
  status: PropertyStatus;
  location: {
    address: string;
    lat: number;
    lng: number;
  };
  lotArea: number;
  floorArea: number;
  bedrooms: number;
  bathrooms: number;
  turnoverStatus: TurnoverStatus;
  houseModel: string;
  description: string;
  features: string[];
  amenities: string[];
  heroImage: string;
  gallery: string[];
}

export interface LoanQuotation {
  id: string;
  propertyId: string;
  developerId: string;
  propertyPrice: number;
  interestRate: number;
  downPaymentPercent: number;
  downPaymentAmount: number;
  termMonths: number;
  monthlyAmortization: number;
  netLoanAmount: number;
  totalInterestPaid: number;
  totalAmountPayable: number;
  principal: number;
  paymentBreakdownDescription: string;
}

export interface ConsultantLink {
  id: string;
  slug: string;
  consultantId: string;
  consultantName: string;
  role: 'Sales Manager' | 'Sales Person';
  contactNumber: string;
  email: string;
  status: 'active' | 'inactive';
}

export interface VisitRequest {
  id: string;
  propertyId: string;
  fullName: string;
  email: string;
  phone: string;
  preferredDate: string;
  preferredTime: string;
  notes: string;
  status: 'Pending' | 'Approved' | 'Declined';
  sourceLinkId: string | null;
  createdAt: string;
}

export interface PropertyFilters {
  search?: string;
  location?: string;
  type?: PropertyType | 'All';
  minPrice?: number;
  maxPrice?: number;
  minFloorArea?: number;
  houseModel?: string;
  bedrooms?: number | 'Any';
}

export interface AddDeveloperInput {
  name: string;
  totalCutPercent: number;
  status: 'active' | 'inactive';
  directSale: { brokerPercent: number; salesManagerPercent: number };
  referredSale: {
    brokerPercent: number;
    salesManagerPercent: number;
    salesPersonPercent: number;
  };
}

export interface AddPropertyInput {
  name: string;
  developerId: string;
  type: PropertyType;
  price: number;
  status: PropertyStatus;
  address: string;
  lat: number;
  lng: number;
  lotArea: number;
  floorArea: number;
  bedrooms: number;
  bathrooms: number;
  turnoverStatus: TurnoverStatus;
  houseModel: string;
  description: string;
  features: string[];
  amenities: string[];
  /** Data URLs from client-side file reads — first becomes the hero image. */
  images: string[];
}

export interface AddLoanQuotationInput {
  propertyId: string;
  interestRate: number;
  downPaymentPercent: number;
  downPaymentAmount: number;
  termMonths: number;
  monthlyAmortization: number;
  paymentBreakdownDescription: string;
}

export interface Company {
  id: string;
  /** Sequential display code, e.g. "C-001". */
  code: string;
  name: string;
  address: string;
  email: string;
  contactNumber: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface AddCompanyInput {
  name: string;
  address: string;
  email: string;
  contactNumber: string;
  status: 'active' | 'inactive';
}

export interface CompanyAdminAccount {
  id: string;
  companyId: string;
  name: string;
  email: string;
  temporaryPassword: string;
  createdAt: string;
}

export interface AddCompanyAdminInput {
  companyId: string;
  name: string;
  email: string;
  temporaryPassword: string;
}

export type SystemLogEventType = 'company_created' | 'company_status_changed' | 'admin_created';

export interface SystemLogEntry {
  id: string;
  type: SystemLogEventType;
  message: string;
  companyId: string | null;
  timestamp: string;
}
