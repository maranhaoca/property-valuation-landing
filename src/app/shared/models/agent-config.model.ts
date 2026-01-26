export interface AgentConfig {
    id: string;
    name: string;
    settings: {
        branding: {
            primaryColor: string;
            secondaryColor: string;
        };
    };
}