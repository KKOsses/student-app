import { useState } from 'react';

export function Tabs({ children, defaultValue }) {
  const [value, setValue] = useState(defaultValue);
  return (
    <div>
      {React.Children.map(children, (child) =>
        child.type.name === 'TabsList'
          ? React.cloneElement(child, { value, setValue })
          : child.type.name === 'TabsContent' && child.props.value === value
            ? child
            : null
      )}
    </div>
  );
}

export function TabsList({ children, value, setValue }) {
  return <div className="flex space-x-4 mb-4">{React.Children.map(children, child => React.cloneElement(child, { value, setValue }))}</div>;
}

export function TabsTrigger({ children, value: tabValue, value: current, setValue }) {
  const active = current === tabValue;
  return (
    <button onClick={() => setValue(tabValue)} className={\`px-4 py-2 rounded \${active ? 'bg-blue-500 text-white' : 'bg-gray-200'}\`}>
      {children}
    </button>
  );
}

export function TabsContent({ children }) {
  return <div>{children}</div>;
}