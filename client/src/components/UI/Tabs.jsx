import { useState } from "react";

export default function Tabs({ tabs, initial = 0, onChange }) {
  const [active, setActive] = useState(initial);

  const handleChange = (index) => {
    setActive(index);
    if (onChange) onChange(index);
  };

  return (
    <div className="w-full">
      <div className="flex gap-2 border-b border-gray-200 overflow-x-auto">
        {tabs.map((tab, index) => (
          <button
            key={index}
            type="button"
            onClick={() => handleChange(index)}
            className={`px-3 py-2 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap ${
              active === index
                ? "bg-white border border-b-white border-gray-200 text-gray-900"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            }`}
            aria-selected={active === index}
            role="tab"
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="pt-4" role="tabpanel">
        {tabs[active] && tabs[active].content}
      </div>
    </div>
  );
}
