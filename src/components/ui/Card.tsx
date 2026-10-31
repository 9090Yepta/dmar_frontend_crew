type CardProps = React.ComponentProps<'section'>;

export function Card({ className = '', ...props }: CardProps) {
  return <section className={`mt-4 rounded-2xl border border-[#e3e9e1] bg-white p-[22px_24px] ${className}`.trim()} {...props} />;
}
