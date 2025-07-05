import { render } from '@testing-library/react';
import Card from '../../components/ui/Card';

test('renders children inside card', () => {
  const { getByText } = render(<Card>content</Card>);
  expect(getByText('content')).toBeInTheDocument();
});
