export interface FAQ {
  question: string;
  answer: string;
}

const faqs: FAQ[] = [
  {
    question: 'How do I sign up?',
    answer: 'Click the Get Started button and create your free account.',
  },
  {
    question: 'Is there a free trial?',
    answer: 'Yes. All features are available free for 14 days.',
  },
  {
    question: 'Can my team use the platform?',
    answer: 'Paid plans include seats for your entire organization.',
  },
];

export default faqs;
