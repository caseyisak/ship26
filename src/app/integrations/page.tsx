import React from 'react';

import MetafiAllIntegrations from '@/components/sections/metafi-all-integrations';
import MetafiIntegrationsHero from '@/components/sections/metafi-integrations-hero';

const page = () => {
  return (
    <>
      <MetafiIntegrationsHero />
      <MetafiAllIntegrations />
    </>
  );
};

export default page;
