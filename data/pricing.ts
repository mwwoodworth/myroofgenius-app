export interface Plan {
  name: string;
  price: string;
  features: string[];
}

const pricing: Plan[] = [
  {
    name: 'Starter',
    price: '$0',
    features: ['Access to basic tools', 'Community support'],
  },
  {
    name: 'Professional',
    price: '$49/mo',
    features: [
      'All starter features',
      'Advanced AI analysis',
      'Priority support',
    ],
  },
  {
    name: 'Enterprise',
    price: 'Contact us',
    features: [
      'Custom integrations',
      'Dedicated success manager',
    ],
  },
];

export default pricing;
