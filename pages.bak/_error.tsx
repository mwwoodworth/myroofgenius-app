import { NextPageContext } from 'next';
import * as Sentry from '@sentry/nextjs';
import { sendAlert } from '../app/lib/notify';
import Link from 'next/link';

function Error({ statusCode }: { statusCode: number | undefined }) {
  const message = statusCode
    ? `An error ${statusCode} occurred on server`
    : 'An unexpected error occurred';
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-4">
      <h1 className="text-2xl font-bold">Something went wrong</h1>
      <p className="text-gray-600">{message}</p>
      <Link href="/" className="text-secondary-700 hover:underline">Return Home</Link>
    </div>
  );
}

Error.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  if (err) {
    Sentry.captureException(err);
    sendAlert(`Next.js _error: ${err.message}`);
  }
  return { statusCode };
};

export default Error;
