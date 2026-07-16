export type PropertyType = 'House' | 'Lot' | 'House and Lot';
export type PropertyStatus = 'available' | 'reserved' | 'sold';
export type TurnoverStatus = 'Ready for turnover' | 'Under construction';

export interface Developer {
  id: string;
  companyId: string;
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
  companyId: string;
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
  groundFloorPlan: string | null;
  secondFloorPlan: string | null;
}

export interface LoanQuotation {
  id: string;
  companyId: string;
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
  companyId: string;
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
  companyId: string;
  propertyId: string;
  fullName: string;
  email: string;
  phone: string;
  preferredDate: string;
  preferredTime: string;
  notes: string;
  status: 'Pending' | 'Approved' | 'Declined';
  sourceLinkId: string;
  clientId: string;
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
  companyId: string;
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
  companyId: string;
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
  groundFloorPlan: string | null;
  secondFloorPlan: string | null;
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

export type ConsultantRole = 'Broker' | 'Sales Manager' | 'Sales Person';

export interface ConsultantAccount {
  id: string;
  companyId: string;
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  contactNumber: string;
  password: string;
  role: ConsultantRole;
  /** Broker id for a Sales Manager, Sales Manager id for a Sales Person — null for Broker. */
  assignedUnderId: string | null;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface AddConsultantAccountInput {
  companyId: string;
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  contactNumber: string;
  password: string;
  role: ConsultantRole;
  assignedUnderId: string | null;
  status: 'active' | 'inactive';
}

export type SaleType = 'Direct' | 'Referred';

export interface Sale {
  id: string;
  propertyId: string;
  developerId: string;
  buyerName: string;
  salePrice: number;
  saleType: SaleType;
  saleDate: string;
  brokerId: string | null;
  salesManagerId: string | null;
  salesPersonId: string | null;
}

export interface Notification {
  id: string;
  companyId: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export type PaymentMethod = 'Cash' | 'In-House' | 'Bank Financing';
export type EmploymentStatus = 'OFW' | 'Locally Employed' | 'Self-Employed';
export type ChecklistPhase = 'Basic' | 'Complete';

export interface ChecklistItem {
  id: string;
  label: string;
  phase: ChecklistPhase;
  checked: boolean;
  verifiedBy: string | null;
  verifiedDate: string | null;
}

export type ClientStatus = 'Pending Setup' | 'Active';

export interface Client {
  id: string;
  companyId: string;
  fullName: string;
  email: string;
  phone: string;
  employmentStatus: EmploymentStatus | null;
  propertyId: string;
  developerId: string;
  salePrice: number;
  saleType: SaleType;
  /** Null until the assigned consultant sets up the client (see ClientStatus). */
  paymentMethod: PaymentMethod | null;
  /** 1 for Cash, 4 for In-House / Bank Financing. 0 until set up. */
  totalTranches: number;
  brokerId: string;
  salesManagerId: string;
  salesPersonId: string | null;
  addedDate: string;
  paymentProgressPercent: number;
  requirementsChecklist: ChecklistItem[];
  lastContactedDate: string | null;
  notes: string;
  /** Pending Setup: created from a visit request, awaiting payment method/employment status. Active: fully set up and payable. */
  status: ClientStatus;
}

export interface PaymentRecord {
  id: string;
  companyId: string;
  clientId: string;
  amount: number;
  paymentDate: string;
  method: string;
  /** Data URL of the uploaded proof-of-payment image (receipt/deposit slip). */
  proofImage: string;
  uploadedById: string;
  createdAt: string;
}

export interface ConsultantNotification {
  id: string;
  companyId: string;
  /** A consultantId, or 'all' for a broker-wide announcement. */
  recipientId: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export type VoucherStatus = 'Pending Signature' | 'Signed' | 'Disputed' | 'Released';
export type VoucherRole = 'Broker' | 'Sales Manager' | 'Sales Person';

export interface CommissionVoucher {
  id: string;
  companyId: string;
  clientId: string;
  developerId: string;
  developerName: string;
  role: VoucherRole;
  consultantId: string;
  consultantName: string;
  releaseNumber: number;
  totalReleases: number;
  ratePercent: number;
  dateDisbursed: string | null;
  paidTo: string;
  buyerName: string;
  rsDate: string;
  ntcp: number;
  blockLot: string;
  checkNumber: string;
  bank: string;
  grossCommission: number;
  lessEwt: number;
  grossCommissionReleasedFrom: string;
  lessAdcom: number;
  totalCommissionDue: number;
  lessMiscTax: number;
  otherDeductions: number;
  netCommissionReceivable: number;
  approvedByBroker: string | null;
  receivedByConsultant: string | null;
  /** Data URL of the consultant's drawn e-signature, captured when they sign. */
  signatureDataUrl: string | null;
  status: VoucherStatus;
  signedDate: string | null;
  releasedDate: string | null;
  disputeReason: string | null;
  createdAt: string;
}
