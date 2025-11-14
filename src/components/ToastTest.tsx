"use client";

import toast from 'react-hot-toast';
import { useState } from 'react';

export default function ToastTest() {
  const [counter, setCounter] = useState(0);

  const showSuccessToast = () => {
    toast.success(`Test success toast #${counter + 1}`, {
      duration: 4000,
      id: `test-success-${counter}`,
    });
    setCounter(c => c + 1);
  };

  const showErrorToast = () => {
    toast.error(`Test error toast #${counter + 1}`, {
      duration: 4000,
      id: `test-error-${counter}`,
    });
    setCounter(c => c + 1);
  };

  const dismissAllToasts = () => {
    toast.dismiss();
  };

  return (
    <div className="p-8 space-y-4">
      <h2 className="text-xl font-bold">Toast Test</h2>
      <div className="space-x-4">
        <button
          onClick={showSuccessToast}
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          Show Success Toast
        </button>
        <button
          onClick={showErrorToast}
          className="px-4 py-2 bg-red-600 text-white rounded"
        >
          Show Error Toast
        </button>
        <button
          onClick={dismissAllToasts}
          className="px-4 py-2 bg-gray-600 text-white rounded"
        >
          Dismiss All
        </button>
      </div>
      <p>Counter: {counter}</p>
    </div>
  );
}
