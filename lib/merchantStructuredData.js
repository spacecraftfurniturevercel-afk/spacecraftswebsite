import { COMPANY } from './companyInfo'

export const SITE = COMPANY.url

export const RETURN_POLICY_ID = `${SITE}/#merchant-return-policy`
export const SHIPPING_SERVICE_ID = `${SITE}/#shipping-service`
export const ORGANIZATION_ID = `${SITE}/#organization`

/** Offer-level return policy (subset Google accepts under Offer). */
export function buildOfferReturnPolicy() {
  return {
    '@type': 'MerchantReturnPolicy',
    '@id': RETURN_POLICY_ID,
    applicableCountry: 'IN',
    returnPolicyCountry: 'IN',
    merchantReturnLink: `${SITE}/terms`,
    returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
    merchantReturnDays: 7,
    returnMethod: 'https://schema.org/ReturnByMail',
    returnFees: 'https://schema.org/ReturnFeesCustomerResponsibility',
    refundType: 'https://schema.org/FullRefund',
    itemCondition: 'https://schema.org/NewCondition',
  }
}

/** India delivery; rate varies by pin code — minimum typical charge for large furniture. */
export function buildOfferShippingDetails() {
  return {
    '@type': 'OfferShippingDetails',
    shippingDestination: {
      '@type': 'DefinedRegion',
      addressCountry: 'IN',
    },
    deliveryTime: {
      '@type': 'ShippingDeliveryTime',
      handlingTime: {
        '@type': 'QuantitativeValue',
        minValue: 1,
        maxValue: 3,
        unitCode: 'DAY',
      },
      transitTime: {
        '@type': 'QuantitativeValue',
        minValue: 3,
        maxValue: 14,
        unitCode: 'DAY',
      },
    },
    shippingRate: {
      '@type': 'MonetaryAmount',
      value: '499',
      currency: 'INR',
    },
    hasShippingService: {
      '@id': SHIPPING_SERVICE_ID,
    },
  }
}

export function buildOrganizationCommerceGraph() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'OnlineStore',
        '@id': ORGANIZATION_ID,
        name: COMPANY.name,
        url: SITE,
        logo: `${SITE}/favlogo/logo-01.png`,
        email: COMPANY.email,
        telephone: COMPANY.phoneTel,
        address: {
          '@type': 'PostalAddress',
          streetAddress: COMPANY.address.street,
          addressLocality: COMPANY.address.city,
          addressRegion: COMPANY.address.region,
          postalCode: COMPANY.address.postalCode,
          addressCountry: COMPANY.address.country,
        },
        hasMerchantReturnPolicy: buildOfferReturnPolicy(),
        hasShippingService: {
          '@type': 'ShippingService',
          '@id': SHIPPING_SERVICE_ID,
          name: 'Spacecrafts Furniture delivery across India',
          description:
            'Furniture delivery across India. Shipping charges depend on pin code, weight, and dimensions and are shown at checkout.',
          fulfillmentType: 'https://schema.org/FulfillmentTypeDelivery',
          shippingConditions: [
            {
              '@type': 'ShippingConditions',
              shippingDestination: {
                '@type': 'DefinedRegion',
                addressCountry: 'IN',
              },
              shippingRate: {
                '@type': 'MonetaryAmount',
                value: 499,
                currency: 'INR',
              },
              transitTime: {
                '@type': 'ServicePeriod',
                duration: {
                  '@type': 'QuantitativeValue',
                  minValue: 3,
                  maxValue: 14,
                  unitCode: 'DAY',
                },
              },
            },
          ],
        },
      },
    ],
  }
}
