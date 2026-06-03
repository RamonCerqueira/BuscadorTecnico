export type TicketStatus = 'open' | 'quoted' | 'in_progress' | 'resolved' | 'closed' | 'cancelled';
export type PaymentStatus = 'pending' | 'held_in_escrow' | 'released' | 'refunded';

export type Ticket = {
  id: string;
  title: string;
  description?: string;
  category?: string;
  status: TicketStatus | string;
  paymentStatus?: PaymentStatus | string;
  createdAt: string;
  assignedToId?: string | null;
  clientId?: string;
  locationText?: string;
  latitude?: number;
  longitude?: number;
  client?: { name: string; avatarUrl?: string };
};

export type Proposal = {
  id: string;
  price: number;
  message: string;
  status: 'pending' | 'accepted' | 'rejected' | string;
  createdAt: string;
  technicianId: string;
  technician?: {
    name: string;
    avatarUrl?: string;
    rating?: number;
    totalReviews?: number;
  };
};

export type TicketMessage = {
  id: string;
  content: string;
  senderId: string;
  createdAt: string;
  sender?: {
    name: string;
    avatarUrl?: string;
    userType?: string;
  };
};
