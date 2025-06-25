import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import AIEstimator from '../../components/AIEstimator'
import { rest } from 'msw'
import { setupServer } from 'msw/node'

const server = setupServer(
  rest.post('/api/ai/analyze-roof', (req, res, ctx) => {
    return res(
      ctx.json({
        square_feet: 2000,
        material: 'asphalt shingle',
        condition: 'good',
        damage_areas: [],
        recommendations: ['Regular maintenance recommended'],
        estimated_remaining_life: 15,
        repair_cost_estimate: [1000, 2000],
        replacement_cost_estimate: [8000, 12000],
        confidence_scores: {
          area_measurement: 0.85,
          material_identification: 0.92,
          damage_assessment: 0.88
        }
      })
    )
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('AIEstimator', () => {
  it('renders upload interface initially', () => {
    render(<AIEstimator />)
    expect(screen.getByText(/drag & drop a roof photo/i)).toBeInTheDocument()
  })
  
  it('handles file upload and analysis', async () => {
    render(<AIEstimator />)
    
    // Mock file upload
    const file = new File(['test'], 'roof.jpg', { type: 'image/jpeg' })
    const input = screen.getByLabelText(/drag & drop/i)
    
    fireEvent.change(input, { target: { files: [file] } })
    
    // Click analyze button
    const analyzeButton = await screen.findByText(/analyze roof/i)
    fireEvent.click(analyzeButton)
    
    // Wait for results
    await waitFor(() => {
      expect(screen.getByText(/2,000/)).toBeInTheDocument()
      expect(screen.getByText(/asphalt shingle/i)).toBeInTheDocument()
      expect(screen.getByText(/good/i)).toBeInTheDocument()
    })
  })
  
  it('displays cost estimates correctly', async () => {
    render(<AIEstimator />)
    
    // ... upload and analyze ...
    
    await waitFor(() => {
      expect(screen.getByText(/\$1,000 - \$2,000/)).toBeInTheDocument()
      expect(screen.getByText(/\$8,000 - \$12,000/)).toBeInTheDocument()
    })
  })
  
  it('handles camera capture', async () => {
    // Mock getUserMedia
    const mockGetUserMedia = jest.fn(async () => ({
      getTracks: () => []
    }))
    
    Object.defineProperty(navigator.mediaDevices, 'getUserMedia', {
      value: mockGetUserMedia
    })
    
    render(<AIEstimator />)
    
    const cameraButton = screen.getByText(/open camera/i)
    fireEvent.click(cameraButton)
    
    expect(mockGetUserMedia).toHaveBeenCalledWith({ video: { facingMode: 'environment' } })
    
    await waitFor(() => {
      expect(screen.getByText(/capture/i)).toBeInTheDocument()
    })
  })
  
  it('generates report after analysis', async () => {
    render(<AIEstimator />)
    
    // Upload and analyze first
    const file = new File(['test'], 'roof.jpg', { type: 'image/jpeg' })
    const input = screen.getByLabelText(/drag & drop/i)
    fireEvent.change(input, { target: { files: [file] } })
    
    const analyzeButton = await screen.findByText(/analyze roof/i)
    fireEvent.click(analyzeButton)
    
    // Wait for results then generate report
    await waitFor(() => {
      const reportButton = screen.getByText(/generate full report/i)
      fireEvent.click(reportButton)
    })
    
    await waitFor(() => {
      expect(screen.getByText(/report ready/i)).toBeInTheDocument()
    })
  })
})
