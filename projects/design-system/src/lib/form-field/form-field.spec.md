# Form Field Component

A composable form field that wraps an input with a label, validation errors, and hints while managing accessibility attributes automatically.

## Import

```ts
import { OTP_FORM_FIELD } from '@design-system';
```

`OTP_FORM_FIELD` is a const array containing all form-field-related components and directives (including `InputComponent`). Add it to your component's `imports`.

## Components & Directives

### `<otp-form-field>`

Root container. Wraps the input, label, error, and hint elements. Automatically links the label to the input via `for`/`id`, manages `aria-describedby` on the input, and toggles between error and hint display based on control state.

| Host class       | Condition                              |
| ---------------- | -------------------------------------- |
| `disabled`       | The underlying `FormControl` is disabled |
| `error-visible`  | The control is invalid **and** touched  |

### `otp-input`

Attribute directive applied to `<input>` or `<textarea>`. Generates a unique `id` (unless one is already set), and binds `aria-invalid`, `aria-required`, and `aria-describedby` automatically.

| Selector                                  | Description                  |
| ----------------------------------------- | ---------------------------- |
| `input[otp-input]`, `textarea[otp-input]` | Marks the element as the form field's input |

### `<otp-label>`

Directive that marks the label content. The `<otp-form-field>` wraps it in a `<label>` element linked to the input's `id`. A `*` indicator is appended automatically when the input has a `Validators.required` validator.

### `<otp-error>`

Directive for validation error messages. Auto-generates a unique `id` used for `aria-describedby` on the input. Only visible when the control is invalid **and** touched.

### `<otp-hint>`

Directive for hint text below the input. Auto-generates a unique `id` used for `aria-describedby` on the input. Visible when no error is shown.

### `<otp-hint-right>`

Directive for right-aligned hint text (e.g. character counts). Displayed alongside `<otp-hint>` inside the hint wrapper.

### `[otp-input-prefix]` / `[otp-input-suffix]`

Attribute directives for content projected before/after the input inside the input wrapper (e.g. icons, currency symbols).

## Accessibility

- `<label>` is automatically linked to the input via `for`/`id`
- `aria-describedby` on the input points to the hint or error, depending on state
- `aria-invalid` is set when the control is invalid and touched
- `aria-required` is set when the control has a `Validators.required` validator
- A `*` is appended to the label text for required fields

## Usage Examples

### Basic form field with validation

```ts
control = new FormControl('', [Validators.required]);
```

```html
<otp-form-field>
  <otp-label>Username</otp-label>
  <input otp-input [formControl]="control" />
  <otp-error>This field is required</otp-error>
  <otp-hint>Enter your username</otp-hint>
</otp-form-field>
```

When the control is untouched, the hint is displayed. Once touched and invalid, the error replaces the hint.

### Form field with hint and character count

```ts
name = new FormControl('', [Validators.required, Validators.maxLength(50)]);
```

```html
<otp-form-field>
  <otp-label>Display name</otp-label>
  <input otp-input [formControl]="name" />
  <otp-error>Name is required</otp-error>
  <otp-hint>Visible to other users</otp-hint>
  <otp-hint-right>{{ name.value?.length ?? 0 }}/50</otp-hint-right>
</otp-form-field>
```

### Form field with prefix and suffix

```html
<otp-form-field>
  <otp-label>Amount</otp-label>
  <span otp-input-prefix>$</span>
  <input otp-input type="number" [formControl]="amount" />
  <span otp-input-suffix>.00</span>
  <otp-hint>Enter amount in USD</otp-hint>
</otp-form-field>
```

### Optional field (no validation)

```ts
notes = new FormControl('');
```

```html
<otp-form-field>
  <otp-label>Notes</otp-label>
  <textarea otp-input [formControl]="notes"></textarea>
  <otp-hint>Any additional information</otp-hint>
</otp-form-field>
```

No `*` indicator is shown and no error toggle occurs since there are no validators.

### Disabled field

```ts
email = new FormControl({ value: 'user@example.com', disabled: true });
```

```html
<otp-form-field>
  <otp-label>Email</otp-label>
  <input otp-input [formControl]="email" />
</otp-form-field>
```

The `otp-form-field` host receives the `disabled` CSS class automatically.

### Multiple form fields in a reactive form

```ts
form = new FormGroup({
  firstName: new FormControl('', [Validators.required]),
  lastName: new FormControl('', [Validators.required]),
  email: new FormControl('', [Validators.required, Validators.email]),
});
```

```html
<form [formGroup]="form">
  <otp-form-field>
    <otp-label>First name</otp-label>
    <input otp-input formControlName="firstName" />
    <otp-error>First name is required</otp-error>
  </otp-form-field>

  <otp-form-field>
    <otp-label>Last name</otp-label>
    <input otp-input formControlName="lastName" />
    <otp-error>Last name is required</otp-error>
  </otp-form-field>

  <otp-form-field>
    <otp-label>Email</otp-label>
    <input otp-input formControlName="email" type="email" />
    <otp-error>Enter a valid email address</otp-error>
    <otp-hint>We'll never share your email</otp-hint>
  </otp-form-field>
</form>
```
