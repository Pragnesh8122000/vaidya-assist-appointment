import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import SupportIcon from '@mui/icons-material/SupportAgent';

/**
 * Persistent support footer shown on every authenticated page.
 *
 * Contact details are centralized here so they're easy to reconfigure per
 * clinic deployment. Links are placeholders that can be wired to real routes
 * or external pages later (tracked as part of the Phase 3 trust/credibility work).
 */
export const CLINIC_CONTACT = {
  phone: '+91 00000 00000',
  email: 'support@vaidya.example',
};

const footerLinks = [
  { label: 'Privacy Policy', href: '#' },
  { label: 'Terms of Service', href: '#' },
  { label: 'FAQ', href: '#' },
  { label: 'Contact Us', href: '#' },
];

const Footer = () => (
  <Box
    component="footer"
    sx={{
      mt: 4,
      pt: 3,
      borderTop: 1,
      borderColor: 'divider',
      display: 'flex',
      flexDirection: { xs: 'column', sm: 'row' },
      alignItems: { xs: 'flex-start', sm: 'flex-start' },
      justifyContent: 'space-between',
      gap: 2,
    }}
  >
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <SupportIcon sx={{ fontSize: 18, color: 'primary.main' }} />
        <Typography variant="subtitle2" fontWeight={700}>Need help?</Typography>
      </Box>
      <Stack spacing={0.5}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PhoneIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
          <Link href={`tel:${CLINIC_CONTACT.phone.replace(/\s/g, '')}`} color="inherit" underline="hover" sx={{ fontSize: '0.875rem' }}>
            {CLINIC_CONTACT.phone}
          </Link>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <EmailIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
          <Link href={`mailto:${CLINIC_CONTACT.email}`} color="inherit" underline="hover" sx={{ fontSize: '0.875rem' }}>
            {CLINIC_CONTACT.email}
          </Link>
        </Box>
      </Stack>
    </Box>

    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: { xs: 'flex-start', sm: 'flex-end' }, gap: 0.75 }}>
      <Box sx={{ display: 'flex', gap: 2.5, flexWrap: 'wrap' }}>
        {footerLinks.map((link) => (
          <Link key={link.label} href={link.href} color="text.secondary" underline="hover" sx={{ fontSize: '0.8125rem' }}>
            {link.label}
          </Link>
        ))}
      </Box>
      <Typography variant="caption" color="text.secondary">
        © {new Date().getFullYear()} Vaidya Patient Portal. Your data is encrypted and secure.
      </Typography>
    </Box>
  </Box>
);

export default Footer;