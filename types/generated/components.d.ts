import type { Schema, Struct } from '@strapi/strapi';

export interface ProfileEducation extends Struct.ComponentSchema {
  collectionName: 'components_profile_educations';
  info: {
    displayName: 'Education';
    icon: 'graduation-cap';
  };
  attributes: {
    degree: Schema.Attribute.String;
    description: Schema.Attribute.Text;
    endDate: Schema.Attribute.Date;
    field: Schema.Attribute.String;
    school: Schema.Attribute.String & Schema.Attribute.Required;
    startDate: Schema.Attribute.Date;
  };
}

export interface ProfileSocialLink extends Struct.ComponentSchema {
  collectionName: 'components_profile_social_links';
  info: {
    displayName: 'Social Link';
    icon: 'link';
  };
  attributes: {
    label: Schema.Attribute.String & Schema.Attribute.Required;
    url: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface ProfileWorkExperience extends Struct.ComponentSchema {
  collectionName: 'components_profile_work_experiences';
  info: {
    displayName: 'Work Experience';
    icon: 'briefcase';
  };
  attributes: {
    company: Schema.Attribute.String & Schema.Attribute.Required;
    description: Schema.Attribute.Blocks;
    endDate: Schema.Attribute.Date;
    isCurrent: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    startDate: Schema.Attribute.Date;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedLocation extends Struct.ComponentSchema {
  collectionName: 'components_shared_locations';
  info: {
    displayName: 'Location';
    icon: 'globe';
  };
  attributes: {
    city: Schema.Attribute.String;
    country: Schema.Attribute.String & Schema.Attribute.Required;
    region: Schema.Attribute.String;
    timezone: Schema.Attribute.String;
  };
}

export interface SharedSalaryRange extends Struct.ComponentSchema {
  collectionName: 'components_shared_salary_ranges';
  info: {
    displayName: 'Salary Range';
    icon: 'dollar-sign';
  };
  attributes: {
    currency: Schema.Attribute.String & Schema.Attribute.DefaultTo<'USD'>;
    max: Schema.Attribute.Integer;
    min: Schema.Attribute.Integer;
    negotiable: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    period: Schema.Attribute.Enumeration<['hour', 'month', 'year']> &
      Schema.Attribute.DefaultTo<'year'>;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'profile.education': ProfileEducation;
      'profile.social-link': ProfileSocialLink;
      'profile.work-experience': ProfileWorkExperience;
      'shared.location': SharedLocation;
      'shared.salary-range': SharedSalaryRange;
    }
  }
}
