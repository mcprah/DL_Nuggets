export interface ListedItem {
  id?: string;
  value?: string;
  content?: string;
  source?: string;
  metadata?: any;
}

export interface ArgumentEntry {
  party: string;
  argument: string;
}

export interface OpinionEntry {
  judge?: string;
  content?: string;
  opinion?: string;
  argument?: string;
  party?: string;
}

export interface CaseDigest {
  case_id: number;
  title: string;
  dl_citation_no: string;
  court_type?: string;
  region?: string;
  date?: string;
  judges?: string[];
  summary?: string;
  facts?: ListedItem[];
  issues?: ListedItem[];
  arguments?: ArgumentEntry[];
  holding?: ListedItem[];
  ratio_decidendi?: string;
  obiter_dicta?: ListedItem[];
  concurring_opinions?: OpinionEntry[];
  dissenting_opinions?: OpinionEntry[];
  laws_cited?: ListedItem[];
  cases_cited?: ListedItem[];
  subject_matter?: ListedItem[];
  keywords?: ListedItem[];
  vector_store_id?: string;
  file_id?: string;
  success?: boolean;
}

export interface CaseDigestResponse {
  success: boolean;
  message: string;
  data: CaseDigest;
  status_code: number;
  timestamp: string;
}