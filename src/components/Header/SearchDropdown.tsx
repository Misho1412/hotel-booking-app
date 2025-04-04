import { FC, Fragment, useState } from "react";
import { Popover, Transition } from "@headlessui/react";
import { useRouter } from "next/navigation";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

interface SearchDropdownProps {
  className?: string;
}

const SearchDropdown: FC<SearchDropdownProps> = ({ className = "" }) => {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      router.push(`/hotels/search?city=${encodeURIComponent(searchValue.trim())}`);
    }
  };

  return (
    <div className={`flex items-center ${className}`}>
      <Popover className="relative">
        {({ open }) => (
          <>
            <Popover.Button
              className={`
                ${open ? "" : "text-opacity-90"}
                group px-4 py-2 border border-neutral-200 hover:border-neutral-300 dark:border-neutral-700 rounded-full inline-flex items-center text-sm text-gray-700 dark:text-neutral-300 dark:hover:text-white font-medium hover:text-opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75`}
            >
              <MagnifyingGlassIcon className="w-5 h-5 mr-2" />
              <span>Search hotels</span>
            </Popover.Button>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-200"
              enterFrom="opacity-0 translate-y-1"
              enterTo="opacity-100 translate-y-0"
              leave="transition ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 translate-y-1"
            >
              <Popover.Panel className="absolute z-10 w-screen max-w-xs sm:max-w-sm mt-3 px-4 sm:px-0">
                <div className="overflow-hidden rounded-2xl shadow-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700">
                  <div className="relative p-5">
                    <form onSubmit={handleSubmit} className="w-full">
                      <div className="relative">
                        <input
                          type="text"
                          className="block w-full rounded-full border border-neutral-200 dark:border-neutral-700 focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-50 bg-white dark:bg-neutral-900 px-4 py-2.5 text-sm font-medium text-neutral-700 dark:text-neutral-200"
                          placeholder="Type destination or hotel name"
                          value={searchValue}
                          onChange={(e) => setSearchValue(e.target.value)}
                        />
                        <button 
                          type="submit" 
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
                        >
                          <MagnifyingGlassIcon className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="mt-5 text-sm">
                        <h3 className="font-semibold mb-2 text-neutral-800 dark:text-neutral-200">
                          Popular destinations:
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {['New York', 'Paris', 'London', 'Tokyo', 'Dubai'].map((city) => (
                            <button
                              key={city}
                              type="button"
                              className="px-3 py-1.5 rounded-full bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300"
                              onClick={() => {
                                setSearchValue(city);
                                router.push(`/hotels/search?city=${encodeURIComponent(city)}`);
                              }}
                            >
                              {city}
                            </button>
                          ))}
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </Popover.Panel>
            </Transition>
          </>
        )}
      </Popover>
    </div>
  );
};

export default SearchDropdown; 