export interface InternalContact {
  id: string;
  name: string;
  role?: string;
  email?: string;
}

export interface CustomerContact {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role?: string;
}

export interface Partner {
  id: string;
  name: string;
  type?: string;
  website?: string;
}

export interface Contract {
  id: string;
  name: string;
  description?: string;
}
