export interface Metric {
  title: string;
  value: string;
  trend: string;
  trendDirection: 'up' | 'down' | 'neutral';
}

export interface TopProperty {
  id: number;
  name: string;      // Coincide con tu JSON
  type: string;      // Coincide con tu JSON ("Venta")
  price: number;
  views: number;
}

export interface Inquiry {
  id: number;
  userName: string;     // Coincide con tu JSON
  userEmail: string;    // Coincide con tu JSON
  propertyName: string; // Coincide con tu JSON
  date: string;
}

export interface DashboardResponse {
  metrics: Metric[];
  topProperties: TopProperty[];
  inquiries: Inquiry[];
}