import { render, screen, waitFor } from '@testing-library/react';
import RoofReportCard from '../RoofReportCard';

beforeEach(() => {
  jest.useFakeTimers()
  global.fetch = jest.fn(() =>
    Promise.resolve({
      json: () =>
        Promise.resolve({
          status: 'OK',
          lastInspection: '2025-01-01T00:00:00Z',
          damageScore: 1,
        }),
    })
  ) as jest.Mock
})

afterEach(() => {
  jest.useRealTimers()
  ;(global.fetch as jest.Mock).mockReset()
})

test('fetches report and refreshes', async () => {
  render(<RoofReportCard />)
  expect(screen.getByText(/Loading/i)).toBeInTheDocument()

  await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1))
  expect(screen.getByTestId('report')).toHaveTextContent('OK')

  jest.advanceTimersByTime(30000)
  expect(screen.getByText(/Refreshing/i)).toBeInTheDocument()
  await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(2))
});
