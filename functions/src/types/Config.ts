export interface EnvironmentVariables {
  gmail: {
    email: string;
    clientId: string;
    clientSecret: string;
    refreshToken: string;
  };
  group_iso: {
    security_key: string;
  };
  core: {
    main_business_id: string;
  };
  paypal: {
    client_secret: string;
    client_id: string;
  };
}
