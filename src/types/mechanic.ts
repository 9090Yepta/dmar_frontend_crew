export type ApiResult<T> = { ok: boolean; data?: T; error?: { message: string } };

export type User = {
  id: number;
  nrpp: string;
  name: string;
  position: string;
  portal: string;
  role: string;
  jobSiteId: number | null;
  jobSiteName: string | null;
  profileImageUrl?: string | null;
};

export type SessionPayload = ApiResult<{ user: User; csrfToken: string }>;

export type Report = {
  id: number;
  foremanId: number;
  foremanName?: string;
  date: string;
  unitCode: string | null;
  model: string | null;
  hm: string;
  problem: string;
  activity: string;
  activities?: string[];
  start: string;
  finish: string;
  codeJob: string;
  component: string;
  remark: string;
  approved: number;
  unitStatus: number;
};

export type ReportSummary = {
  total: number;
  pending: number;
  approved: number;
  days: { date: string; total: number; pending: number; approved: number }[];
};

export type Catalogs = {
  foremen: { id: number; name: string; profileImageUrl?: string | null }[];
  jobCodes: { description: string; groupCode: number }[];
  components: string[];
  units: { unitCode: string; model: string; brand: string; imageUrl?: string | null }[];
};

export type ReportFormValues = {
  foremanId: string;
  date: string;
  unitCode: string;
  hm: string;
  problem: string;
  activities: string[];
  shift: 'day' | 'night';
  start: string;
  finish: string;
  codeJob: string;
  unitStatus: string;
  component: string;
  remark: string;
};

export type ReportSubmitResult = {
  ok: boolean;
  message?: string;
};

