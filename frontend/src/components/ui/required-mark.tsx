/** Marks a required field. Decorative: the control itself carries the semantics. */
export function RequiredMark() {
  return (
    <span className="text-[var(--seal-red)]" aria-hidden>
      *
    </span>
  );
}
