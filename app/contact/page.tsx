export const metadata = { title: 'Contact | MyRoofGenius' };

export default function Page() {
  return (
    <main className="min-h-screen py-16 container mx-auto px-4">
      <h1 className="text-3xl font-bold mb-4">Contact Us</h1>
      <p className="mb-4">
        Reach out to our team at{' '}
        <a href="mailto:support@myroofgenius.com" className="text-blue-600 hover:underline">support@myroofgenius.com</a>.
      </p>
    </main>
  );
}
