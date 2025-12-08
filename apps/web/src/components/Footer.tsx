export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-8 mt-auto">
      <div className="container mx-auto px-4 text-center">
        <p>
          &copy; {new Date().getFullYear()} Whats Up Addis. All rights reserved.
        </p>
        <p className="text-sm text-gray-400 mt-2">
          Discover events happening in Addis Ababa, Ethiopia
        </p>
      </div>
    </footer>
  );
}
