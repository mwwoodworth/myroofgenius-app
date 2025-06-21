import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Navbar from '../Navbar';
import { ThemeProvider } from '../../context/ThemeContext';

test('renders site title', () => {
  render(
    <BrowserRouter>
      <ThemeProvider>
        <Navbar />
      </ThemeProvider>
    </BrowserRouter>
  );
  expect(screen.getByText('MyRoofGenius')).toBeInTheDocument();
});
