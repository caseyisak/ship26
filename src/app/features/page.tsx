import React from 'react';

import MetafiFeatureBenefits from '@/components/sections/metafi-feature-benefits';
import MetafiFeaturePricing from '@/components/sections/metafi-feature-pricing';
import MetafiFeaturesHero from '@/components/sections/metafi-features-section';
import MetafiIntegrations from '@/components/sections/metafi-integrations';
import MetafiFeaturesTabs from '@/components/sections/metafi-tabs';

const page = () => {
  return (
    <>
      <MetafiFeaturesHero />
      <MetafiFeatureBenefits />
      <MetafiFeaturesTabs />
      <MetafiFeaturePricing />
      <MetafiIntegrations />
    </>
  );
};

export default page;
