import { render, screen } from '@testing-library/react'
import { RoofDemo } from '../../../components/roof-demo'

beforeAll(() => {
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
})

test('renders roof demo canvas', () => {
  render(<RoofDemo />)
  const canvas = screen.getByTestId('roof-demo')
  expect(canvas).toBeInTheDocument()
})
