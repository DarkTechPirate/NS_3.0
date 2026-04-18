# Themed Modal Components - Usage Guide

## Overview
Three new reusable modal components have been created to replace default browser `alert()` calls. They match your theme with pink/amber colors, custom icons, and smooth animations.

## Components

### 1. **AlertModal** (Simple message)
For success/error/warning messages with a single OK button.

```jsx
import { AlertModal } from '../components/Modal';

const [alertModal, setAlertModal] = useState({ 
  isOpen: false, 
  title: '', 
  message: '', 
  variant: 'default' 
});

// Show success message
setAlertModal({
  isOpen: true,
  title: 'Success!',
  message: 'Interest expressed successfully! They have been notified.',
  variant: 'success', // 'error', 'warning', 'default'
});

// In JSX:
<AlertModal
  isOpen={alertModal.isOpen}
  onClose={() => setAlertModal({ ...alertModal, isOpen: false })}
  title={alertModal.title}
  message={alertModal.message}
  variant={alertModal.variant}
  buttonText="Got it"
/>
```

### 2. **ConfirmModal** (Confirmation dialog)
For confirm/cancel actions (delete, proceed, etc.)

```jsx
import { ConfirmModal } from '../components/Modal';

const [confirm, setConfirm] = useState({ isOpen: false });

// Show confirmation
setConfirm({ isOpen: true });

<ConfirmModal
  isOpen={confirm.isOpen}
  onClose={() => setConfirm({ isOpen: false })}
  title="Delete Profile?"
  message="Are you sure you want to delete this profile? This action cannot be undone."
  confirmText="Delete"
  cancelText="Cancel"
  variant="error"
  loading={isDeleting}
  onConfirm={async () => {
    // Handle confirmation
    await deleteProfile();
  }}
/>
```

### 3. **Modal** (Custom content)
For complex modals with custom content and footer buttons.

```jsx
import { Modal } from '../components/Modal';

<Modal
  isOpen={isOpen}
  onClose={onClose}
  title="Edit Profile"
  size="lg" // 'sm', 'md', 'lg'
  variant="default" // 'error', 'success', 'warning'
  footer={
    <div className="flex gap-3">
      <button onClick={onClose}>Cancel</button>
      <button onClick={handleSave}>Save</button>
    </div>
  }
>
  <p>Custom content goes here</p>
</Modal>
```

## Variants

Each modal supports these variants:
- **default**: Neutral (light gray header)
- **error**: Red accent (for errors/deletions)
- **success**: Green accent (for successful actions)
- **warning**: Amber accent (for warnings)

## Design Tokens Used

All components use your existing Tailwind theme:
- Primary color: `#be185d` (pink)
- Secondary: `#D12E68` (rajkumari)
- Backgrounds: `ivory` (#FFFCF9), `stone-paper` (#F7F5F0)
- Shadows: `soft` and `glow-pink` from config

## Migration Examples

### Before (Native alert)
```jsx
try {
  const res = await expressInterest(matchId);
  alert(res?.message || "Success!");
} catch (error) {
  alert("Error: " + error);
}
```

### After (Custom modal)
```jsx
const [alertModal, setAlertModal] = useState({ isOpen: false, title: '', message: '', variant: 'default' });

try {
  const res = await expressInterest(matchId);
  setAlertModal({
    isOpen: true,
    title: 'Interest Expressed',
    message: res?.message || "Success!",
    variant: 'success',
  });
} catch (error) {
  setAlertModal({
    isOpen: true,
    title: 'Error',
    message: error?.message || "Failed to express interest.",
    variant: 'error',
  });
}
```

## Files Using Alert (To Update)
1. ✅ **MemberDashboard.jsx** - Already updated
2. **ProfileCreation.jsx** - Needs update
3. **MatchDetailScreen.jsx** - Needs update
4. **Contact.jsx** - Needs update

## Tips
- Always keep modal state in component using `useState`
- Use appropriate variant for context (error for failures, success for achievements)
- Custom icons render automatically based on variant
- Click outside backdrop to close (unless disabled)
- All animations use Framer Motion compatible Tailwind classes
