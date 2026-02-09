// User and Authentication Types
export interface User {
  id: string;
  email: string;
  name: string;
  initials: string;
  photoURL?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}
