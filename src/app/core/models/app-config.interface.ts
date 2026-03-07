export interface AppConfig {
  id: string;
  name: string;
  settings: {
    branding?: {
      primaryColor?: string;
      secondaryColor?: string;
    };
  };
}
