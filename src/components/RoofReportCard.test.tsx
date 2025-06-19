import { render, screen } from '@testing-library/react';
import RoofReportCard from './RoofReportCard';

beforeEach(() => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      json: () => Promise.resolve({ report: 'sample' })
    })
  ) as jest.Mock;
});

it('fetches and displays the roof report', async () => {
  render(<RoofReportCard />);
  expect(screen.getByText(/Loading/i)).toBeInTheDocument();
  const pre = await screen.findByTestId('report');
  expect(pre.textContent).toContain('sample');
});
