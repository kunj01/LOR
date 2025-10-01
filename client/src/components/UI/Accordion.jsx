import { useState } from "react";

export default function Accordion({ items, defaultOpenIndex = -1 }) {
  const [openIndex, setOpenIndex] = useState(defaultOpenIndex);

  const toggle = (index) => {
    setOpenIndex((prev) => (prev === index ? -1 : index));
  };

  return (
    <div className="divide-y divide-gray-200">
      {items.map((item, index) => (
        <div key={index} className="py-3">
          <button
            type="button"
            onClick={() => toggle(index)}
            className="w-full flex items-center justify-between text-left"
            aria-expanded={openIndex === index}
          >
            <span className="font-medium text-gray-900">{item.title}</span>
            <span className="text-gray-500">
              {openIndex === index ? "−" : "+"}
            </span>
          </button>
          {openIndex === index && (
            <div className="mt-3 text-gray-700">{item.content}</div>
          )}
        </div>
      ))}
    </div>
  );
}
