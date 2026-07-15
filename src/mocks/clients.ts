import type { Client } from '../types';
import { buildRequirementsChecklist } from '../lib/checklist';

function checkOff(checklist: Client['requirementsChecklist'], labels: string[], verifiedBy: string, verifiedDate: string) {
  for (const item of checklist) {
    if (labels.includes(item.label)) {
      item.checked = true;
      item.verifiedBy = verifiedBy;
      item.verifiedDate = verifiedDate;
    }
  }
  return checklist;
}

const carloChecklist = buildRequirementsChecklist('Bank Financing', 'Locally Employed');
checkOff(
  carloChecklist,
  ['2 valid IDs', 'Certificate of Employment w/ Compensation', 'Payslips (last 3 months)', 'Income Tax Return (ITR)', 'Proof of Billing Address', 'Verified TIN'],
  'Sean Rey Bonganay',
  '2026-06-20',
);

const ronaldoChecklist = buildRequirementsChecklist('In-House', null);
checkOff(ronaldoChecklist, ['Proof of Income', 'Valid Government ID'], 'Kristine Joy Formales', '2026-04-10');

const angelineChecklist = buildRequirementsChecklist('Cash', null);
checkOff(angelineChecklist, ['Valid ID', 'Declaration of Source of Funds'], 'Mark Anthony Buenaflor', '2026-07-08');

const ferdinandChecklist = buildRequirementsChecklist('Bank Financing', 'OFW');
checkOff(ferdinandChecklist, ['2 valid IDs'], 'Kristine Joy Formales', '2026-07-11');

export const clients: Client[] = [
  {
    id: 'client-carlo-reyes',
    fullName: 'Carlo Reyes',
    email: 'carlo.reyes@gmail.com',
    phone: '0917-222-3333',
    employmentStatus: 'Locally Employed',
    propertyId: 'prop-unit4b-riverside',
    developerId: 'dev-golden-horizon',
    salePrice: 2_300_000,
    saleType: 'Referred',
    paymentMethod: 'Bank Financing',
    totalTranches: 4,
    brokerId: 'consultant-jann-kevin',
    salesManagerId: 'consultant-jerome-mark',
    salesPersonId: 'consultant-sean-rey',
    addedDate: '2026-06-01',
    paymentProgressPercent: 78,
    requirementsChecklist: carloChecklist,
    lastContactedDate: '2026-07-10',
    notes: 'Steady payer, following up for Complete-phase documents.',
  },
  {
    id: 'client-ronaldo-mendiola',
    fullName: 'Ronaldo Mendiola',
    email: 'ronaldo.mendiola@gmail.com',
    phone: '0917-444-5555',
    employmentStatus: null,
    propertyId: 'prop-rowhouse9-meadowbrook',
    developerId: 'dev-golden-horizon',
    salePrice: 2_750_000,
    saleType: 'Direct',
    paymentMethod: 'In-House',
    totalTranches: 4,
    brokerId: 'consultant-jann-kevin',
    salesManagerId: 'consultant-kristine-joy',
    salesPersonId: null,
    addedDate: '2026-02-15',
    paymentProgressPercent: 100,
    requirementsChecklist: ronaldoChecklist,
    lastContactedDate: '2026-05-20',
    notes: 'Fully paid and turned over.',
  },
  {
    id: 'client-angeline-bautista',
    fullName: 'Angeline Bautista',
    email: 'angeline.bautista@gmail.com',
    phone: '0917-666-7777',
    employmentStatus: null,
    propertyId: 'prop-unit2-emerald',
    developerId: 'dev-bicol-homes',
    salePrice: 1_850_000,
    saleType: 'Referred',
    paymentMethod: 'Cash',
    totalTranches: 1,
    brokerId: 'consultant-jann-kevin',
    salesManagerId: 'consultant-jerome-mark',
    salesPersonId: 'consultant-mark-anthony',
    addedDate: '2026-07-08',
    paymentProgressPercent: 100,
    requirementsChecklist: angelineChecklist,
    lastContactedDate: '2026-07-09',
    notes: 'Paid in full on reservation day.',
  },
  {
    id: 'client-ferdinand-olarte',
    fullName: 'Ferdinand Olarte',
    email: 'ferdinand.olarte@gmail.com',
    phone: '0917-888-9999',
    employmentStatus: 'OFW',
    propertyId: 'prop-unit10-hilltop',
    developerId: 'dev-bicol-homes',
    salePrice: 5_200_000,
    saleType: 'Direct',
    paymentMethod: 'Bank Financing',
    totalTranches: 4,
    brokerId: 'consultant-jann-kevin',
    salesManagerId: 'consultant-kristine-joy',
    salesPersonId: null,
    addedDate: '2026-07-11',
    paymentProgressPercent: 10,
    requirementsChecklist: ferdinandChecklist,
    lastContactedDate: '2026-07-11',
    notes: 'Just reserved — waiting on remaining Basic documents before first tranche.',
  },
];
