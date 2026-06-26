// components/footer.tsx
export function Footer() {
  return (
    <footer className="bg-green-900 px-6 py-8 text-white">
      <div className="mx-auto max-w-6xl text-center">
        <p className="text-sm text-green-200">
          &copy; {new Date().getFullYear()} Tamimi Welfare Trust. All rights
          reserved.
        </p>
        <p className="mt-1 text-xs text-green-300">
          Built with compassion &mdash; serving our community.
        </p>
      </div>
    </footer>
  );
}