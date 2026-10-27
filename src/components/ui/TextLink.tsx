import { Link, type Href } from 'expo-router';

import Text from './Text';

export default function TextLink({ href, children }: { href: Href; children: string }) {
  return (
    <Link href={href}>
      <Text variant="small" style={{ fontWeight: '600', textDecorationLine: 'underline' }}>
        {children}
      </Text>
    </Link>
  );
}
