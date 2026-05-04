export interface Product {
  id: string;
  name: string;
  version?: string;
  description?: string;
  /** Marketing / docs URL for the product (optional). */
  website?: string;
  status?: 'Active' | 'Inactive' | 'Planned' | 'Deprecated';
}
