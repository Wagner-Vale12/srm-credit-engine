type ErrorAlertProps = {
  message: string;
};

export function ErrorAlert({ message }: ErrorAlertProps) {
  if (!message) return null;

  return (
    <section className="error-card" role="alert">
      <strong>API error</strong>
      <pre>{message}</pre>
    </section>
  );
}
