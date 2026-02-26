export function composeButtonClasses(classes: string[], isFloating: boolean): string {
  if (isFloating) {
    classes.push('floating');
  }
  return classes.filter(Boolean).join(' ');
}
