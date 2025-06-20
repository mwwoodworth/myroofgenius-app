export interface Testimonial {
  quote: string;
  name: string;
  title: string;
}

const testimonials: Testimonial[] = [
  {
    quote:
      'MyRoofGenius prevented a $180K estimation error on our hospital project. The AI caught material compatibility issues our manual process missed.',
    name: 'Sarah Chen',
    title: 'Senior Project Manager, Metro Construction',
  },
  {
    quote:
      'The specification verification system identified code compliance gaps that would have caused major delays.',
    name: 'Marcus Rodriguez',
    title: 'Principal, Rodriguez Architecture',
  },
];

export default testimonials;
