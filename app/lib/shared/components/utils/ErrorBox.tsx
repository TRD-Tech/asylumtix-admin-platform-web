interface Props {
  title: string;

  children: React.ReactNode;
}

export function ErrorBox({ title, children }: Props) {
  return (
    <div className="rounded-md w-full h-full p-4 bg-red-50">
      <h2 className="border-red-100 text-red-950">{title}</h2>

      <div className="mt-4">{children}</div>
    </div>
  );
}
