import PageWrapper from '@/app/components/PageWrapper'
import { PricingTable } from '@clerk/nextjs'
import React from 'react'

function Billing() {
  return (
<PageWrapper>
      <div>
        <h2 className='font-bold text-3xl mb-6'>Select Plan</h2>
        <PricingTable />
    </div>
</PageWrapper>
  )
}

export default Billing