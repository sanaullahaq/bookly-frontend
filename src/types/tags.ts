// --- Tags ---

export interface TagOut {
  uid: string;
  name: string;
  created_at: string;
}
export interface TagCreate {
  name: string;
}

export interface TagAdd {
  tags: TagCreate[];
}
