export interface Community {
  id: string;
  name: string;
  address: string;
  unit_count: number;
  created_at: number;
  updated_at: number | null;
}

export interface Resident {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  date_of_birth: string | null;
  community_id: string;
  status: string;
  created_at: number;
  updated_at: number | null;
  deleted_at: number | null;
}

export interface ResidentWithCommunity extends Resident {
  community_name: string;
}

export interface Event {
  id: string;
  title: string;
  description: string | null;
  community_id: string;
  event_type: string;
  starts_at: number;
  ends_at: number;
  all_day: number;
  capacity: number | null;
  created_by: string | null;
  created_at: number;
  updated_at: number | null;
}

export interface EventWithDetails extends Event {
  community_name: string;
  attendee_count: number;
}

export interface EventAttendee {
  id: string;
  resident_id: string;
  event_id: string;
  status: string;
  checked_in_at: number | null;
  created_at: number;
  updated_at: number | null;
}

export interface AttendeeWithResident extends EventAttendee {
  resident_name: string;
  resident_email: string;
}

export interface ComplianceRequirement {
  id: string;
  community_id: string;
  title: string;
  description: string | null;
  frequency: string;
  due_date: number;
  created_at: number;
  updated_at: number | null;
}

export interface ComplianceRequirementWithStats extends ComplianceRequirement {
  community_name: string;
  fulfilled_count: number;
  total_residents: number;
  fulfillment_rate: number;
}

export interface ComplianceFulfillment {
  id: string;
  requirement_id: string;
  resident_id: string;
  event_id: string | null;
  fulfilled_at: number;
  status: string;
  notes: string | null;
  created_at: number;
  updated_at: number | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface DashboardStats {
  totalResidents: number;
  totalCommunities: number;
  upcomingEvents: number;
  overdueCompliance: number;
  complianceRates: { community_name: string; rate: number }[];
}
