import { render, screen, waitFor } from '@testing-library/react';
import RoofReportCard from '../RoofReportCard';

beforeEach(() => {
  jest.useFakeTimers();
  global.fetch = jest.fn(() =>
    Promise.resolve({
      json: () => Promise.resolve({ report: 'All clear' })
    })
  ) as jest.Mock;
});

afterEach(() => {
  jest.useRealTimers();
  (global.fetch as jest.Mock).mockReset();
});

test('fetches report and refreshes', async () => {
  render(<RoofReportCard />);
  expect(screen.getByText(/Loading/i)).toBeInTheDocument();

  await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));
  expect(screen.getByTestId('report')).toHaveTextContent('All clear');

  jest.advanceTimersByTime(30000);
  await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(2));
});
