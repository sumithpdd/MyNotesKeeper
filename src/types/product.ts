export interface Product {
  id: string;
  name: string;
  version?: string;
  description?: string;
  status?: 'Active' | 'Inactive' | 'Planned' | 'Deprecated';
}
