import Button from '@/components/ui/Button';
import { useTheme } from '@/providers/theme/ThemeProvider';

// Domain-free: just flips light/dark via ThemeProvider.
export default function ThemeToggle() {
  const { scheme, toggleMode } = useTheme();
  return (
    <Button
      variant="outline"
      title={scheme === 'dark' ? 'Switch to light' : 'Switch to dark'}
      onPress={toggleMode}
    />
  );
}
