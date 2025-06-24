export default function Success() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Thank you for your purchase!</h1>
        <p className="text-gray-600 mb-8">Check your email for download instructions.</p>
        <a href="/dashboard" className="text-blue-600 hover:underline">
          Go to Dashboard
        </a>
      </div>
    </div>
  )
}
