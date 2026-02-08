export interface iProduct {
  id: number;
  name: string;
  excerpt: null; //o que é isso ?
  type: "video" | "ebook" | "physical";
  content_delivery: string; //saber os tipos
  cover: string;
  warranty: number;
  sales_page_url: string | null;
  support_email: string | null;
  support_whatsapp: string;
  logo: string | null;
}
