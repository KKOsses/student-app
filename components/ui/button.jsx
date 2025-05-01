export function Button({ children, variant = 'default', className = '', ...props }) {
  const base = 'px-4 py-2 rounded text-white';
  const styles = variant === 'secondary' ? 'bg-gray-500' : 'bg-blue-500';
  return <button className={\`\${base} \${styles} \${className}\`} {...props}>{children}</button>;
}