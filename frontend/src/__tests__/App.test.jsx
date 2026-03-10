import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Footer from '../components/Footer'

test('renders footer brand text', () => {
  render(
    <BrowserRouter>
      <Footer />
    </BrowserRouter>
  )

  const brandText = screen.getByText(/tribal marketplace/i)
  expect(brandText).toBeInTheDocument()
})
