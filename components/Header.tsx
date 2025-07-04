import SearchBar from './SearchBar';

export default function Header() {
  return (
    <header className="w-full px-6 py-4 flex items-center justify-between border-b">
      <span className="text-lg font-semibold">MyRoofGenius</span>
      <div className="w-48">
        <SearchBar />
      </div>
    </header>
  );
}
