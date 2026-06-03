export type AuthResponse = {
  token: string;
  user: {
    id: string;
    email: string;
    userType: 'client' | 'technician' | 'company' | 'admin';
  };
};
