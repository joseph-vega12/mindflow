export * from './Config';
export * from './Email';

// Undefined enums https://stackoverflow.com/questions/47418124/enum-type-not-defined-at-runtime
export enum ELicenseStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  EXPIRED = 'EXPIRED'
}

export enum ELicenseType {
  INDIVIDUAL = 'INDIVIDUAL',
  BUSINESS_OWNER = 'BUSINESS_OWNER',
  BETA_USER = 'BETA_USER',
  BUSINESS_STUDENT = 'BUSINESS_STUDENT'
}
