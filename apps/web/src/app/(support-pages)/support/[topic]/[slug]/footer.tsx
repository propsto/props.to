export default function SupportFooter() {
  return (
    <footer className="pt-8 mt-8 border-t border-slate-200">
      <div className="flex items-center space-x-6">
        <div className="text-lg font-bold text-slate-800">
          Was this page helpful?
        </div>
        <div className="flex items-center space-x-2">
          <button className="btn-sm text-sm px-3 py-1.5 inline-flex items-center text-blue-50 bg-blue-500 hover:bg-blue-600 shadow-sm">
            <svg
              className="shrink-0 fill-blue-300 mr-2"
              width="12"
              height="13"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M9.956 4.516H6.731v-3a1.314 1.314 0 0 0-1.5-1.5.5.5 0 0 0-.45.375L3 6.016v6h6.431c.985-.02 1.81-.75 1.95-1.725l.6-3.45a1.9 1.9 0 0 0-.45-1.575 1.884 1.884 0 0 0-1.575-.75ZM0 6.016h2v6H0z" />
            </svg>
            <span>Yes</span>
          </button>
          <button className="btn-sm text-sm px-3 py-1.5 inline-flex items-center text-blue-50 bg-blue-500 hover:bg-blue-600 shadow-sm">
            <svg
              className="shrink-0 fill-blue-300 mr-2"
              width="12"
              height="13"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M9.956 7.5H6.731v3a1.314 1.314 0 0 1-1.5 1.5.5.5 0 0 1-.45-.375L3 6V0h6.431c.985.02 1.81.75 1.95 1.725l.6 3.45a1.9 1.9 0 0 1-.45 1.575c-.37.493-.959.773-1.575.75ZM0 6h2V0H0z" />
            </svg>
            <span>Nope</span>
          </button>
        </div>
      </div>
    </footer>
  );
}
