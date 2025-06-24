import { render, screen, waitFor } from '@testing-library/react'
import RoofReportCard from '../RoofReportCard'

// Mock fetch
beforeAll(() => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      json: () => Promise.resolve({ roof_id: 1, summary: 'Sample roof report' }),
    })
  ) as jest.Mock
})

afterAll(() => {
  ;(global.fetch as jest.Mock).mockRestore()
})

test('renders roof report data', async () => {
  render(<RoofReportCard />)
  expect(screen.getByText(/Loading/i)).toBeInTheDocument()
  await waitFor(() => screen.getByText(/Roof Report/))
  expect(screen.getByText(/Sample roof report/)).toBeInTheDocument()
})
